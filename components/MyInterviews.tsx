"use client";
import useSWR, { mutate as globalMutate } from "swr";
import InterviewCard from "./InterviewCard";

interface Interview {
  id: string;
  role: string;
  techstack: string[];
  level: string;
  createdAt: string;
  userId: string;
  type?: string;
}

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(res => res.json());

export function mutateInterviews() {
  globalMutate("/api/interview/list");
}

export default function MyInterviews() {
  const { data, isLoading } = useSWR("/api/interview/list", fetcher, { refreshInterval: 0 });
  const interviews: Interview[] = data?.interviews || [];

  if (isLoading) return <div>Loading your interviews...</div>;
  if (!interviews.length) return <></>;

  return (
    <div className="flex flex-wrap gap-4">
      {interviews.map((interview) => (
        <InterviewCard
          key={interview.id}
          interviewId={interview.id}
          userId={interview.userId}
          role={interview.role}
          type={interview.type || ""}
          techstack={interview.techstack}
          createdAt={interview.createdAt}
        />
      ))}
    </div>
  );
} 