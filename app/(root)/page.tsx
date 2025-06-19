import InterviewDialog from '@/components/InterviewDialog';
import Link from "next/link";
import ClientImage from '@/components/ClientImage';
import { dummyInterviews } from '@/constants';
import InterviewCard from '@/components/InterviewCard';
import { getCurrentUser, getInterviewByUserId, getLatestInetrview } from '@/lib/actions/auth.action';
import { type Interview } from '@/types';

export default async function Page() {
  const user = await getCurrentUser();
  const userInterview = user?.id ? await getInterviewByUserId(user.id) : [];
  const latestInterviews = user?.id ? await getLatestInetrview({ userId: user.id }) : [];

  const userInterviewArr = userInterview ?? [];
  const latestInterviewsArr = latestInterviews ?? [];

  const hasPastInterview = userInterviewArr.length > 0;
  const hasLatestInterviews = latestInterviewsArr.length > 0;

  return (
    <div>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>
          <InterviewDialog />
        </div>
        <ClientImage
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterview ? (
            userInterviewArr.map((interview: Interview) => (
              <InterviewCard interviewId={''} {...interview} key={interview.id} />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          {hasLatestInterviews ? (
            latestInterviewsArr.map((interview: Interview) => (
              <InterviewCard interviewId={''} {...interview} key={interview.id} />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </div>
  );
}
