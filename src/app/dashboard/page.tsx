"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/authService';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FiSearch, FiUser } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import Image from 'next/image';
import HeroBackground from '@/components/ui/HeroBackground';

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

// Hero Section
function HeroSection({ userEmail, onCreateInterview }: { userEmail?: string; onCreateInterview: () => void }) {
  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-green-100 h-[350px] flex items-center mt-3"> {/* Slightly increased height */}
      {/* SVG Background */}
      <HeroBackground className="opacity-90" />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/5 to-green-800/5"></div>
      {/* Content */}
      <div className="relative z-10 w-full px-4 py-8 lg:pl-12 lg:pr-18 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center justify-center">
          <div className="space-y-4">
            <div className="flex flex-col h-full justify-between pt-2 pb-4"> {/* Reduced top padding, full height, spaced content */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">Welcome Back!</h2>
                <p className="text-lg text-white/95 font-medium">Hello, Mate</p>
                <div className="mt-2 text-base text-white/85 space-y-1">
                  <p>Ready to ace your next interview? Create a new session and practice with our AI-powered questions tailored just for you.</p>
                  <p>Track your progress, get instant feedback, and improve your skills with realistic mock interviews.</p>
                  <p>Supports technical, behavioral, and custom interview types for all experience levels.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/95 backdrop-blur-sm text-green-700 hover:bg-green-700 hover:text-white shadow-xl hover:shadow-2xl text-base px-6 py-2 h-auto font-bold transition-colors transition-transform duration-300 border-2 border-white/30 hover:border-white/50 self-start transform hover:scale-105" 
                  onClick={onCreateInterview}
                >
                  + Create Interview
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center h-full relative w-full max-w-xs mx-auto mr-2 lg:mr-12"> {/* Shifted further right */}
              {/* Tech tags */}
              <Image src="/css.png" alt="CSS" width={58} height={58} className="absolute left-0 top-4 z-10 -rotate-12 animate-float-tag" />
              <Image src="/html.png" alt="HTML" width={62} height={62} className="absolute left-2 bottom-2 z-10 animate-float-tag-delay-1" />
              <Image src="/js.png" alt="JS" width={66} height={66} className="absolute right-2 bottom-2 z-10 animate-float-tag-delay-2" />
              <Image src="/php.png" alt="PHP" width={64} height={65} className="absolute right-0 top-4 z-10 animate-float-tag-delay-3" />
              {/* Robot image */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20 flex items-center justify-center w-[220px] h-[220px] lg:w-[288px] lg:h-[288px] overflow-visible"> {/* Fixed smaller box, allow overflow */}
                <Image 
                  src="/robot.png" 
                  alt="AI Interview Assistant" 
                  width={440} 
                  height={440} 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[700px] lg:h-[700px] object-contain drop-shadow-2xl" 
                  style={{zIndex: 2}} 
                />
                {/* Overlay logo at center of laptop screen */}
                <Image
                  src="/logos.png"
                  alt="IntelliHire Logo Center"
                  width={40}
                  height={40}
                  className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-18 lg:h-14"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// Interview Card
function InterviewCard({ interview, createdAt, onViewFeedback, onTakeAgain, onTakeInterview, feedbackLoading }: any) {
  const status = interview.status || 'Pending';
  const progress = interview.score !== null && interview.score !== undefined ? interview.score : undefined;
  // Color for status
  const statusColor = status === 'Completed'
    ? 'text-green-700'
    : status === 'Pending'
      ? 'text-yellow-600'
      : 'text-blue-700';
  // Color for tech stack capsules
  const techStackClass = 'px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold';
  // Button class for dark green
  const buttonClass = 'bg-green-700 hover:bg-green-800 text-white font-semibold';
  return (
    <Card className="bg-green-100 shadow-[0_4px_24px_0_rgba(34,197,94,0.15)] hover:shadow-[0_8px_32px_0_rgba(34,197,94,0.22)] border border-green-200 h-full flex flex-col transition-all duration-300">
      <CardHeader className="space-y-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl text-foreground">{interview.role || 'Role not set'}</CardTitle>
          <span className="ml-2 px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">{interview.type || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Created: {createdAt}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {interview.techStack && interview.techStack.length > 0 && interview.techStack.map((tech: string) => (
            <span key={tech} className={techStackClass}>{tech}</span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="space-y-2 flex-grow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Status:</span>
            <span className={`text-sm font-semibold ${statusColor}`}>{status}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium text-foreground">Interview Score:</span>
            <span className="text-sm font-medium text-foreground">{progress !== undefined && progress !== null ? progress : '-'}&#47;100</span>
          </div>
        </div>
        <div className="flex gap-2 pt-4 mt-auto">
          {status === 'Completed' && (
            <>
              <Button variant="default" className={`flex-1 ${buttonClass}`} onClick={onViewFeedback} disabled={feedbackLoading}>{feedbackLoading ? 'Loading...' : 'View Feedback'}</Button>
              <Button variant="default" className={`flex-1 ${buttonClass}`} onClick={onTakeAgain}>Take Again</Button>
            </>
          )}
          {status === 'Pending' && (
            <>
              <Button variant="default" className={`flex-1 ${buttonClass}`} onClick={onTakeInterview}>Take Interview</Button>
              <Button variant="outline" className="flex-1 opacity-50 cursor-not-allowed" disabled>No Feedback</Button>
            </>
          )}
          {status === 'In Progress' && (
            <>
              <Button variant="default" className={`flex-1 ${buttonClass}`} onClick={onTakeInterview}>Continue Interview</Button>
              <Button variant="outline" className="flex-1 opacity-50 cursor-not-allowed" disabled>No Feedback</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

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
  const [formattedDates, setFormattedDates] = useState<string[]>([]);

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

  useEffect(() => {
    if (interviews.length > 0) {
      setFormattedDates(
        interviews.map(i =>
          i.createdAt?.toDate ? i.createdAt.toDate().toLocaleString() : 'N/A'
        )
      );
    } else {
      setFormattedDates([]);
    }
  }, [interviews]);

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
      <div className="min-h-screen bg-background flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 flex flex-col">
          <div className="w-full flex justify-between items-center pt-6 mb-4">
            <div className="flex items-center gap-3">
              <Image src="/logos.png" alt="IntellHire Logo" width={56} height={56} className="w-19 h-14" />
              <h1 className="text-4xl font-bold text-green-800">IntelliHire</h1>
            </div>
            <Button onClick={handleSignOut} className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
              Sign Out
            </Button>
          </div>
          <HeroSection userEmail={user?.email || ''} onCreateInterview={() => setShowModal(true)} />
          <main className="flex-1 py-4">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Your Post Interviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {interviews.map((interview, idx) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  createdAt={formattedDates[idx] || 'N/A'}
                  onViewFeedback={() => fetchFeedback(interview.id)}
                  onTakeAgain={() => router.push(`/dashboard/interview/${interview.id}`)}
                  onTakeInterview={() => router.push(`/dashboard/interview/${interview.id}`)}
                  feedbackLoading={feedbackLoading}
                />
              ))}
            </div>
            {/* Featured Section */}
            <section className="mt-12 mb-16">
              <h2 className="text-3xl font-extrabold text-center text-green-900 mb-2">Why Choose Our Interview Platform?</h2>
              <p className="text-center text-gray-600 text-lg mb-10">Leverage cutting-edge AI technology to enhance your interview skills and land your dream job.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Row 1 */}
                <div className="bg-white rounded-2xl border border-green-100 p-8 flex flex-col items-center shadow-sm">
                  <div className="bg-green-700 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M12 7v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <h3 className="text-xl font-bold text-green-900 mb-2 text-center">AI-Powered Questions</h3>
                  <p className="text-gray-600 text-center">Advanced AI generates relevant, role-specific interview questions tailored to your experience level.</p>
                </div>
                <div className="bg-white rounded-2xl border border-green-100 p-8 flex flex-col items-center shadow-sm">
                  <div className="bg-green-700 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M12 8l4 4-4 4-4-4 4-4z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <h3 className="text-xl font-bold text-green-900 mb-2 text-center">Real-Time Feedback</h3>
                  <p className="text-gray-600 text-center">Get instant feedback on your responses with detailed analysis and improvement suggestions.</p>
                </div>
                <div className="bg-white rounded-2xl border border-green-100 p-8 flex flex-col items-center shadow-sm">
                  <div className="bg-green-700 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M4 17l6-6 4 4 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <h3 className="text-xl font-bold text-green-900 mb-2 text-center">Performance Analytics</h3>
                  <p className="text-gray-600 text-center">Track your progress over time with comprehensive performance metrics and skill assessments.</p>
                </div>
                {/* Row 2 */}
                <div className="bg-white rounded-2xl border border-green-100 p-8 flex flex-col items-center shadow-sm">
                  <div className="bg-green-700 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M17 20h5v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <h3 className="text-xl font-bold text-green-900 mb-2 text-center">Multiple Interview Types</h3>
                  <p className="text-gray-600 text-center">Practice behavioral, technical, and case study interviews across various domains and roles.</p>
                </div>
                <div className="bg-white rounded-2xl border border-green-100 p-8 flex flex-col items-center shadow-sm">
                  <div className="bg-green-700 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M12 17v-6m0 0V7m0 4h4m-4 0H8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <h3 className="text-xl font-bold text-green-900 mb-2 text-center">Secure & Private</h3>
                  <p className="text-gray-600 text-center">Your interview data is encrypted and stored securely. Complete privacy guaranteed.</p>
                </div>
                <div className="bg-white rounded-2xl border border-green-100 p-8 flex flex-col items-center shadow-sm">
                  <div className="bg-green-700 rounded-full p-3 mb-4"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M12 8v8m0 0l-3-3m3 3l3-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <h3 className="text-xl font-bold text-green-900 mb-2 text-center">Quick Setup</h3>
                  <p className="text-gray-600 text-center">Start practicing immediately with our streamlined interview creation process.</p>
                </div>
              </div>
            </section>
          </main>
        </div>
        {/* Modal for Create Interview */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-green-700 mb-4">Create New Interview</h2>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Interview Type</label>
                  <input
                    type="text"
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                    placeholder="e.g. Technical, Behavioral, Mixed"
                  />
                  {formErrors.type && <div className="text-red-500 text-xs mt-1">{formErrors.type}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role / Position</label>
                  <input
                    type="text"
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                    placeholder="e.g. Frontend Developer"
                  />
                  {formErrors.role && <div className="text-red-500 text-xs mt-1">{formErrors.role}</div>}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="text"
                      name="years"
                      value={form.years}
                      onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                      placeholder="e.g. 0-1, 2-3, 4-6, 7+"
                    />
                    {formErrors.years && <div className="text-red-500 text-xs mt-1">{formErrors.years}</div>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">No. of Questions</label>
                    <input
                      type="number"
                      name="numQuestions"
                      value={form.numQuestions}
                      onChange={handleFormChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                      placeholder="e.g. 5"
                      min={1}
                    />
                    {formErrors.numQuestions && <div className="text-red-500 text-xs mt-1">{formErrors.numQuestions}</div>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tech Stack</label>
                  <textarea
                    name="techStack"
                    value={form.techStack.join(", ")}
                    onChange={e => setForm(prev => ({ ...prev, techStack: e.target.value.split(/,|\n/) }))}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 min-h-[48px]"
                    placeholder="Type your tech stack, separated by commas or new lines (e.g. React, Node.js, Python)"
                  />
                  {formErrors.techStack && <div className="text-red-500 text-xs mt-1">{formErrors.techStack}</div>}
                </div>
                {submitError && <div className="text-red-500 text-center text-sm mb-2">{submitError}</div>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 transition-colors text-lg mt-2 disabled:opacity-60"
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
              <h2 className="text-2xl font-bold text-green-700 mb-6">Interview Feedback & Analysis</h2>
              
              {/* Overall Score */}
              <div className="bg-green-50 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Overall Performance</h3>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-green-600">{selectedFeedback.overallScore}%</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-500" 
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
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
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
                        <p className="text-gray-800 bg-green-50 p-3 rounded">{qf.answer}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Better Answer:</h5>
                        <p className="text-gray-800 bg-green-50 p-3 rounded border-l-4 border-green-500">{qf.betterAnswer}</p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Feedback:</h5>
                        <p className="text-gray-700 bg-green-50 p-3 rounded">{qf.feedback}</p>
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
      {/* Footer */}
      <footer className="bg-green-900 text-green-50 pt-12 pb-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">IntelliHire</h3>
            <p className="text-green-100 text-sm">Revolutionizing interview preparation with AI-powered practice sessions, real-time feedback, and personalized analytics.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Platform</h4>
            <ul className="space-y-1 text-green-100 text-sm">
              <li>Dashboard</li>
              <li>Create Interview</li>
              <li>Practice Sessions</li>
              <li>Analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Features</h4>
            <ul className="space-y-1 text-green-100 text-sm">
              <li>AI-Powered Interviews</li>
              <li>Real-Time Feedback</li>
              <li>Performance Analytics</li>
              <li>Secure & Private</li>
              <li>Multiple Interview Types</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Connect</h4>
            <div className="flex space-x-6 mt-2">
              {/* GitHub */}
              <a href="https://github.com/chit-21" aria-label="GitHub" target="_blank" rel="noopener noreferrer" className="hover:text-green-300">
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .267.18.577.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
              </a>
              {/* X (Twitter) */}
              <a href="https://x.com/schitranshu040" aria-label="X" target="_blank" rel="noopener noreferrer" className="hover:text-green-300">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 1200 1227"><path d="M714.6 541.1 1156.2 0h-105.1L670.2 464.7 332.2 0H0l463.2 658.6L0 1227h105.1l406.2-470.2 353.6 470.2H1200L714.6 541.1zm-143.7 166.3-47.1-65.3L134.8 80.7h151.2l273.2 378.7 47.1 65.3 399.7 553.2H854.8L570.9 707.4z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/singh__chitranshu" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-green-300">
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-5.25 2.25a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5z"/></svg>
              </a>
              {/* Email */}
              <a href="mailto:schitranshu040@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email" className="hover:text-green-300">
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13.065l-11.2-8.065h22.4l-11.2 8.065zm11.2-9.065h-22.4c-.442 0-.8.358-.8.8v16.4c0 .442.358.8.8.8h22.4c.442 0 .8-.358.8-.8v-16.4c0-.442-.358-.8-.8-.8zm-11.2 10.935l-11.2-8.065v14.13h22.4v-14.13l-11.2 8.065z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-green-200 text-sm mt-8">
           © 2025 IntelliHire. All rights reserved.
         </div>
      </footer>
    </ProtectedRoute>
  );
}