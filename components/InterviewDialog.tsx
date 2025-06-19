"use client";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";
import { chatSession } from "@/lib/gemini";

export default function InterviewDialog() {
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(jobDescription, jobExperience, jobPosition, numQuestions);
      const inputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Depends on Job Position, Job Description and Years of Experience give us ${numQuestions} Interview question along with Answer in JSON format, Give us question and Answer field on JSON,Each question and answer should be in the format:
    {
      "question": "Your question here",
      "answer": "Your answer here"
    }`;

      const result = await chatSession.sendMessage(inputPrompt);
      const text = await result.response.text();
      console.log("result", text);
      setOpenDialog(false);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="btn-primary max-sm:w-full">Start an Interview</Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] border-2 border-primary-200/50 shadow-2xl rounded-2xl p-0 overflow-hidden max-w-xl mx-auto my-4">
        <div className="pattern bg-[url('/pattern.png')] bg-top bg-no-repeat rounded-2xl p-0">
          <DialogHeader className="px-8 pt-8 pb-2">
            <DialogTitle className="text-primary-200 text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-8 bg-primary-200 rounded-full mr-2"></span>
              Interview Details
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <form className="px-8 pb-4 flex flex-col gap-5 md:gap-6" onSubmit={onSubmit}>
              <div>
                <div className="text-base font-semibold mb-4 text-light-100">
                  Add details about your job position/role, job description, years of experience, and number of questions
                </div>
                <div className="mt-7 my-4">
                  <label className="block mb-2 font-medium text-primary-200">Job Role/Job Position</label>
                  <Input
                    placeholder="Ex. Full Stack Developer"
                    required
                    className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200 px-4 py-2 rounded-lg"
                    onChange={(e) => setJobPosition(e.target.value)}
                  />
                </div>
                <div className="my-4">
                  <label className="block mb-2 font-medium text-primary-200">Job Description/Tech Stack (In short)</label>
                  <Textarea
                    placeholder="Ex. React, Angular, NodeJs, MySql etc"
                    required
                    className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200 px-4 py-2 rounded-lg min-h-[60px]"
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <div className="my-4">
                  <label className="block mb-2 font-medium text-primary-200">Years of Experience</label>
                  <Input
                    placeholder="Ex. 5"
                    type="number"
                    min="1"
                    max="70"
                    required
                    className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200 px-4 py-2 rounded-lg"
                    onChange={(e) => setJobExperience(e.target.value)}
                  />
                </div>
                <div className="my-4">
                  <label className="block mb-2 font-medium text-primary-200">Number of Questions</label>
                  <Input
                    placeholder="Ex. 10"
                    type="number"
                    min="1"
                    max="50"
                    required
                    className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200 px-4 py-2 rounded-lg"
                    onChange={(e) => setNumQuestions(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="ghost" className="btn-secondary px-6 py-2 rounded-lg" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary min-w-32 px-6 py-2 rounded-lg" disabled={loading}>
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
  );
} 