import { Book, AiMessage, AiDiscussionInsight, AppSettings } from '../types/book'

/**
 * Generates system context about the book and user's reading notes
 */
function buildSystemPrompt(book: Book): string {
  const quotesText = book.quotes.length > 0
    ? book.quotes.map((q, i) => `[인용 ${i + 1}] (p.${q.page || '?'}) "${q.content}" \n-> 독자 메모: ${q.note || '없음'}`).join('\n')
    : '등록된 인용구 없음'

  const reviewText = `
- 한줄평: ${book.review.oneLiner || '미작성'}
- 읽게 된 계기: ${book.review.motivation || '미작성'}
- 핵심 요약: ${book.review.summary || '미작성'}
- 나의 감상: ${book.review.impression || '미작성'}
- 추천 대상: ${book.review.recommendation || '미작성'}
- 자유 서평: ${book.review.rawMarkdown || '미작성'}
`

  return `당신은 최고 수준의 지적 독서 토론 파트너(AI Reading Interlocutor & Academic Companion)입니다.
독자가 읽은 책과 독자의 독서 기록(서평, 밑줄, 생각)을 바탕으로 깊이 있는 문답과 지적 탐구를 진행합니다.

[현재 토론 대상 도서 정보]
- 제목: ${book.title}
- 저자: ${book.author} (역자: ${book.translator || '없음'})
- 출판사: ${book.publisher} / 분야: ${book.category}
- 독서 상태: ${book.status} (평점: ${book.review.rating} / 5.0)

[독자가 남긴 독서 기록 및 감상]
${reviewText}

[독자가 수집한 책 속 문장 및 메모]
${quotesText}

[도서 목차 및 소개]
${book.toc || book.description || '목차 정보 없음'}

[토론 지침]
1. 단순한 책 내용 요약을 넘어, 저자의 핵심 논리와 철학적/공학적 함의, 반론 가능성, 실생활 적용에 대해 깊이 있는 질문과 통찰을 나눕니다.
2. 수학, 물리학, 컴퓨터 공학 등 수식이 필요한 개념을 설명할 때는 반드시 표준 LaTeX 문법을 사용하세요.
   - 인라인 수식: $수식$ (예: $E=mc^2$, $\\frac{dT}{dt}=-k(T-T_a)$)
   - 독립 블록 수식: $$수식$$ (예: $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$)
3. 독자의 관점을 존중하면서도 지적 호기심을 자극하는 날카로운 후속 질문을 던져주세요.
4. 한국어로 정중하고 지적이며 명료한 어조로 답변하세요.`
}

/**
 * Calls Google Gemini API
 */
async function callGeminiApi(
  apiKey: string,
  modelName: string,
  systemInstruction: string,
  messages: AiMessage[]
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName || 'gemini-2.5-flash'}:generateContent?key=${apiKey}`

  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  const body = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `Gemini API 호출 실패 (상태 코드: ${response.status})`)
  }

  const data = await response.json()
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!candidateText) {
    throw new Error('Gemini API로부터 응답을 받지 못했습니다.')
  }

  return candidateText
}

/**
 * Calls OpenAI API
 */
async function callOpenAiApi(
  apiKey: string,
  systemInstruction: string,
  messages: AiMessage[]
): Promise<string> {
  const endpoint = 'https://api.openai.com/v1/chat/completions'

  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  ]

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `OpenAI API 호출 실패 (상태 코드: ${response.status})`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) {
    throw new Error('OpenAI API로부터 응답을 받지 못했습니다.')
  }

  return text
}

/**
 * Send message to AI companion
 */
export async function sendDiscussionMessage(
  book: Book,
  conversationHistory: AiMessage[],
  userPrompt: string,
  settings: AppSettings
): Promise<string> {
  const systemPrompt = buildSystemPrompt(book)
  const fullMessages: AiMessage[] = [
    ...conversationHistory,
    { id: Date.now().toString(), role: 'user', content: userPrompt, timestamp: new Date().toISOString() }
  ]

  const provider = settings.selectedAiProvider || 'gemini'
  const apiKey = provider === 'gemini' ? settings.geminiApiKey : settings.openaiApiKey

  // If no API key configured, provide a helpful demo response
  if (!apiKey || apiKey.trim() === '') {
    await new Promise(r => setTimeout(r, 600))
    return `💡 **[안내] AI API 키가 아직 설정되지 않았습니다.**

우측 상단 ⚙️ 설정(Settings) 메뉴에서 **Google Gemini API Key** 또는 **OpenAI API Key**를 입력하시면, 책의 내용 및 회원님의 독서 메모를 바탕으로 실시간 심층 토론이 가능합니다.

**[시뮬레이션 예시 답변]**
"${book.title}"(${book.author})에서 독자님께서 밑줄 그으신 내용과 서평은 매우 흥미로운 관점입니다. 특히 변화율과 수학적 모델링의 관점에서 다음과 같은 질문을 던져볼 수 있습니다:

