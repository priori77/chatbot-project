import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 모델별 설정
const MODEL_CONFIGS = {
  'gpt-4.1': {
    actualModel: 'gpt-4o', // 현재 사용 가능한 모델로 매핑
    maxTokens: 4000,
    temperature: 0.7,
    supportsSystemPrompt: true,
  },
  'gpt-4.1-mini': {
    actualModel: 'gpt-4o-mini', // 현재 사용 가능한 모델로 매핑
    maxTokens: 2000,
    temperature: 0.7,
    supportsSystemPrompt: true,
  },
  'o4-mini': {
    actualModel: 'o1-mini', // 현재 사용 가능한 추론 모델로 매핑
    maxTokens: 65536,
    temperature: 1.0, // o1 모델은 temperature 1.0 고정
    supportsSystemPrompt: false, // o1 모델은 system prompt 미지원
  },
  'o3': {
    actualModel: 'o1-preview', // 현재 사용 가능한 추론 모델로 매핑
    maxTokens: 32768,
    temperature: 1.0, // o1 모델은 temperature 1.0 고정
    supportsSystemPrompt: false, // o1 모델은 system prompt 미지원
  },
};

export async function POST(request: NextRequest) {
  try {
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 7));
    
    const { messages, systemPrompt, model } = await request.json();
    
    // 선택된 모델의 설정 가져오기
    const modelConfig = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS] || MODEL_CONFIGS['gpt-4.1-mini'];
    
    console.log('Selected model:', model, 'Actual model:', modelConfig.actualModel);

    // 시스템 프롬프트 처리 (o1 모델은 지원하지 않음)
    const conversationMessages = (modelConfig.supportsSystemPrompt && systemPrompt)
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    console.log('Messages being sent:', conversationMessages);
    
    // 모델별 파라미터 설정
    const completionParams: any = {
      model: modelConfig.actualModel,
      messages: conversationMessages,
    };

    // o1 모델이 아닌 경우에만 temperature와 max_tokens 설정
    if (!modelConfig.actualModel.startsWith('o1')) {
      completionParams.max_tokens = modelConfig.maxTokens;
      completionParams.temperature = modelConfig.temperature;
    } else {
      // o1 모델의 경우 max_completion_tokens 사용
      completionParams.max_completion_tokens = modelConfig.maxTokens;
    }
    
    const completion = await openai.chat.completions.create(completionParams);

    const response = completion.choices[0].message;

    return NextResponse.json({ 
      message: response.content,
      role: response.role 
    });

  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to get response from OpenAI',
        details: errorMessage 
      }, 
      { status: 500 }
    );
  }
}
