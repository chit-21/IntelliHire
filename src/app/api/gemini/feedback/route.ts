import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { role, answers } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set' }, { status: 500 });
    }

    // Construct a prompt for feedback/analysis
    const prompt = `You are an expert interviewer for the role of ${role}. Here are the candidate's answers to the interview questions: ${JSON.stringify(answers)}.\n\nPlease provide constructive feedback and an analysis of their performance. Be specific, mention strengths and areas for improvement. Return the feedback as plain text.`;

    // Call Gemini API
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    });
    const geminiData = await geminiRes.json();
    const feedback = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ feedback });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 