# 📚 나만의 개인 서재 (My Personal Library & AI Reading Companion)

> **내가 읽은 책 중심의 깊이 있는 독서 기록장**, **Yes24 도서/ISBN 정보 자동 연동**, **AI 심층 독서 토론 및 하단 요약 영구 보관**, **수학/공학 LaTeX 수식 렌더링**, 그리고 **Google Drive 클라우드 백업**을 지원하는 모던 개인 디지털 서재 웹 애플리케이션입니다.

![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)
![React 18](https://img.shields.io/badge/React-18.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)
![KaTeX](https://img.shields.io/badge/LaTeX-KaTeX-00d084.svg)
![Google Drive](https://img.shields.io/badge/Backup-Google_Drive-4285F4.svg)

---

## ✨ 주요 기능 (Key Features)

### 1. 📚 감성적인 3D 책장 & 타임라인 뷰
- **3D 원목 책장 (Spine View)**: 실제 서재처럼 책 페이지 수에 맞춘 두께, 커스텀 책등 색상, 금박 타이틀 및 별점 표시
- **표지 카드 갤러리 (Cover Grid View)**: 고화질 표지, 독서 진행률(%) 바, 인생책 뱃지
- **독서 일지 타임라인 (Timeline Feed)**: 완독한 날짜 순으로 펼쳐지는 나의 독서 여정 피드

### 2. ✍️ 심층 독서 기록 & 구조화 서평
- **독서 기간 & N회독 추적**: 시작일 ~ 완독일, 독서 소요 일수, N회독(재독) 차수 관리
- **구조화 서평 템플릿**:
  - `[읽게 된 계기]`, `[핵심 요약 & 주요 수식]`, `[나의 감상 & 울림]`, `[추천 대상]`, `[자유 서평]`
- **문장 수집함 (Quote Vault)**: 쪽수(Page) + 밑줄 친 문장 + 내 생각 메모
- **독서 실천 액션 플랜**: 책을 읽고 내 삶에 실천할 액션 아이템 체크리스트

### 3. 🔍 Yes24.com 도서 & ISBN 정보 자동 연동
- 도서명, 저자, ISBN-10/13, Yes24 링크 검색으로 표지 이미지, 출판사, 출간일, 목차, 책소개 자동 입력

### 4. 🤖 AI 심층 독서 토론 (Google Gemini & OpenAI)
- 책 내용과 독자가 적은 독서 메모/인용구를 바탕으로 한 수준 높은 학술/철학/공학 문답 진행
- **핵심 통찰 요약 도서 하단 영구 보관**: 대화 중 [통찰 요약하여 책에 저장]을 누르면 책 상세 보기 하단(`💡 AI 심층 토론 & 핵심 통찰 정리`)에 영구 보관

### 5. 📐 수학/공학 도서를 위한 LaTeX 수식 지원
- KaTeX 기반 인라인(`$...$`) 및 독립 블록(`$$...$$`) 수식 실시간 렌더링

### 6. ☁️ Google Drive 백업 및 복원
- 원클릭 `[GoogleDrive]_MyLibrary_Backup_YYYYMMDD.json` 파일 생성 및 드라이브 보관본 100% 무손실 복원

---

## 🚀 로컬 실행 방법 (Getting Started)

```bash
# 저장소 복제
git clone https://github.com/kimjaepyung/mylibrary.git
cd mylibrary

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 🌐 Vercel 배포 방법 (Deployment)

1. [Vercel](https://vercel.com)에 로그인 후 **Add New... > Project**를 선택합니다.
2. 본 GitHub 저장소를 선택(Import)합니다.
3. Framework: **Vite** 선택 후 **Deploy**를 클릭하면 1분 이내에 배포가 완료됩니다.

---

## 📄 라이선스 (License)
MIT License