$$\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{\\Delta y}{\\Delta x}$$

> "저자가 주장한 핵심 전제가 실제 공학적 제약 조건(예: 소음, 마찰, 비선형성)과 마주했을 때 어떻게 보정될 수 있을까요?"

API 키를 등록하신 후 심층적인 대화를 계속 나눠보세요!`
  }

  if (provider === 'gemini') {
    return await callGeminiApi(apiKey, settings.geminiModel || 'gemini-2.5-flash', systemPrompt, fullMessages)
  } else {
    return await callOpenAiApi(apiKey, systemPrompt, fullMessages)
  }
}

/**
 * Requirement 5: Summarizes discussion into a structured insight and saves it for book reference
 */
export async function generateDiscussionSummary(
  book: Book,
  conversationHistory: AiMessage[],
  settings: AppSettings
): Promise<AiDiscussionInsight> {
  if (conversationHistory.length === 0) {
    throw new Error('요약할 대화 내용이 없습니다.')
  }

  const conversationText = conversationHistory
    .map(m => `${m.role === 'user' ? '독자' : 'AI'}: ${m.content}`)
    .join('\n\n')

  const summaryPrompt = `다음은 도서 "${book.title}"에 대해 독자와 AI가 나눈 심층 독서 토론 내용입니다.
이 대화에서 도출된 핵심 통찰을 정리하여 JSON 형식으로만 응답해 주세요.

[대화 내용]
${conversationText}

[출력 JSON 형식]:
\`\`\`json
{
  "title": "대화의 핵심 주제를 요약한 한 줄 제목",
  "summary": "전체 토론의 핵심 내용과 결론 (2~3문장)",
  "keyPoints": [
    "핵심 통찰 및 배운 점 1",
    "핵심 통찰 및 배운 점 2",
    "핵심 통찰 및 배운 점 3"
  ],
  "mathematicalFormulas": [
    "대화에 등장한 주요 LaTeX 수식 1 (없으면 빈 배열)",
    "\\frac{dT}{dt} = -k(T - T_a)"
  ],
  "actionIdeas": [
    "실천 아이디어 또는 후속 탐구 과제"
  ]
}
\`\`\`
반드시 유효한 JSON 형식만 출력하세요.`

  const provider = settings.selectedAiProvider || 'gemini'
  const apiKey = provider === 'gemini' ? settings.geminiApiKey : settings.openaiApiKey

  if (!apiKey || apiKey.trim() === '') {
    // Return a structured demo insight
    return {
      id: 'insight-' + Date.now(),
      title: `${book.title} - AI 심층 독서 토론 핵심 통찰 요약`,
      summary: `AI와의 대화를 통해 ${book.author} 저자의 핵심 논리와 개념의 공학적/철학적 확장 가능성을 분석하고, 현실 세계 시스템에 적용할 수 있는 수학적 모델링 방안을 도출함.`,
      keyPoints: [
        '저자의 기본 전제는 이상적인 조건 하에서 성립하며, 실제 환경에서는 비선형 오차가 발생함.',
        '개념을 분해하여 미시적 변화율과 거시적 누적량 사이의 대칭성을 파악함.',
        '독서 메모에 기록된 의문점을 해결하기 위한 추가 탐구 방향을 수립함.'
      ],
      mathematicalFormulas: [
        '\\frac{df}{dx} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}'
      ],
      actionIdeas: [
        '관련 후속 논문 및 기술 문서 1편 검토하기'
      ],
      createdAt: new Date().toISOString()
    }
  }

  let rawJson = ''
  if (provider === 'gemini') {
    rawJson = await callGeminiApi(
      apiKey,
      settings.geminiModel || 'gemini-2.5-flash',
      'You are an expert academic summarizer. Always respond in valid JSON.',
      [{ id: 'sum-1', role: 'user', content: summaryPrompt, timestamp: new Date().toISOString() }]
    )
  } else {
    rawJson = await callOpenAiApi(
      apiKey,
      'You are an expert academic summarizer. Always respond in valid JSON.',
      [{ id: 'sum-1', role: 'user', content: summaryPrompt, timestamp: new Date().toISOString() }]
    )
  }

  try {
    const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    return {
      id: 'insight-' + Date.now(),
      title: parsed.title || `${book.title} 심층 토론 통찰`,
      summary: parsed.summary || '심층 토론 요약',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      mathematicalFormulas: Array.isArray(parsed.mathematicalFormulas) ? parsed.mathematicalFormulas : [],
      actionIdeas: Array.isArray(parsed.actionIdeas) ? parsed.actionIdeas : [],
      createdAt: new Date().toISOString()
    }
  } catch (e) {
    return {
      id: 'insight-' + Date.now(),
      title: `${book.title} 토론 요약`,
      summary: rawJson.slice(0, 300),
      keyPoints: ['심층 토론 완료'],
      createdAt: new Date().toISOString()
    }
  }
}
