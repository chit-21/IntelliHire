import { Button } from '@/components/ui/button'

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { dummyInterviews } from '@/constants';
import InterviewCard from '@/components/InterviewCard';
import { getCurrentUser, getInterviewByUserId, getLatestInetrview } from '@/lib/actions/auth.action';



const page = async() => {
  const user=await getCurrentUser();

  const [userInterview,latestInterviews]= await Promise.all([
    user?.id ? getInterviewByUserId(user.id) : Promise.resolve([]),
    user?.id ? getLatestInetrview({userId:user.id}) : Promise.resolve([])
  ])
  

  const hasPastInterview=userInterview?.length!>0;
  const hasLatestInterviews = latestInterviews?.length!>0;

  
  return (
    <div>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
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
          {
            hasPastInterview?(
              userInterview?.map((interview)=>(
                <InterviewCard interviewId={''} {...interview} key={interview.id}  />
            ))
            ):(
              <p>You haven&apos;t taken any interviews yet</p>
            )
          }
          
        </div>
        
      </section>

          


      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>

        <div className="interviews-section">
          {
        hasLatestInterviews?(
              latestInterviews?.map((interview)=>(
                <InterviewCard interviewId={''} {...interview} key={interview.id}  />
            ))
            ):(
              <p>There are no interviews available</p>
            )
          }
        </div>
        
      </section>
    </div>
  );
}

export default page
