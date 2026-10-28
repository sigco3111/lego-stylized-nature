# 브릭랜드 (BRICKLAND, 积木旷野) — 한국어판

끝나지 않는 작은 모험. 블록으로 만든 작은 비행기를 몰아 절차 생성으로 만들어지는
숲, 강, 모래 언덕, 설경을 탐험하는 브라우저 게임입니다.

**[지금 플레이하기 (GitHub Pages)](https://sigco3111.github.io/lego-stylized-nature/)** ·
[원본 저장소 (hexianWeb/lego-stylized-nature)](https://github.com/hexianWeb/lego-stylized-nature) ·
[원작 라이브 (Vercel)](https://lego-stylized-nature.vercel.app/)

> 이 저장소는 원작을 한국어화한 포크입니다. 원본 README(중/영)는
> [README.en.md](README.en.md)에 그대로 보존되어 있습니다.

## 목차

- [게임 소개](#게임-소개)
- [플레이 방법](#플레이-방법)
- [한국어화 내용](#한국어화-내용)
- [검증 상태](#검증-상태)
- [기술 스택](#기술-스택)
- [로컬 빌드 방법](#로컬-빌드-방법)
- [배포 재현 방법](#배포-재현-방법)
- [라이선스 안내](#라이선스-안내)

## 게임 소개

- 결승선이 없는 자유 비행: 절차 생성 세계를 마음 가는 대로 돌아다닙니다.
- 7개 바이옴: 푸른 숲, 가을 숲, 황금 사구, 용암 계곡, 눈 덮인 숲, 꽃 들판, 물가 습지.
- 랜드마크(사막 태양의 문), 지형 미니맵, 속도·좌표 HUD, 바이옴 안내를 제공합니다.
- 로딩 후 구름을 뚫고 세계가 드러나는 연출과 바이옴별 배경 음악이 있습니다.

## 플레이 방법

1. [https://sigco3111.github.io/lego-stylized-nature/](https://sigco3111.github.io/lego-stylized-nature/)에 접속합니다.
2. 조작법:

| 동작 | 입력 |
| --- | --- |
| 앞으로 비행 | W 또는 ↑ |
| 후진 | S 또는 ↓ |
| 좌우 회전 | A · D 또는 ← · → |
| 둘러보기 / 확대·축소 | 마우스 드래그 / 휠 |
| 비행 일시정지 / 계속 | Space |
| 화면 숨기기 / 보이기 | H |
| 음소거 / 효과음 켜기 | M |
| 지도 펼치기 / 접기 | 미니맵 우상단 버튼 또는 Esc |
| 터치 기기 | 화면의 방향 버튼 |

## 한국어화 내용

- 게임 내 UI 전체: 헤더, 비행 정보 카드, 조작 안내, 미니맵, 로딩 화면, 도움말 대화상자, 토스트, 터치 버튼, 오류 안내 화면
- 7개 바이옴 이름과 랜드마크 이름
- 페이지 제목·aria 레이블·noscript 문구
- 폰트는 시스템 한글 스택(Apple SD Gothic Neo / Malgun Gothic / Noto Sans KR)으로 교체 — 별도 웹폰트 추가 없이 무게를 늘리지 않았습니다
- 개발 문서(docs/)와 개발용 도구(src/dev/)는 원문을 유지했습니다

## 검증 상태

- 한글화·빌드·배포 파일 반영: 완료 (gh-pages 브랜치 배포물 28개 파일 원격-로컬 바이트 대조 통과)
- 실제 플레이: **사용자가 한글화 배포본에서 정상 플레이를 확인했습니다** (2026-10-28)
- 자체 렌더 검증: 수행 환경(클라우드 브라우저의 소프트웨어 GL)에서 이 게임의 Three.js
  WebGPU/WebGL2 렌더러가 로드 직후 중단되는 환경 한계가 있어, 자체 스크린샷·입력 검증은
  완료하지 못했습니다. 같은 환경에서 원작 Vercel 배포도 동일하게 중단됨을 확인했습니다.

## 기술 스택

- **렌더링**: Three.js (WebGPURenderer, WebGPU 불가 시 WebGL2 백엔드), TSL 셰이더, 인스턴싱 지형·식생
- **월드**: 절차 생성(청크 기반 지형, simplex-noise), 바이옴 시스템, 프리팹 배치
- **빌드**: Vite 5, 순수 정적 사이트 (서버 불필요)
- **오디오**: 바이옴 배경음 2종 (public/audio)

## 로컬 빌드 방법

요구 사항: Node.js 18+

```bash
git clone https://github.com/sigco3111/lego-stylized-nature.git
cd lego-stylized-nature
npm install
npm run build   # dist/ 에 정적 사이트 생성
```

개발 서버는 `npm run dev`입니다. 참고: 원본의 package-lock은 package.json과 어긋나
`npm ci`가 실패하므로, 이 포크에는 `npm install` 결과로 갱신한 lock이 포함되어 있습니다.

## 배포 재현 방법

`gh-pages` 브랜치가 빌드 결과물을 담고 있으며 GitHub Pages가 `gh-pages / (root)`를
서비스합니다(루트 `.nojekyll`로 Jekyll 비활성화). `vite.config.js`의
`base: '/lego-stylized-nature/'`를 바꾸면 다른 경로에도 배포할 수 있습니다.

작업 환경의 GitHub 웹 UI 제약으로 배포물에 아래 이력이 있습니다(재현 시 참고):

1. 웹 업로드는 모든 파일에 연번 접두사(예: `9-`)를 붙여 커밋합니다. 작은 파일은
   업로드 후 파일명을 원래대로 변경했습니다.
2. 1MB를 넘는 파일은 웹 편집기에서 이름을 바꾸면 내용이 비워지는 문제가 있어,
   아래 5개 파일은 접두사가 붙은 이름 그대로 두고 참조를 그 이름에 맞췄습니다.
   - `assets/9-index-C9ZGaDrQ.js` (메인 번들; `index.html`의 `<script src>`가 이 이름을 가리킴)
   - `audio/5-Miniature Nature.mp3`, `audio/6-Warm Adventure.mp3`
   - `model/player/7-fly.glb`, `hdri/8-grasslands_sunset_1k.hdr`
     (이 4개는 번들 내부 참조를 접두사 이름으로 패치)

## 라이선스 안내

원본 저장소에는 **라이선스 파일이 없습니다**(저작권은 원작자 hexianWeb에 있으며,
일반적인 오픈소스 라이선스가 명시되지 않았습니다). 이 포크는 원작의 코드·자산을
수정·재배포하고 있으므로, 원작자가 별도 조건을 제시하면 그에 따라야 합니다.
이 점을 알리고 진행 여부를 확인한 뒤 작업했습니다.

- 원작: [hexianWeb/lego-stylized-nature](https://github.com/hexianWeb/lego-stylized-nature)
- 한국어화 포크: 2026-10-28, 원본 ID·저작자 표기를 유지하며 UI 문자열만 한국어로 번역
