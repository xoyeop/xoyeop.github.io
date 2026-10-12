# SoYeop Yoo · CV website

React로 만든 개인 연구자 사이트입니다. 논문과 프로필은 JSON 파일에서 관리하고, 빌드하면 GitHub Pages에서 바로 제공할 수 있는 정적 HTML이 생성됩니다. 페이지 본문도 빌드 시 HTML에 포함되어 검색엔진과 JavaScript를 끈 방문자에게 보입니다.

## 로컬 실행

Node.js 22 이상을 사용합니다. 처음 한 번 의존성을 설치한 뒤 미리보기를 시작합니다.

```sh
npm install
npm run preview
```

브라우저에서 `http://127.0.0.1:8000`을 엽니다. 미리보기 서버를 켜 둔 채 수정했다면 다른 터미널에서 `npm run build`를 실행하고 브라우저를 새로고침합니다.

## 내용 수정

| 수정할 내용 | 파일 |
| --- | --- |
| 소속, 직함, 소개, 연구 분야, News, 경력, 교육 | `data/profile.json` |
| 논문 추가·삭제·수정, 대표 논문 선택 | `data/publications.json` |
| React 페이지 구성과 섹션 순서 | `src/App.jsx` |
| 색상, 글꼴, 여백, 반응형 배치 | `assets/site.css` |
| HTML 제목과 검색 설명 | `scripts/build.mjs` |

`data/publications.json`의 각 논문은 하나의 `{ ... }` 항목입니다. 새 항목을 복사해 `id`, `year`, `type`, `scope`, `title`, `authors`, `venue`를 수정하세요. 첫 화면에 표시하려면 `selected`를 `true`로 설정합니다. DOI가 있으면 `doi`를 추가하고, 없으면 공식 `url`을 사용할 수 있습니다. `type`은 `journal` 또는 `conference`, `scope`는 `international` 또는 `korean`입니다. 국내 학술지에는 `index: "KCI"`를 기재합니다. `npm run build`는 중복 ID와 잘못된 DOI를 확인합니다.

전체 논문은 연도별로 자동 묶이고, 첫 화면에는 `selected: true`인 대표 논문 3편이 나옵니다. 대표 논문을 바꾸려면 원하는 항목의 `selected` 값을 바꾸세요. 이메일은 화면에 `[at]`으로 표시하고 복사 버튼으로 실제 주소를 복사합니다. 연락처를 바꿀 때는 `email_local`, `email_domain`만 수정하세요.

프로필의 연구조직·기관명·소재지는 `data/profile.json`의 `research_unit`, `affiliation`, `location`에서 각각 수정합니다.

News는 `data/profile.json`의 `news` 배열에서 관리합니다. 각 항목에 `date`를 `YYYY-MM` 형식으로, `text`에 표시할 문장을 입력하면 최신 월부터 정렬되고 연도별로 묶입니다. 논문 소식은 `paper_id`에 `data/publications.json`의 논문 `id`를 넣으면 전체 논문 제목과 DOI 링크가 자동으로 표시됩니다. 이때 `text`는 제목 앞에 표시할 짧은 문구와 콜론으로 적습니다.

CV 경력에서 학과·단과대는 `unit`, 학교·연구기관은 `organization`에 입력합니다. 화면에는 학과를 먼저, 기관명을 다음 줄에 표시합니다.

JIF는 공개 페이지에 표기하지 않습니다. 지원용 CV에 필요할 때 기준 연도를 명시해 별도로 관리하세요. 심사 중인 원고는 게재 상태를 확인한 뒤 추가하세요.

## 프로젝트 구조

- `src/App.jsx`: 세 페이지를 구성하는 React 컴포넌트
- `src/client.jsx`: 브라우저 상호작용 연결
- `src/shell.html`: 정적 HTML의 공통 틀
- `scripts/build.mjs`: React 페이지를 HTML로 만들고 JS를 묶는 빌드
- `scripts/preview.mjs`: 로컬 미리보기 서버
- `assets/`: CSS와 파비콘
- `dist/`: 자동 생성되는 결과; 직접 수정하지 않으며 Git에 올리지 않음

이 폴더는 로컬 Git 저장소로 관리됩니다. `git status`와 `git diff`로 수정 사항을 확인할 수 있습니다.

## GitHub Pages에 게시

기존 `xoyeop/xoyeop.github.io` 저장소의 기본 브랜치는 `master`입니다. 현재 이 로컬 프로젝트는 별도 Git 이력과 `main` 브랜치를 사용하므로, 기존 저장소를 새 폴더에 복제한 뒤 이 프로젝트의 소스 파일을 복사해 `master`에 커밋하는 방식이 안전합니다. `dist`, `node_modules`, `.build`, `.git`은 복사하지 않습니다. 기존 저장소의 `CNAME` 파일은 보존합니다.

저장소 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택하면, 이후 `master`에 변경 사항을 올릴 때 `.github/workflows/pages.yml`이 자동으로 빌드·게시합니다. 기존 사용자 지정 도메인 `soyeop.me`는 **Settings → Pages → Custom domain**에서 확인하세요. GitHub Actions 배포에서는 저장소의 `CNAME` 파일이 도메인 설정으로 사용되지 않습니다. 현재는 로컬에서만 관리하며 원격 저장소를 변경하지 않았습니다.

## 공개 전 확인

- 이전 DGIST 경력의 종료 월
- 2026년 5월 CV 이후의 추가 논문과 심사 중 원고의 상태 변경
- 논문별 DOI 및 국내 학술지의 최신 서지 정보
- 영문 소개 문구와 대표 논문 선택

전화번호와 생년월일이 포함된 이전 CV PDF는 사이트에 복사하지 않았습니다.
