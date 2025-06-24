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
import { useRouter } from "next/navigation";

interface InterviewDialogProps {
  onInterviewCreated?: () => void;
}

const INTERVIEW_TYPES = [
  { value: "Technical", label: "Technical" },
  { value: "HR", label: "HR" },
  { value: "Behavioral", label: "Behavioral" },
  { value: "Mixed", label: "Mixed" },
];

export default function InterviewDialog({ onInterviewCreated }: InterviewDialogProps) {
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [interviewType, setInterviewType] = useState(INTERVIEW_TYPES[0].value);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const inputPrompt = `Type of Interview: ${interviewType}, Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Depends on Type of Interview, Job Position, Job Description and Years of Experience give us ${numQuestions} Interview question along with Answer in JSON format, Give us question and Answer field on JSON,Each question and answer should be in the format:\n{\n  "question": "Your question here",\n  "answer": "Your answer here"\n}`;
      const result = await chatSession.sendMessage(inputPrompt);
      // Parse Gemini response as JSON
      let text = await result.response.text();
      text = text.replace('```json', '').replace('```', '').trim();
      let questions;
      try {
        questions = JSON.parse(text);
      } catch (err) {
        setLoading(false);
        alert('Failed to parse AI response.');
        return;
      }
      setJsonResponse(questions);
      // Send to API
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPosition,
          jobDescription,
          jobExperience,
          numQuestions,
          questions,
          interviewType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save interview');
      }
      const data = await res.json();
      if (data.status === 'success' && data.id) {
        router.push(`/interview/${data.id}`);
      }
      if (onInterviewCreated) onInterviewCreated();
      setOpenDialog(false);
    } catch (error: any) {
      alert(error.message || 'Something went wrong');
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
                <div className="my-4">
                  <label className="block mb-2 font-medium text-primary-200">Type of Interview</label>
                  <select
                    className="mb-2 bg-dark-200 border border-primary-200/30 text-light-100 focus-visible:ring-primary-200 px-4 py-2 rounded-lg w-full"
                    value={interviewType}
                    onChange={e => setInterviewType(e.target.value)}
                    required
                  >
                    {INTERVIEW_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
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