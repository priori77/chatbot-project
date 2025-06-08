# AI ChatBot - OpenAI o1-preview

고성능 OpenAI reasoning model을 활용한 웹 기반 챗봇 애플리케이션입니다.

## 🚀 주요 기능

- **OpenAI o1-preview 모델 사용**: 최신 reasoning model로 고품질 응답 제공
- **시스템 프롬프트 커스터마이징**: 설정 패널에서 AI의 행동을 쉽게 조정
- **대화 컨텍스트 유지**: 연속적인 대화에서 맥락 유지
- **실시간 채팅 인터페이스**: 현대적이고 직관적인 UI/UX
- **다크 모드 지원**: 자동 다크/라이트 모드 전환
- **반응형 디자인**: 모바일과 데스크톱 모두 최적화

## 🛠️ 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 의존성 설치 (이미 완료됨)
npm install
```

### 2. OpenAI API 키 설정

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키를 발급받으세요.
2. `.env.local` 파일을 수정하여 실제 API 키를 입력하세요:

```env
OPENAI_API_KEY=your_actual_api_key_here
```

⚠️ **중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 챗봇을 사용하세요.

## 📖 사용 방법

### 기본 채팅
1. 하단 입력창에 메시지를 입력하세요
2. Enter 키를 누르거나 전송 버튼을 클릭하세요
3. AI가 응답할 때까지 잠시 기다리세요 (o1-preview는 추론 시간이 필요합니다)

### 시스템 프롬프트 설정
1. 상단 우측의 설정(⚙️) 버튼을 클릭하세요
2. 시스템 프롬프트 텍스트 영역에 원하는 지시사항을 입력하세요
3. 예시:
   - `"You are a helpful coding assistant specialized in JavaScript and React."`
   - `"You are a creative writing assistant. Help users write stories and poems."`
   - `"You are a language tutor. Help users learn Korean by providing explanations in both Korean and English."`

### 대화 관리
- **Clear 버튼**: 현재 대화 내역을 모두 삭제
- **자동 스크롤**: 새 메시지가 올 때마다 자동으로 하단으로 스크롤
- **타임스탬프**: 각 메시지의 전송 시간 표시

## 🔧 커스터마이징

### 모델 변경
`src/app/api/chat/route.ts` 파일에서 모델을 변경할 수 있습니다:

```typescript
const completion = await openai.chat.completions.create({
  model: 'o1-mini', // 또는 'o1-preview'
  messages: conversationMessages,
  max_completion_tokens: 4000,
});
```

### UI 테마 수정
`src/components/ChatInterface.tsx`에서 Tailwind CSS 클래스를 수정하여 디자인을 변경할 수 있습니다.

### 기본 시스템 프롬프트 변경
`ChatInterface.tsx`의 `useState` 초기값을 수정하세요:

```typescript
const [systemPrompt, setSystemPrompt] = useState('Your custom default prompt here');
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/chat/
│   │   └── route.ts          # OpenAI API 호출 엔드포인트
│   ├── layout.tsx            # 앱 레이아웃 및 메타데이터
│   └── page.tsx              # 메인 페이지
├── components/
│   └── ChatInterface.tsx     # 챗봇 UI 컴포넌트
└── globals.css               # 전역 스타일
```

## 🚀 배포

### Vercel 배포
1. [Vercel](https://vercel.com)에 프로젝트를 연결하세요
2. 환경 변수에 `OPENAI_API_KEY`를 추가하세요
3. 자동 배포가 완료됩니다

### 기타 플랫폼
- Netlify, Railway, Render 등 Next.js를 지원하는 모든 플랫폼에서 배포 가능
- 환경 변수 설정을 잊지 마세요!

## ⚠️ 주의사항

1. **API 비용**: OpenAI o1-preview는 유료 모델입니다. 사용량을 모니터링하세요.
2. **응답 시간**: o1-preview는 추론 시간이 길어 응답이 느릴 수 있습니다.
3. **API 키 보안**: API 키를 절대 클라이언트 사이드에 노출하지 마세요.
4. **Rate Limiting**: OpenAI API의 rate limit을 고려하여 사용하세요.

## 🛟 문제 해결

### API 키 오류
- `.env.local` 파일이 올바른 위치에 있는지 확인
- API 키가 유효하고 o1 모델에 접근 권한이 있는지 확인

### 빌드 오류
- Node.js 버전이 18 이상인지 확인
- `npm install`로 의존성을 다시 설치

### 응답이 오지 않음
- 네트워크 연결 상태 확인
- OpenAI API 상태 페이지 확인
- 브라우저 개발자 도구에서 에러 로그 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 브라우저 개발자 도구의 콘솔 로그
2. 터미널의 서버 로그
3. OpenAI API 사용량 및 한도

---

**즐거운 AI 챗봇 경험을 즐기세요! 🤖✨**
