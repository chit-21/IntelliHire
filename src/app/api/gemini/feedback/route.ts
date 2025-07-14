import { NextRequest } from 'next/server';

async function callGeminiAPI(prompt: string, apiKey: string, maxRetries = 3, delayMs = 2000) {
  let attempt = 0;
  let lastError = null;
  while (attempt < maxRetries) {
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
    if (geminiRes.ok) {
      return await geminiRes.json();
    } else {
      const errorText = await geminiRes.text();
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.code === 503) {
          // Model overloaded, retry after delay
          attempt++;
          if (attempt < maxRetries) {
            await new Promise(res => setTimeout(res, delayMs));
            continue;
          } else {
            lastError = errorJson;
            break;
          }
        } else {
          // Other error, do not retry
          lastError = errorJson;
          break;
        }
      } catch (e) {
        lastError = errorText;
        break;
      }
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const { questions, answers, role, type } = await request.json();

    if (!questions || !answers || questions.length !== answers.length) {
      return Response.json({ error: 'Invalid questions or answers data' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Missing Gemini API key' }, { status: 500 });
    }

    const prompt = `
You are an expert interview evaluator. Analyze the following interview responses for a ${role} position (${type} interview).

For each question and answer pair, provide:
1. A score from 0-100 based on relevance, completeness, and technical accuracy
2. A better/alternative answer that demonstrates best practices
3. Specific feedback on what was good and what could be improved

Format your response as a JSON object with this structure:
{
  "overallScore": number (average of all scores),
  "questionFeedback": [
    {
      "question": "question text",
      "answer": "user's answer",
      "score": number (0-100),
      "betterAnswer": "improved answer",
      "feedback": "detailed feedback"
    }
  ],
  "overallFeedback": "comprehensive feedback for the entire interview"
}

Questions and Answers:
${questions.map((q: string, i: number) => `${i + 1}. Question: ${q}\n   Answer: ${answers[i]}`).join('\n\n')}

Be strict but fair in your evaluation. Focus on technical accuracy, problem-solving approach, and communication clarity.
`;

    let geminiData;
    try {
      geminiData = await callGeminiAPI(prompt, apiKey);
    } catch (error) {
      // If error is 503, show a friendly message
      if (
        typeof error === 'object' && error !== null &&
        'error' in error &&
        typeof (error as any).error === 'object' && (error as any).error !== null &&
        'code' in (error as any).error && (error as any).error.code === 503
      ) {
        return Response.json({
          error: 'The AI feedback service is temporarily overloaded. Please try again in a few minutes.'
        }, { status: 503 });
      }
      // Other errors
      return Response.json({ error: 'Gemini API error', details: error }, { status: 500 });
    }

    // Extract the text from the response
    let text = '';
    if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts && geminiData.candidates[0].content.parts[0].text) {
      text = geminiData.candidates[0].content.parts[0].text;
    } else {
      return Response.json({ error: 'No content returned from Gemini API', raw: geminiData }, { status: 500 });
    }

    // Try to extract JSON from the response
    let feedback;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        return Response.json({ error: 'Failed to parse feedback from Gemini response', details: text }, { status: 500 });
      }
    } catch (err) {
      return Response.json({ error: 'Failed to parse feedback from Gemini response', details: text, parseError: String(err) }, { status: 500 });
    }

    return Response.json(feedback);
  } catch (error) {
    console.error('Feedback generation error:', error);
    return Response.json({ error: 'Failed to generate feedback' }, { status: 500 });
  }
} 