// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

/* 1. OpenAI 클라이언트 초기화 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // 환경 변수 존재 강제
});

/* 2. 모델별 최신 규격 */
const MODEL_CONFIGS = {
  'gpt-4.1':        { id: 'gpt-4.1',        limitKey: 'max_tokens',           limit: 32_768, temp: 0.7, tempOK: true,  sysOK: true },
  'gpt-4.1-mini':   { id: 'gpt-4.1-mini',   limitKey: 'max_tokens',           limit: 16_384, temp: 0.7, tempOK: true,  sysOK: true },
  'gpt-4o':         { id: 'gpt-4o',         limitKey: 'max_tokens',           limit: 16_384, temp: 0.7, tempOK: true,  sysOK: true },
  'gpt-4o-mini':    { id: 'gpt-4o-mini',    limitKey: 'max_tokens',           limit: 8_192,  temp: 0.7, tempOK: true,  sysOK: true },

  // ―― Reasoning (o-시리즈) ――
  'o4-mini':        { id: 'o4-mini',        limitKey: 'max_completion_tokens', limit: 65_536, temp: 1.0, tempOK: false, sysOK: true },
  'o3':             { id: 'o3',             limitKey: 'max_completion_tokens', limit: 32_768, temp: 1.0, tempOK: false, sysOK: true },
  'o3-mini':        { id: 'o3-mini',        limitKey: 'max_completion_tokens', limit: 65_536, temp: 1.0, tempOK: false, sysOK: true },
} as const;

type ModelKey = keyof typeof MODEL_CONFIGS;

interface IncomingBody {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  systemPrompt?: string;
  model: ModelKey;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, model }: IncomingBody = await req.json();
    const cfg = MODEL_CONFIGS[model] ?? MODEL_CONFIGS['gpt-4.1-mini'];

    /* 3. 시스템 프롬프트 병합 */
    const chatMessages =
      cfg.sysOK && systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

    /* 4. 파라미터 구성 */
    const params: Record<string, unknown> = {
      model: cfg.id,
      messages: chatMessages,
      [cfg.limitKey]: cfg.limit,
    };

    if (cfg.tempOK) params.temperature = cfg.temp; // o-시리즈엔 미전송

    /* 5. 호출 */
    const completion = await openai.chat.completions.create(params as never);
    const { content, role } = completion.choices[0].message;

    return NextResponse.json({ message: content, role });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'OpenAI API 호출 실패', details: message },
      { status: 500 },
    );
  }
}
