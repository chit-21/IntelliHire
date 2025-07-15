"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Interview type definition
interface Interview {
  id: string;
  role?: string;
  type?: string;
  createdAt?: any;
  status?: string;
  techStack?: string[];
  score?: number | null;
  [key: string]: any;
}

// Tech stack options (can be expanded)
const TECH_STACK_OPTIONS = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Other'
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // Interview form state
  const [form, setForm] = useState({
    type: '',
    role: '',
    years: '',
    numQuestions: '',
    techStack: [] as string[],
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'interviews'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInterviews(data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        techStack: checked
          ? [...prev.techStack, value]
          : prev.techStack.filter((t) => t !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!form.type) errors.type = 'Interview type is required.';
    if (!form.role) errors.role = 'Role/Position is required.';
    if (!form.years) errors.years = 'Years of experience is required.';
    if (!form.numQuestions) errors.numQuestions = 'Number of questions is required.';
    if (form.techStack.length === 0) errors.techStack = 'Select at least one tech stack.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;
    if (!user) {
      setSubmitError('User not authenticated.');
      return;
    }
    setSubmitting(true);
    try {
      // Call Gemini API route
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: form.role,
          type: form.type,
          years: form.years,
          numQuestions: form.numQuestions,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions) {
        throw new Error(data.error || 'Failed to generate questions');
      }
      // Store interview in Firestore
      await addDoc(collection(db, 'interviews'), {
        userId: user.uid,
        role: form.role,
        type: form.type,
        years: form.years,
        numQuestions: form.numQuestions,
        techStack: form.techStack,
        createdAt: Timestamp.now(),
        questions: data.questions,
        score: null,
        feedback: null,
        status: 'Pending',
      });
      setShowModal(false);
      setForm({ type: '', role: '', years: '', numQuestions: '', techStack: [] });
      // Refresh interviews
      if (user) {
        setLoading(true);
        const q = query(
          collection(db, 'interviews'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInterviews(data);
        setLoading(false);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create interview');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchFeedback = async (interviewId: string) => {
    setFeedbackLoading(true);
    try {
      const feedbackRef = doc(db, 'interviews', interviewId, 'feedback', 'analysis');
      const feedbackSnap = await getDoc(feedbackRef);
      if (feedbackSnap.exists()) {
        setSelectedFeedback(feedbackSnap.data());
        setShowFeedbackModal(true);
      } else {
        alert('Feedback is not available for this interview yet. Please complete the interview or try again later.');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      alert('Failed to load feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-800 mb-2">Dashboard</h1>
              <p className="text-lg text-gray-600">Welcome, <span className="font-semibold text-blue-700">{user?.email}</span></p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-colors text-lg flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Interview
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow"
              >
                Sign Out
              </button>
            </div>
            <div className="w-full">
              {loading ? (
                <div className="text-center text-blue-500 py-12 text-xl font-semibold">Loading interviews...</div>
              ) : interviews.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-lg">No interviews found. Click 'Create Interview' to get started!</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow flex flex-col gap-2 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-blue-700">{interview.role || 'Role not set'}</span>
                        <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">{interview.type || 'N/A'}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Created: {interview.createdAt?.toDate ? interview.createdAt.toDate().toLocaleString() : 'N/A'}</div>
                      <div className="flex flex-wrap gap-2 mb-1">
                        {/* Tech stack icons will be added later */}
                        {interview.techStack && interview.techStack.length > 0 && interview.techStack.map((tech: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{tech}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">Status: {interview.status || 'Pending'}</span>
                        <span className="text-xs text-gray-500">Score: {interview.score ? `${interview.score}%` : 'N/A'}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {interview.status === 'Completed' ? (
                          <>
                            <button
                              className="flex-1 px-3 py-2 rounded bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                              onClick={() => fetchFeedback(interview.id)}
                              disabled={feedbackLoading}
                            >
                              {feedbackLoading ? 'Loading...' : 'View Feedback'}
                            </button>
                            <button
                              className="flex-1 px-3 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                              onClick={() => router.push(`/dashboard/interview/${interview.id}`)}
                            >
                              Take Again
                            </button>
                          </>
                        ) : (
                          <button
                            className="w-full px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                            onClick={() => router.push(`/dashboard/interview/${interview.id}`)}
                          >
                            Take Interview
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Modal for Create Interview */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Create New Interview</h2>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Interview Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select type</option>
                    <option value="Technical">Technical</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                  {formErrors.type && <div className="text-red-500 text-xs mt-1">{formErrors.type}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role / Position</label>
                  <input
                    type="text"
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="e.g. Frontend Developer"
                  />
                  {formErrors.role && <div className="text-red-500 text-xs mt-1">{formErrors.role}</div>}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience</label>
                    <select
                      name="years"
                      value={form.years}
                      onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Select</option>
                      <option value="0-1">0-1</option>
                      <option value="2-3">2-3</option>
                      <option value="4-6">4-6</option>
                      <option value="7+">7+</option>
                    </select>
                    {formErrors.years && <div className="text-red-500 text-xs mt-1">{formErrors.years}</div>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">No. of Questions</label>
                    <select
                      name="numQuestions"
                      value={form.numQuestions}
                      onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">Select</option>
                      <option value="3">3</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                    {formErrors.numQuestions && <div className="text-red-500 text-xs mt-1">{formErrors.numQuestions}</div>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tech Stack</label>
                  <div className="flex flex-wrap gap-2">
                    {TECH_STACK_OPTIONS.map((tech) => (
                      <label key={tech} className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg cursor-pointer text-blue-700 text-xs font-medium">
                        <input
                          type="checkbox"
                          name="techStack"
                          value={tech}
                          checked={form.techStack.includes(tech)}
                          onChange={handleFormChange}
                          className="accent-blue-600"
                        />
                        {tech}
                      </label>
                    ))}
                  </div>
                  {formErrors.techStack && <div className="text-red-500 text-xs mt-1">{formErrors.techStack}</div>}
                </div>
                {submitError && <div className="text-red-500 text-center text-sm mb-2">{submitError}</div>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-colors text-lg mt-2 disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Interview'}
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Feedback Modal */}
        {showFeedbackModal && selectedFeedback && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10"
            onClick={() => {
              setShowFeedbackModal(false);
              setSelectedFeedback(null);
              router.push('/dashboard');
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto relative animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedFeedback(null);
                  router.push('/dashboard');
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-blue-700 mb-6">Interview Feedback & Analysis</h2>
              
              {/* Overall Score */}
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Overall Performance</h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-blue-600">{selectedFeedback.overallScore}%</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${selectedFeedback.overallScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Feedback */}
              <div className="space-y-6">
                {selectedFeedback.questionFeedback?.map((qf: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Question {index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Score:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                          {qf.score}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Question:</h5>
                        <p className="text-gray-800 bg-gray-50 p-3 rounded">{qf.question}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Your Answer:</h5>
                        <p className="text-gray-800 bg-blue-50 p-3 rounded">{qf.answer}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Better Answer:</h5>
                        <p className="text-gray-800 bg-green-50 p-3 rounded border-l-4 border-green-500">{qf.betterAnswer}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-700 mb-2">Feedback:</h5>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded">{qf.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall Feedback */}
              <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Overall Feedback:</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedFeedback.overallFeedback}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold shadow hover:bg-gray-300 transition-colors text-sm"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedFeedback(null);
                    router.push('/dashboard');
                  }}
                  aria-label="Close Feedback Modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}