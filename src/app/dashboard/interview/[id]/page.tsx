"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Webcam from "react-webcam";

export default function InterviewPage({ params }: { params: { id: string } }) {
  // NOTE: In future Next.js, params will be a Promise and should be unwrapped with use(params). For now, use directly.
  const { id } = params;
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInterview = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "interviews", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInterview({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Interview not found.");
        }
      } catch (err: any) {
        setError("Failed to fetch interview.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-blue-600 text-xl font-bold">Loading interview...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
      </div>
    );
  }
  if (!interview) return null;

  const questions = interview.questions || [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 py-12">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-0 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Question Tabs */}
        <div className="md:w-1/2 w-full bg-blue-50 p-8 flex flex-col">
          <h1 className="text-2xl font-extrabold text-blue-800 mb-4">{interview.role}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-800">{interview.type}</span>
            {interview.techStack && interview.techStack.map((tech: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{tech}</span>
            ))}
          </div>
          <div className="flex gap-2 mb-6">
            {questions.map((_: string, idx: number) => (
              <button
                key={idx}
                className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white transition-all ${idx === currentQ ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-blue-300'}`}
                onClick={() => setCurrentQ(idx)}
                disabled={idx > currentQ}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-lg font-semibold text-blue-700 mb-2">Question {currentQ + 1} of {questions.length}</div>
            <div className="text-gray-800 text-xl bg-white rounded-lg p-6 shadow mb-4 min-h-[80px] flex items-center">
              {questions[currentQ]}
            </div>
            <button
              className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow self-end"
              onClick={() => setCurrentQ((q) => Math.min(q + 1, questions.length - 1))}
              disabled={currentQ === questions.length - 1}
            >
              Submit & Next
            </button>
          </div>
        </div>
        {/* Right: Webcam & Controls */}
        <div className="md:w-1/2 w-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
          {!webcamEnabled ? (
            <button
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-colors text-lg mb-6"
              onClick={() => setWebcamEnabled(true)}
            >
              Enable Microphone & Webcam
            </button>
          ) : (
            <>
              <Webcam
                audio={true}
                ref={webcamRef}
                className="rounded-xl shadow-lg w-full max-w-md aspect-video mb-4"
              />
              <button className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow mb-2">
                Record Answer
              </button>
              <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow">
                Submit Answer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 