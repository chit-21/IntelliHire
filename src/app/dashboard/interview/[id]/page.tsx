"use client";

import React from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import { toast } from 'react-hot-toast';
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import Webcam from "react-webcam";
import { useAuth } from '@/contexts/AuthContext';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function InterviewPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const answerBoxRef = useRef<HTMLDivElement>(null);
  const recordingBoxRef = useRef<HTMLUListElement>(null);

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

  // Auto scroll to bottom when new content is added
  useEffect(() => {
    if (answerBoxRef.current) {
      answerBoxRef.current.scrollTop = answerBoxRef.current.scrollHeight;
    }
    if (recordingBoxRef.current) {
      recordingBoxRef.current.scrollTop = recordingBoxRef.current.scrollHeight;
    }
  }, [currentTranscript, results]);

  const handleRecordAnswer = () => {
    if (isRecording) {
      stopSpeechToText();
      // handleShowAnswer();
    const fullTranscript = results
      .filter((result) => typeof result === 'object' && 'transcript' in result)
      .map((result: any) => result.transcript)
      .join(' ')
      .trim();
    setCurrentTranscript(fullTranscript);
    results.length=0;
      
    } else {
      setCurrentTranscript('');
      results.length=0;
      startSpeechToText();
    }
  };



  const clearRecording = () => {
    // setCurrentTranscript('');
    results.length = 0;
    if (isRecording) {
      stopSpeechToText();
    }
    // @ts-ignore - Clear results array
    
  };

  const handleSubmitAnswer = async () => {
    if (!currentTranscript.trim()) {
      toast.error('Please record your answer before proceeding.');
      return;
    }

    setSubmitting(true);
    try {
      // Get current question text
      const currentQuestion = questions[currentQ];
      
      // Save answer to subcollection
      await saveAnswer(currentQ, currentQuestion, currentTranscript);

      // Clear recording and transcript
      clearRecording();
      
      // If last question, generate feedback and update interview status
      if (currentQ === questions.length - 1) {
        // Fetch all answers for feedback generation
        const answersData = await fetchAllAnswers();
        // Check for empty answers
        if (answersData.some(ans => !ans.trim())) {
          toast.error('Please answer all questions before submitting the interview.');
          setSubmitting(false);
          return;
        }
        // Generate feedback using Gemini API
        try {
          const feedbackData = await generateFeedback(questions, answersData);
          // Save feedback to subcollection
          await saveFeedback(feedbackData);
          // Update interview status with score
          await updateDoc(doc(db, 'interviews', id), {
            status: 'Completed',
            completedAt: new Date().toISOString(),
            score: feedbackData.overallScore
          });
          toast.success('Interview completed successfully! Redirecting to dashboard...');
          if (user) {
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        } catch (err) {
          if (err instanceof Error) {
            toast.error('Failed to generate feedback: ' + err.message);
          } else {
            toast.error('Failed to generate feedback.');
          }
          setSubmitting(false);
          return;
        }
      } else {
        // Move to next question
        setCurrentQ((q) => Math.min(q + 1, questions.length - 1));
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save your answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveAnswer = async (questionIndex: number, question: string, answer: string) => {
    const ref = doc(db, "interviews", id, "answers", String(questionIndex));
    await setDoc(ref, {
      question,
      answer,
      timestamp: new Date().toISOString()
    });
  };

  const fetchAllAnswers = async () => {
    const answers: string[] = [];
    for (let i = 0; i < questions.length; i++) {
      const answerRef = doc(db, "interviews", id, "answers", String(i));
      const answerSnap = await getDoc(answerRef);
      if (answerSnap.exists()) {
        answers.push(answerSnap.data().answer);
      } else {
        answers.push(''); // Fallback for missing answers
      }
    }
    return answers;
  };

  const generateFeedback = async (questions: string[], answers: string[]) => {
    const response = await fetch('/api/gemini/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questions,
        answers,
        role: interview.role,
        type: interview.type
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate feedback');
    }
    
    return await response.json();
  };

  const saveFeedback = async (feedbackData: any) => {
    const feedbackRef = doc(db, "interviews", id, "feedback", "analysis");
    await setDoc(feedbackRef, {
      ...feedbackData,
      timestamp: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-green-600 text-xl font-bold">Loading interview...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-red-500 text-lg font-semibold">{error}</div>
      </div>
    );
  }
  if (!interview) return null;

  const questions = interview.questions || [];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-50 to-green-100 py-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(34,197,94,0.15)] hover:shadow-[0_8px_32px_0_rgba(34,197,94,0.22)] transition-shadow duration-300 p-0 flex flex-col md:flex-row overflow-hidden max-h-[85vh]">
        {/* Left: Question Tabs and Navigation */}
        <div className="md:w-1/2 w-full bg-green-50 p-6 flex flex-col border-r border-green-100 overflow-hidden">
          <h1 className="text-xl font-extrabold text-green-800 mb-3">{interview.role}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-200 text-green-800">{interview.type}</span>
            {interview.techStack && interview.techStack.map((tech: string, idx: number) => (
              <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{tech}</span>
            ))}
          </div>
          <div className="flex gap-1.5 mb-4">
            {questions.map((_: string, idx: number) => (
              <button
                key={idx}
                className={`rounded-full w-7 h-7 flex items-center justify-center font-bold text-white transition-all ${idx === currentQ ? 'bg-green-600 scale-110 shadow-lg' : 'bg-green-300'}`}
                onClick={() => setCurrentQ(idx)}
                disabled={idx > currentQ}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <div className="text-base font-semibold text-green-700 mb-2">Question {currentQ + 1} of {questions.length}</div>
            <div className="text-gray-800 text-lg bg-white rounded-lg p-4 shadow mb-4 flex-1 overflow-y-auto">
              {questions[currentQ]}
            </div>
            <button
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow self-end disabled:bg-green-400 disabled:cursor-not-allowed text-sm"
              onClick={handleSubmitAnswer}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : currentQ === questions.length - 1 ? 'Submit Interview' : 'Submit & Next'}
            </button>
          </div>
        </div>
        {/* Right: Webcam, Record, Transcript */}
        <div className="md:w-1/2 w-full p-8 flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-green-300 overflow-y-auto">
          <div className="w-full flex flex-col items-center">
            <div className="bg-black w-full max-w-lg aspect-video flex items-center justify-center rounded-xl mb-6 shadow-[0_4px_12px_0_rgba(34,197,94,0.25)]">
              {isRecording ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  className="rounded-xl shadow-lg w-full max-w-md aspect-video"
                />
              ) : (
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="50" fill="#F3F4F6" />
                  <circle cx="60" cy="60" r="30" fill="#22C55E" />
                  <circle cx="60" cy="60" r="15" fill="#16A34A" />
                  <circle cx="60" cy="60" r="6" fill="#fff" />
                  <circle cx="90" cy="35" r="5" fill="#EF4444" />
                </svg>
              )}
            </div>
            <button
              className="mb-4 px-4 py-2 rounded bg-white/90 backdrop-blur-sm text-gray-800 font-semibold shadow-[0_2px_8px_0_rgba(34,197,94,0.15)] hover:shadow-[0_4px_12px_0_rgba(34,197,94,0.25)] hover:bg-white transition-all"
              onClick={handleRecordAnswer}
            >
              {isRecording ? 'Stop Recording' : 'Record Answer'}
            </button>
            {/* <button
              className="mb-4 px-4 py-2 rounded bg-green-600 text-white font-semibold shadow-[0_2px_8px_0_rgba(34,197,94,0.25)] hover:shadow-[0_4px_12px_0_rgba(34,197,94,0.35)] hover:bg-green-700 transition-all"
              onClick={handleShowAnswer}
              disabled={results.length === 0 && !interimResult}
            >
              Show Answer
            </button> */}
            <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-lg p-4 mt-2 shadow-[0_4px_12px_0_rgba(34,197,94,0.15)]">
              <p className="font-medium text-gray-700 mb-2">Current Answer:</p>
              <div 
                ref={answerBoxRef}
                className="text-gray-800 max-h-[3.6em] overflow-y-auto scroll-smooth"
                style={{
                  lineHeight: '1.8em',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#22C55E transparent'
                }}
              >
                {currentTranscript || 'No answer recorded yet'}
              </div>
            </div>
            {isRecording && (
              <ul 
                ref={recordingBoxRef}
                className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-lg p-4 mt-4 shadow-[0_4px_12px_0_rgba(34,197,94,0.15)] max-h-[3.6em] overflow-y-auto scroll-smooth"
                style={{
                  lineHeight: '1.8em',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#22C55E transparent'
                }}
              >
                {results.filter((result) => typeof result === 'object' && 'transcript' in result && 'timestamp' in result).map((result: any) => (
                  <li key={result.timestamp} className="text-gray-800">{result.transcript}</li>
                ))}
                {interimResult && <li className="text-gray-500">{interimResult}</li>}
              </ul>
            )}
            {speechError && <p className="text-red-500 mt-4">Web Speech API is not available in this browser 🤷‍</p>}
          </div>
        </div>
      </div>
    </div>
  );
}