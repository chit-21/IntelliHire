import { db } from '@/firebase/admin';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { jobPosition, jobDescription, jobExperience, numQuestions, questions, interviewType } = body;
    if (!jobPosition || !jobDescription || !jobExperience || !numQuestions || !questions || !interviewType) {
      return NextResponse.json({ status: 'error', message: 'Missing required fields' }, { status: 400 });
    }
    const techstack = jobDescription.split(',').map((s: string) => s.trim());
    const docRef = await db.collection('interviews').add({
      role: jobPosition,
      techstack,
      level: jobExperience,
      questions,
      createdAt: new Date().toISOString(),
      userId: user.id,
      numQuestions: Number(numQuestions),
      type: interviewType,
    });
    return NextResponse.json({ status: 'success', id: docRef.id });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || 'Failed to create interview' }, { status: 500 });
  }
} 