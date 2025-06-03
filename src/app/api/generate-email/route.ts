import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      emailType,
      targetAudience,
      tone,
      keyPoints,
      callToAction,
      additionalNotes
    } = body;

    const prompt = `Write a highly personalized, short (30-50 words) cold outreach email for a campaign.\n- Email Type: ${emailType}\n- Target Audience: ${targetAudience}\n- Tone: ${tone}\n- Key Points: ${keyPoints}\n- Call to Action: ${callToAction}\n- Additional Notes: ${additionalNotes}`;

    const apiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120,
        temperature: 0.8,
      }),
    });

    const data = await apiRes.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({
      subject: emailType,
      content,
      metadata: { prompt },
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
} 