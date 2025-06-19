"use client";
import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { dummyInterviews } from '@/constants';
import InterviewCard from '@/components/InterviewCard';
import { getCurrentUser, getInterviewByUserId, getLatestInetrview } from '@/lib/actions/auth.action';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";
import { type Interview } from '@/types';

const Page = () => {
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInterview, setUserInterview] = useState<Interview[]>([]);
  const [latestInterviews, setLatestInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser();
      const [userInterviewData, latestInterviewsData] = await Promise.all([
        user?.id ? getInterviewByUserId(user.id) : Promise.resolve([]),
        user?.id ? getLatestInetrview({ userId: user.id }) : Promise.resolve([])
      ]);
      setUserInterview(userInterviewData ?? []);
      setLatestInterviews(latestInterviewsData ?? []);
    };
    fetchData();
  }, []);

  const hasPastInterview = userInterview?.length > 0;
  const hasLatestInterviews = latestInterviews?.length > 0;

  return (
    <div>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary max-sm:w-full">Start an Interview</Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] border-2 border-primary-200/50 shadow-2xl rounded-2xl p-0 overflow-hidden">
              <div className="pattern bg-[url('/pattern.png')] bg-top bg-no-repeat rounded-2xl p-0">
                <DialogHeader className="px-8 pt-8 pb-2">
                  <DialogTitle className="text-primary-200 text-2xl font-bold mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-8 bg-primary-200 rounded-full mr-2"></span>
                    Interview Details
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                  <form className="px-8 pb-8 flex flex-col gap-4">
                    <div>
                      <div className="text-base font-semibold mb-2 text-light-100">
                        Add details about your job position/role, job description, and years of experience
                      </div>
                      <div className="mt-7 my-3">
                        <label className="block mb-1 font-medium text-primary-200">Job Role/Job Position</label>
                        <Input
                          placeholder="Ex. Full Stack Developer"
                          required
                          className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200"
                          onChange={(e) => setJobPosition(e.target.value)}
                        />
                      </div>
                      <div className="my-3">
                        <label className="block mb-1 font-medium text-primary-200">Job Description/Tech Stack (In short)</label>
                        <Textarea
                          placeholder="Ex. React, Angular, NodeJs, MySql etc"
                          required
                          className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200"
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                      <div className="my-3">
                        <label className="block mb-1 font-medium text-primary-200">Years of Experience</label>
                        <Input
                          placeholder="Ex. 5"
                          type="number"
                          min="1"
                          max="70"
                          required
                          className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200"
                          onChange={(e) => setJobExperience(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-5 justify-end mt-4">
                      <Button type="button" variant="ghost" className="btn-secondary" onClick={() => setOpenDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="btn-primary min-w-32" disabled={loading}>
                        {loading ? (
                          <>
                            <LoaderCircle className="animate-spin" /> Generating from AI
                          </>
                        ) : (
                          'Start Interview'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogDescription>
              </div>
            </DialogContent>
          </Dialog>
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
          {hasPastInterview ? (
            userInterview?.map((interview) => (
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
            latestInterviews?.map((interview) => (
              <InterviewCard interviewId={''} {...interview} key={interview.id} />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Page;
