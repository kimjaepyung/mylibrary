import { Book, AppSettings } from '../types/book'

const STORAGE_KEY_BOOKS = 'my_personal_library_books_v1'
const STORAGE_KEY_SETTINGS = 'my_personal_library_settings_v1'

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  openaiApiKey: '',
  selectedAiProvider: 'gemini',
  geminiModel: 'gemini-3.6-flash',
  theme: 'wood',
  annualGoal: 24,
  userNickname: '독서가',
  defaultViewMode: 'shelf'
}

export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'sample-1',
    title: '미적분으로 바라본 하루',
    author: '오스카 E. 페르난데스',
    translator: '김수환',
    publisher: '김영사',
    publishDate: '2015-08-20',
    isbn: '9788934971870',
    yes24Url: 'https://www.yes24.com/Product/Goods/19904258',
    coverUrl: 'https://image.yes24.com/goods/19904258/XL',
    totalPages: 240,
    currentPage: 240,
    category: '수학/과학',
    tags: ['수학', '미적분', '물리학', '교양수학'],
    status: 'completed',
    isFavorite: true,
    startDate: '2026-08-01',
    completedDate: '2026-08-15',
    sessions: [
      {
        id: 'sess-1',
        round: 1,
        startDate: '2026-08-01',
        completedDate: '2026-08-15',
        notes: '아침 기상부터 밤 취침까지 일상의 모든 순간 속에 숨은 미적분 원리를 탐구함.'
      }
    ],
    review: {
      rating: 5,
      oneLiner: '수식이 단순한 기호가 아닌 세상의 변화를 서술하는 가장 아름다운 언어임을 깨닫게 해준 책.',
      motivation: '공학 수학을 공부하며 미적분의 실질적 물리적 의미와 직관적 연결고리를 다시 찾고 싶어서 선택함.',
      summary: '알람 시계의 소리 파동 푸리에 변환부터 커피가 식어가는 뉴턴의 냉각 법칙 $$\\frac{dT}{dt} = -k(T - T_{\\text{env}})$$, 자동차의 GPS 위치 추적과 가속도 미분방정식까지 일상 속 변화율(Rate of change)을 수학적으로 모델링하는 방법을 직관적으로 풀어냄.',
      impression: '수학 기호 뒤에 감춰진 현실 세계의 역동성을 생생하게 느낄 수 있었다. 특히 미분방정식을 단순히 푸는 것이 아니라 물리적 시스템의 보존 법칙과 연결하는 직관이 탁월했다.',
      recommendation: '수학을 포기했던 사람이나 미적분의 물리적 직관을 다시 세우고 싶은 공학도/자연과학도에게 강력 추천.',
      rawMarkdown: '### 핵심 수식 정리\n뉴턴의 냉각 법칙:\n$$\\frac{dT}{dt} = -k(T - T_a)$$\n이를 적분하면 시간에 따른 온도 함수를 얻는다:\n$$T(t) = T_a + (T_0 - T_a)e^{-kt}$$'
    },
    quotes: [
      {
        id: 'q-1',
        page: 42,
        content: '미분은 순간의 찰나를 들여다보는 돋보기이고, 적분은 그 무수한 찰나를 엮어 거대한 변화를 이해하는 망원경이다.',
        note: '미적분의 본질을 미시적 관점(순간 기울기)과 거시적 관점(누적 면적)으로 깔끔하게 정리한 명문장.',
        date: '2026-08-05'
      },
      {
        id: 'q-2',
        page: 118,
        content: '커피의 온도가 떨어지는 속도는 주변 공기와의 온도 차이에 정비례한다: $\\frac{dT}{dt} = -k(T - T_{env})$',
        note: '열역학 제1법칙과 미적분의 일상적 만남.',
        date: '2026-08-10'
      }
    ],
    actionItems: [
      {
        id: 'act-1',
        text: '공학 프로젝트의 물리 시뮬레이션 모델에 룽게-쿠타(Runge-Kutta) 미분방정식 수치해석 적용하기',
        completed: true,
        completedAt: '2026-08-20'
      },
      {
        id: 'act-2',
        text: '일상에서 발견하는 3가지 변화 현상(온도, 속도, 배터리 소모)을 미분방정식으로 모델링해보기',
        completed: false,
        targetDate: '2026-09-15'
      }
    ],
    aiInsights: [
      {
        id: 'insight-1',
        title: '뉴턴의 냉각 법칙과 현대 엔지니어링 열교환 모델의 확장성',
        summary: 'AI와의 심층 토론을 통해 단순 1계 선형 미분방정식 $dT/dt = -k(T-T_{env})$에서 출발하여, 열전도 방정식(Fourier Heat Conduction) $\\frac{\\partial T}{\\partial t} = \\alpha \\nabla^2 T$ 및 비선형 복사 열손실($T^4$ Stefan-Boltzmann 법칙)로 확장되는 해석적 기법을 정리함.',
        keyPoints: [
          '단순 냉각 공식은 등온(Lumped Capacitance) 가정 하에서 Biot 수 $Bi < 0.1$ 일 때 정확함.',
          '공학적 적용 시 매개변수 $k$는 대류 열전달계수 $h$와 표면적 $A$, 비열 $c_p$의 함수 $k = \\frac{hA}{\\rho V c_p}$ 로 분해됨.',
          '복합 열전달 환경에서는 수치해석적 오일러 방법이나 RK4 기법을 통한 시뮬레이션이 필수적임.'
        ],
        mathematicalFormulas: [
          '\\frac{dT}{dt} = -k(T - T_a)',
          'T(t) = T_a + (T_0 - T_a)e^{-kt}',
          '\\frac{\\partial T}{\\partial t} = \\alpha \\left( \\frac{\\partial^2 T}{\\partial x^2} + \\frac{\\partial^2 T}{\\partial y^2} + \\frac{\\partial^2 T}{\\partial z^2} \\right)'
        ],
        actionIdeas: [
          'Python Scipy odeint 모듈을 사용하여 3단계 복합 냉각 곡선 시뮬레이션 스크립트 작성'
        ],
        createdAt: '2026-08-16T15:30:00.000Z'
      }
    ],
    aiChatHistory: [],
    toc: '1장 아침 7시: 알람과 푸리에 해석\n2장 오전 8시 15분: 커피와 뉴턴의 냉각 법칙\n3장 오전 9시: 출근길 교통 흐름과 편미분\n4장 오후 1시: 식사와 대사 작용의 미적분\n5장 저녁 8시: 밤하늘의 궤도 역학',
    description: '눈을 떠서 잠들 때까지 우리 주변의 모든 순간에 숨어 있는 미적분의 원리를 쉽고 재미있게 풀어낸 교양 수학서.',
    spineColor: '#1e3a8a',
    spineTextColor: '#fbbf24',
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-16T15:30:00.000Z'
  },
  {
    id: 'sample-2',
    title: '밑바닥부터 시작하는 딥러닝',
    author: '사이토 고키',
    translator: '개앞맵시',
    publisher: '한빛미디어',
    publishDate: '2017-01-03',
    isbn: '9788968484636',
    yes24Url: 'https://www.yes24.com/Product/Goods/34970929',
    coverUrl: 'https://image.yes24.com/goods/34970929/XL',
    totalPages: 312,
    currentPage: 312,
    category: 'IT/공학',
    tags: ['인공지능', '딥러닝', '수학', '파이썬', '오차역전파'],
    status: 'completed',
    isFavorite: true,
    startDate: '2026-07-10',
    completedDate: '2026-07-28',
    sessions: [
      {
        id: 'sess-2',
        round: 1,
        startDate: '2026-07-10',
        completedDate: '2026-07-28',
        notes: '넘파이만으로 신경망의 순전파와 오차역전파 행렬 연산을 직접 구현하며 수학적 기초를 완벽히 다짐.'
      }
    ],
    review: {
      rating: 5,
      oneLiner: '라이브러리의 블랙박스 속에 감춰진 딥러닝의 심장(행렬 미분과 연쇄법칙)을 직관적으로 열어젖힌 최고의 책.',
      motivation: 'PyTorch/TensorFlow를 사용하면서 내부 연산 그래프와 오차역전파(Backpropagation)의 수학적 원리를 바닥부터 체화하기 위해 정독.',
      summary: '퍼셉트론의 논리 회로에서 시작하여 활성화 함수, 손실 함수 $L = -\\sum_k t_k \\log y_k$, 경사하강법 $W \\leftarrow W - \\eta \\frac{\\partial L}{\\partial W}$, 그리고 계산 그래프(Computational Graph)를 통한 연쇄법칙(Chain Rule) 오차역전파를 넘파이 코드로 완벽히 재현함.',
      impression: '행렬 곱연산의 형태(Shape) 매칭과 야코비안 행렬의 전치 관계를 손으로 직접 유도해보면서 딥러닝 연산의 뼈대가 머릿속에 완벽히 각인되었다.',
      recommendation: 'AI 엔지니어링을 제대로 시작하고 싶은 모든 개발자와 컴퓨터/수학 전공자.',
      rawMarkdown: '### 핵심 수식: Affine 계층의 역전파\n순전파: $Y = X \\cdot W + B$\n역전파:\n$$\\frac{\\partial L}{\\partial X} = \\frac{\\partial L}{\\partial Y} \\cdot W^T$$\n$$\\frac{\\partial L}{\\partial W} = X^T \\cdot \\frac{\\partial L}{\\partial Y}$$\n$$\\frac{\\partial L}{\\partial B} = \\sum_{\\text{axis}=0} \\frac{\\partial L}{\\partial Y}$$'
    },
    quotes: [
      {
        id: 'q-3',
        page: 132,
        content: '계산 그래프를 사용하면 복잡한 미분도 국소적 계산의 연쇄 법칙(Chain Rule)으로 단순화된다: $\\frac{\\partial z}{\\partial x} = \\frac{\\partial z}{\\partial y} \\cdot \\frac{\\partial y}{\\partial x}$',
        note: '아무리 거대한 인공신경망이라도 결국 덧셈과 곱셈 노드의 국소 미분 전파로 귀결된다는 통찰.',
        date: '2026-07-18'
      }
    ],
    actionItems: [
      {
        id: 'act-3',
        text: 'Transformer Attention 메커니즘을 넘파이만으로 밑바닥부터 구현해보기',
        completed: true,
        completedAt: '2026-08-05'
      }
    ],
    aiInsights: [
      {
        id: 'insight-2',
        title: '오차역전파법의 야코비안(Jacobian) 행렬 전치와 수치적 안정성',
        summary: '행렬 미분에서 배치(Batch) 차원이 결합되었을 때 텐서 수축(Tensor Contraction)과 Softmax with Cross-Entropy의 역전파 $(y_k - t_k)$의 우아한 단순성을 AI 토론으로 증명 및 정리.',
        keyPoints: [
          'Softmax와 Cross Entropy Error를 결합하면 역전파 기울기가 $y_i - t_i$ 로 극도로 간결해짐.',
          '지수 함수 계산 시 Overflow 방지를 위해 최대값 $C = \\max(x)$를 차감하는 수치적 트릭 필수.'
        ],
        mathematicalFormulas: [
          '\\frac{\\partial L}{\\partial a_k} = y_k - t_k',
          'y_k = \\frac{\\exp(a_k - c)}{\\sum_{i} \\exp(a_i - c)}'
        ],
        createdAt: '2026-07-29T10:00:00.000Z'
      }
    ],
    aiChatHistory: [],
    toc: '1장 헬로 파이썬\n2장 퍼셉트론\n3장 신경망\n4장 신경망 학습\n5장 오차역전파법\n6장 학습 관련 기술들\n7장 합성곱 신경망(CNN)\n8장 딥러닝의 미래',
    description: '외부 딥러닝 프레임워크 없이 순수 파이썬과 넘파이만으로 딥러닝 신경망 알고리즘을 구현하는 명저.',
    spineColor: '#065f46',
    spineTextColor: '#34d399',
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-07-29T10:00:00.000Z'
  },
  {
    id: 'sample-3',
    title: '코스모스',
    author: '칼 세이건',
    translator: '홍승수',
    publisher: '사이언스북스',
    publishDate: '2006-12-20',
    isbn: '9788983711892',
    yes24Url: 'https://www.yes24.com/Product/Goods/2312211',
    coverUrl: 'https://image.yes24.com/goods/2312211/XL',
    totalPages: 710,
    currentPage: 710,
    category: '인문/과학',
    tags: ['천문학', '우주', '철학', '인류학', '인생책'],
    status: 'completed',
    isFavorite: true,
    startDate: '2026-06-01',
    completedDate: '2026-06-30',
    sessions: [
      {
        id: 'sess-3',
        round: 1,
        startDate: '2026-06-01',
        completedDate: '2026-06-30',
        notes: '우주적 시공간 속에서 인간이라는 존재의 경이로움과 과학적 합리주의를 가슴 깊이 새김.'
      }
    ],
    review: {
      rating: 5,
      oneLiner: '우리가 우주를 탐구하는 것은 결국 우주가 스스로를 인식하기 위한 여정이라는 숭고한 깨달음.',
      motivation: '광활한 우주 속에서 지적 생명체로서의 인간의 위치와 과학의 인문학적 의미를 성찰하고자 읽음.',
      summary: '빅뱅과 별의 진화, 원소의 합성에서 생명의 탄생, 그리고 인류의 과학적 발견사(알렉산드리아 도서관, 케플러의 행성 운동 법칙 $T^2 \\propto a^3$, 상대성이론)를 거대한 서사시로 엮어낸 인류 최고의 과학 교양서.',
      impression: '우리는 모두 별의 먼지(Starstuff)로 만들어졌다는 칼 세이건의 문장에 깊은 전율을 느꼈다. 과학이 차가운 이성이 아니라 가장 따뜻하고 겸허한 사랑의 태도임을 가르쳐준다.',
      recommendation: '삶의 방향을 고민하는 모든 인간, 밤하늘을 올려다보며 가슴이 뛰는 모든 이들에게 바침.',
      rawMarkdown: '### 케플러의 제3법칙과 중력\n조화의 법칙:\n$$\\frac{T^2}{a^3} = \\frac{4\\pi^2}{G(M + m)} \\approx \\text{constant}$$\n우주선이 광속 $c$에 근접할 때 시간 지연(Time Dilation):\n$$\\Delta t\' = \\frac{\\Delta t}{\\sqrt{1 - \\frac{v^2}{c^2}}}$$'
    },
    quotes: [
      {
        id: 'q-4',
        page: 593,
        content: '우리는 코스모스의 일부이다. 우리는 별들이 만든 물질로 만들어졌으며, 코스모스가 스스로를 아는 하나의 방식이다.',
        note: '인간의 지성과 의식이 우주에서 가지는 가장 숭고한 의미를 정의한 문장.',
        date: '2026-06-25'
      },
      {
        id: 'q-5',
        page: 38,
        content: '알지 못한다는 것은 부끄러운 일이 아니다. 진실을 향해 끊임없이 질문하고 겸허히 탐구하는 태도야말로 과학의 정신이다.',
        note: '지적 겸손과 회의주의의 중요성.',
        date: '2026-06-05'
      }
    ],
    actionItems: [
      {
        id: 'act-4',
        text: '국립과천과학관 천문대 방문하여 밤하늘 성단 관측하기',
        completed: true,
        completedAt: '2026-07-05'
      }
    ],
    aiInsights: [
      {
        id: 'insight-3',
        title: '드레이크 방정식(Drake Equation)과 페르미 역설의 현대적 재해석',
        summary: '외계 지적 생명체의 존재 확률을 계산하는 드레이크 방정식 $N = R^* \\cdot f_p \\cdot n_e \\cdot f_l \\cdot f_i \\cdot f_c \\cdot L$ 과 제임스 웹 우주망원경의 외계행성 대기 관측 데이터 간의 연계성에 대한 심도 깊은 고찰.',
        keyPoints: [
          '케플러 및 테스(TESS), JWST 탐사로 $f_p$(행성을 가진 항성 비율)와 $n_e$(생명 거주 가능 행성 수)의 추정치가 급격히 정밀해짐.',
          '문명의 수명 $L$이 전체 방정식의 결과값을 좌우하는 가장 불확실하며 실존적인 변수임.'
        ],
        mathematicalFormulas: [
          'N = R_* \\cdot f_p \\cdot n_e \\cdot f_l \\cdot f_i \\cdot f_c \\cdot L'
        ],
        createdAt: '2026-07-01T14:00:00.000Z'
      }
    ],
    aiChatHistory: [],
    toc: '1장 코스모스의 바닷가에서\n2장 우주 악보의 한 가락\n3장 지상과 천국의 하모니\n4장 천국과 지옥\n5장 붉은 행성을 위한 블루스\n6장 여행자가 들려준 이야기\n7장 밤하늘의 등대\n8장 시간과 공간을 가르는 여행\n9장 별들의 삶과 죽음\n10장 영원의 벼랑 끝\n11장 미래로 띄운 편지\n12장 은하 대백과사전\n13장 누가 우리 지구를 변호해 줄까?',
    description: '인간과 우주의 관계를 가장 서정적이고 철학적으로 탐구한 20세기 최고의 과학 교양서.',
    spineColor: '#312e81',
    spineTextColor: '#c7d2fe',
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-07-01T14:00:00.000Z'
  }
]

