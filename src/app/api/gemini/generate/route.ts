import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { role, type, years, numQuestions } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set' }, { status: 500 });
    }

    // Construct a detailed prompt for Gemini
    const prompt = `Generate ${numQuestions} interview questions for a ${role} (${type}) with ${years} years of experience. Return only a JSON array of questions, no explanations.`;

    // Call Gemini API (Google Generative AI)
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: {
            type: "array",
            items: { type: "string" }
          }
        }
      })
    });
    const geminiData = await geminiRes.json();
    // Parse the response to extract questions
    let questions: string[] = [];
    try {
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      questions = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse Gemini response', geminiData }, { status: 500 });
    }
    return NextResponse.json({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 