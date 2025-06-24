"use client"
import React, { useEffect, useState } from 'react'
import Image from "next/image";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import { db } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";

interface AgentProps {
  interviewId: string;
}

interface InterviewData {
  jobPosition: string;
  jobDescription: string;
  jobExperience: string;
}

const Agent = ({ interviewId }: AgentProps) => {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;
      const docRef = doc(db, "interviews", interviewId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setInterviewData({
          jobPosition: data.role || "",
          jobDescription: (data.techstack || []).join(", "),
          jobExperience: data.level || "",
        });
      }
    };
    fetchInterview();
  }, [interviewId]);

  return (
    <div className="pattern bg-[url('/pattern.png')] bg-top bg-no-repeat rounded-2xl p-0 min-h-[60vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-row w-4/5 max-w-6xl gap-20 items-center justify-center mt-2 mb-2">
        {/* Left: Job Info */}
        <div className="flex flex-col justify-center items-center flex-1">
          <div className="card-interview p-8 rounded-2xl shadow-xl w-[410px] h-[420px] flex flex-col items-center">
            <h2 className="text-3xl font-bold text-primary-200 mb-4 text-center tracking-wide">Interview Details</h2>
            <div className="flex flex-1 flex-col justify-between w-full py-2">
              <div>
                <span className="font-semibold text-primary-200 text-lg">Job Role/Job Position:</span>
                <span className="ml-2 text-light-100 text-lg">{interviewData?.jobPosition || <span className='italic text-gray-400 text-lg'>Not specified</span>}</span>
              </div>
              <div>
                <span className="font-semibold text-primary-200 text-lg">Job Description/Tech Stack:</span>
                <span className="ml-2 text-light-100 text-lg">{interviewData?.jobDescription || <span className='italic text-gray-400 text-lg'>Not specified</span>}</span>
              </div>
              <div>
                <span className="font-semibold text-primary-200 text-lg">Years of Experience:</span>
                <span className="ml-2 text-light-100 text-lg">{interviewData?.jobExperience || <span className='italic text-gray-400 text-lg'>Not specified</span>}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Right: Webcam */}
        <div className="flex flex-col justify-center items-center flex-1">
          <div className="card-interview p-8 rounded-2xl shadow-xl w-[410px] h-[420px] flex flex-col items-center">
            <h2 className="text-2xl font-bold text-primary-200  text-center tracking-wide">Webcam Preview</h2>
            {webCamEnabled ? (
              <Webcam
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => setWebCamEnabled(false)}
                mirrored={true}
                style={{ height: 200, width: 200, borderRadius: '1rem', background: '#222' }}
              />
            ) : (
              <>
                <div className="h-[400px] mb-1 border border-dashed border-primary-200 rounded-xl w-full flex items-center justify-center bg-dark-200 text-light-100 text-xl overflow-y-auto">
                  Webcam Preview
                </div>
                <Button
                  className="w-full mt-2 btn-primary"
                  variant="default"
                  onClick={() => setWebCamEnabled(true)}
                >
                  Enable Web Cam and Microphone
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent;
