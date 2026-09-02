# 📚 나만의 개인 서재 (My Personal Library) 배포 및 연동 가이드

본 프로젝트는 **내가 읽은 책 중심의 독서 아카이브**, **Yes24 도서/ISBN 정보 연동**, **Google Gemini / OpenAI AI 심층 독서 토론 및 하단 요약 저장**, **수학/공학 LaTeX 수식 지원**, 그리고 **Google Drive 클라우드 백업**을 완벽하게 지원합니다.

---

## 1. GitHub 저장소 연동 및 업로드

로컬 Git을 사용하여 본 프로젝트를 GitHub에 업로드합니다.

```bash
# 1. git 초기화 (필요시)
git init

# 2. 파일 추가 및 첫 커밋
git add .
git commit -m "feat: 나만의 개인 서재 웹 애플리케이션 초기 릴리즈"

# 3. GitHub 원격 저장소 연결 (본인의 GitHub 리포지토리 URL)
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 4. 푸시
git push -u origin main
```

---

## 2. Vercel 원클릭 배포 (Vercel Deployment)

Vercel은 본 저장소의 `vercel.json` 설정을 통해 별도 서버 구성 없이 정적 웹 애플리케이션으로 즉시 배포할 수 있습니다.

### Vercel 배포 단계:
1. [Vercel 공식 웹사이트](https://vercel.com)에 로그인합니다.
2. **Add New...** > **Project**를 클릭합니다.
3. 방금 푸시한 GitHub 저장소를 선택(Import)합니다.
4. Framework Preset은 **Vite**를 선택합니다.
5. Build and Output Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. **Deploy** 버튼을 클릭하면 1분 이내에 전 세계 어디서나 접속 가능한 고유 URL이 생성됩니다.

---

## 3. Google Drive 백업 및 동기화 방법 (Requirement 8)

1. **원클릭 백업 다운로드**:
   - 서재 우측 상단의 **[드라이브 백업]** 버튼 또는 ⚙️ 설정 메뉴에서 **[Google Drive 백업 파일 다운로드]**를 클릭합니다.
   - `[GoogleDrive]_MyLibrary_Backup_YYYYMMDD.json` 파일이 다운로드됩니다.
   - 본 파일은 Google Drive의 `내 드라이브/mylibrary` 또는 원하는 폴더에 보관하시면 됩니다.

2. **구글 드라이브에서 복원**:
   - ⚙️ 설정 메뉴 > **[드라이브에서 백업 파일 복원]** 버튼을 클릭하여 Google Drive에 보관된 백업 JSON 파일을 선택하면 100% 온전하게 복구됩니다.

---

## 4. AI 심층 독서 토론 API 키 설정 (Requirement 4 & 5)

- 우측 상단 ⚙️ 설정에서 **Google Gemini API Key** 또는 **OpenAI API Key**를 등록합니다.
- API 키는 사용자 본인의 브라우저 LocalStorage에만 안전하게 저장되며 외부 서버로 절대 전송되지 않습니다.
- AI와 나눈 심층 대화의 통찰은 **[통찰 요약하여 책에 저장]** 버튼을 누르면 **해당 책의 상세 보기 하단(`💡 AI 심층 토론 & 핵심 통찰 정리`)에 영구 보관**되어 책을 열 때마다 언제든 참고할 수 있습니다.

---

## 5. 수학/공학 LaTeX 수식 작성 안내 (Requirement 6)

- 인라인 수식: `$E=mc^2$`, `$\frac{dT}{dt} = -k(T - T_a)$`
- 독립 블록 수식: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`
- 서평, 인용구 메모, AI 질의응답 창 전체에서 KaTeX 엔진을 통해 고해상도 수식으로 즉시 변환되어 표시됩니다.
