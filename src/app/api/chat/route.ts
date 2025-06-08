import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 7));
    
    const { messages, systemPrompt } = await request.json();

    // 시스템 프롬프트가 있으면 메시지 배열 앞에 추가
    const conversationMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    console.log('Messages being sent:', conversationMessages);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 올바른 모델명으로 수정
      messages: conversationMessages,
      max_tokens: 4000, // max_tokens로 파라미터명 수정
      temperature: 0.7,
    });

    const response = completion.choices[0].message;

    return NextResponse.json({ 
      message: response.content,
      role: response.role 
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from OpenAI',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}
