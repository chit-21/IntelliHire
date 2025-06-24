"use client";
import { useRef } from "react";
import Agent from "@/components/Agent";
import InterviewDialog from "@/components/InterviewDialog";
import MyInterviews from "@/components/MyInterviews";

export default function Page() {
  const listRef = useRef<{ refresh: () => void } | null>(null);

  return (
    <div className="container mx-auto p-4">
      <h3 className="text-2xl font-bold mb-1">Interview generation</h3>
      <Agent userName="You" type="generate" />
      <div className="my-6">
        <InterviewDialog onInterviewCreated={() => listRef.current?.refresh()} />
      </div>
      <MyInterviews ref={listRef} />
    </div>
  );
}
