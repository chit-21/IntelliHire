"use client";

import React from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import Webcam from "react-webcam";

// Add type for SpeechRecognition
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export default function InterviewPage({ params }: { params: { id: string } }) {
  // NOTE: In future Next.js, params will be a Promise and should be unwrapped with use(params). For now, use directly.
  const { id } = params;
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const {
    error: speechError,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

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

  const handleRecordAnswer = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const handleShowAnswer = () => {
    const fullTranscript = [
      ...results.filter((result) => typeof result === 'object' && 'transcript' in result).map((result: any) => result.transcript),
      interimResult || ''
    ].join(' ').trim();
    setCurrentTranscript(fullTranscript);
  };

  const saveAnswer = async (questionIndex: number, question: string, answer: string) => {
    const ref = doc(db, "interviews", id, "answers", String(questionIndex));
    await setDoc(ref, {
      question,
      answer,
      timestamp: new Date().toISOString()
    });
  };

  const handleSubmitAnswer = async () => {
    if (!currentTranscript.trim()) {
      alert('Please record your answer before proceeding.');
      return;
    }

    setSubmitting(true);
    try {
      // Get current question text
      const currentQuestion = questions[currentQ];
      
      // Save answer to subcollection
      await saveAnswer(currentQ, currentQuestion, currentTranscript);

      // Update local state
      setAnswers((prev) => {
        const updated = [...prev];
        updated[currentQ] = currentTranscript;
        return updated;
      });

      // Clear transcript
      setCurrentTranscript('');
      
      // If last question, update interview status
      if (currentQ === questions.length - 1) {
        await updateDoc(doc(db, 'interviews', id), {
          status: 'Completed',
          completedAt: new Date().toISOString()
        });
        alert('Interview completed successfully! Redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        // Move to next question
        setCurrentQ((q) => Math.min(q + 1, questions.length - 1));
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Failed to save your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
        {/* Left: Question Tabs and Navigation */}
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
              className="mt-4 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow self-end disabled:bg-blue-400 disabled:cursor-not-allowed"
              onClick={handleSubmitAnswer}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : currentQ === questions.length - 1 ? 'Submit Interview' : 'Submit & Next'}
            </button>
          </div>
        </div>
        {/* Right: Webcam, Record, Transcript */}
        <div className="md:w-1/2 w-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
          <div className="w-full flex flex-col items-center">
            <div className="bg-black w-full max-w-lg aspect-video flex items-center justify-center rounded-xl mb-6">
              {isRecording ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  className="rounded-xl shadow-lg w-full max-w-md aspect-video"
                />
              ) : (
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="50" fill="#F3F4F6" />
                  <circle cx="60" cy="60" r="30" fill="#60A5FA" />
                  <circle cx="60" cy="60" r="15" fill="#2563EB" />
                  <circle cx="60" cy="60" r="6" fill="#fff" />
                  <circle cx="90" cy="35" r="5" fill="#EF4444" />
                </svg>
              )}
            </div>
            <button
              className="mb-4 px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold shadow"
              onClick={handleRecordAnswer}
            >
              {isRecording ? 'Stop Recording' : 'Record Answer'}
            </button>
            <button
              className="mb-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow"
              onClick={handleShowAnswer}
              disabled={results.length === 0 && !interimResult}
            >
              Show Answer
            </button>
            <div className="w-full max-w-lg bg-white rounded p-4 mt-2 shadow">
              <p className="font-medium text-gray-700 mb-2">Current Answer:</p>
              <p className="text-gray-800">{currentTranscript || 'No answer recorded yet'}</p>
            </div>
            {isRecording && (
              <ul className="w-full max-w-lg bg-white rounded p-4 mt-2 shadow">
                {results.filter((result) => typeof result === 'object' && 'transcript' in result && 'timestamp' in result).map((result: any) => (
                  <li key={result.timestamp} className="text-gray-800">{result.transcript}</li>
                ))}
                {interimResult && <li className="text-gray-500">{interimResult}</li>}
              </ul>
            )}
            {speechError && <p className="text-red-500">Web Speech API is not available in this browser 🤷‍</p>}
          </div>
        </div>
      </div>
    </div>
  );
}