// Storage helpers
export function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS)
    if (!raw) {
      saveBooks(SAMPLE_BOOKS)
      return SAMPLE_BOOKS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_BOOKS
  } catch (err) {
    console.error('Failed to load books from localStorage:', err)
    return SAMPLE_BOOKS
  }
}

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books))
  } catch (err) {
    console.error('Failed to save books to localStorage:', err)
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS)
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS)
      return DEFAULT_SETTINGS
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch (err) {
    console.error('Failed to load settings from localStorage:', err)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err)
  }
}

// Google Drive Backup & Export (Requirement 8)
export interface BackupData {
  version: string
  app: string
  exportDate: string
  targetPlatform: string
  totalBooks: number
  settings: AppSettings
  books: Book[]
}

export function createGoogleDriveBackupData(books: Book[], settings: AppSettings): BackupData {
  return {
    version: '1.0.0',
    app: 'My Personal Library',
    exportDate: new Date().toISOString(),
    targetPlatform: 'Google Drive / Local Storage',
    totalBooks: books.length,
    settings,
    books
  }
}

export function downloadGoogleDriveBackupFile(books: Book[], settings: AppSettings): void {
  const backupData = createGoogleDriveBackupData(books, settings)
  const jsonStr = JSON.stringify(backupData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const fileName = `[GoogleDrive]_MyLibrary_Backup_${dateStr}.json`

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function parseBackupFile(file: File): Promise<{ books: Book[]; settings: AppSettings }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text)
        
        let loadedBooks: Book[] = []
        let loadedSettings: AppSettings = DEFAULT_SETTINGS

        if (Array.isArray(parsed)) {
          // Direct array of books
          loadedBooks = parsed
        } else if (parsed && Array.isArray(parsed.books)) {
          // Standard BackupData object
          loadedBooks = parsed.books
          if (parsed.settings) {
            loadedSettings = { ...DEFAULT_SETTINGS, ...parsed.settings }
          }
        } else {
          throw new Error('올바른 서재 백업 JSON 형식이 아닙니다.')
        }

        resolve({ books: loadedBooks, settings: loadedSettings })
      } catch (err: any) {
        reject(new Error(err.message || '백업 파일을 읽는 중 오류가 발생했습니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일을 불러오지 못했습니다.'))
    reader.readAsText(file)
  })
}
