import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { role, type, years, numQuestions } = await request.json();

    if (!role || !type || !years || !numQuestions) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const prompt = `
You are an expert interviewer. Generate ${numQuestions} high-quality, diverse, and challenging interview questions for a ${role} position.
Interview type: ${type}
Years of experience: ${years}

- Questions should be relevant to the role and experience level.
- For technical interviews, include a mix of conceptual, practical, and scenario-based questions.
- For behavioral interviews, focus on soft skills, teamwork, and problem-solving.
- For mixed interviews, include both technical and behavioral questions.
- Do NOT include answers, only the questions.
- Return the questions as a JSON array of strings.
`;

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        }),
      }
    );

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      return Response.json({ error: 'Gemini API error', details: errorText }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    // Extract the text from the response
    let text = '';
    if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts && geminiData.candidates[0].content.parts[0].text) {
      text = geminiData.candidates[0].content.parts[0].text;
    } else {
      return Response.json({ error: 'No content returned from Gemini API' }, { status: 500 });
    }

    // Try to extract a JSON array from the response
    let questions;
    try {
      const jsonMatch = text.match(/\[([\s\S]*)\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to split by lines if not valid JSON
        questions = text
          .split('\n')
          .map(q => q.trim())
          .filter(q => q.length > 0 && !q.match(/^\d+\./));
      }
    } catch (err) {
      return Response.json({ error: 'Failed to parse questions from Gemini response', details: text }, { status: 500 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return Response.json({ error: 'No questions generated', details: text }, { status: 500 });
    }

    return Response.json({ questions });
  } catch (error) {
    console.error('Question generation error:', error);
    return Response.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
} 