"use client";
import { useParams } from "next/navigation";
import Agent from "@/components/Agent";

export default function InterviewViewPage() {
  const params = useParams();
  const interviewId = Array.isArray(params.interviewId) ? params.interviewId[0] : params.interviewId;

  if (!interviewId) return <div>Interview not found.</div>;

  return (
    <div className="container">
      <Agent interviewId={interviewId} />
    </div>
  );
} 