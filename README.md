# bongchil-design-system

봉칠 디자인 시스템 — 토큰 · 재질 · 컨트롤 컴포넌트.
[bongchil-diary](https://github.com/E-JIWON/bongchil-diary)의 `shared/ui`에서 뽑아냈다.

**카탈로그** → https://bongchil-design-system.vercel.app (`#스토리id`로 바로 열린다)

**빌드가 없다.** 소스(`src/`)를 그대로 내보내고 소비 앱이 자기 번들러로 트랜스파일한다.
Next 의존도 없다 — 링크는 주입, 데이터는 prop.

## 왜 뽑았나

같은 디자인을 쓰는 앱이 여러 개가 되면서 버튼 하나 고치는 데 같은 수정을 여러 번 하게 됐다.
원본을 하나로 두고, 각 앱은 **태그로 고정해서** 받아 쓴다. 패키지를 고치면 새 태그를 찍고,
소비 앱은 올릴 준비가 됐을 때 태그를 올린다 — 패키지 수정이 남의 배포를 예고 없이 바꾸지 않게.

## 설치

```bash
# 배포용 — 태그로 고정한다
pnpm add "github:E-JIWON/bongchil-design-system#v0.1.2"

# 개발 중 — 소스를 고치면 HMR이 붙는다
pnpm add "bongchil-design-system@file:../bongchil-design-system"
```

| 태그 | 내용 |
| --- | --- |
| `v0.1.2` | 모달 자유 내용에 `size` 추가 (sm 270 · md 480 · lg 720) |
| `v0.1.1` | `Button`이 `@types/node` 없이도 타입체크되게 |
| `v0.1.0` | 첫 공개 |

## 붙이기

**1. CSS** — 앱의 전역 스타일시트에서:

```css
@import "tailwindcss";
@import "bongchil-design-system/tokens.css";
@import "bongchil-design-system/components.css";

@source "../node_modules/bongchil-design-system/src";
```

> ⚠️ **`@source`가 빠지면 에러 없이 스타일만 전부 사라진다.** Tailwind v4는 `node_modules`를 스캔하지 않는다.
> `file:`로 심링크했다면 실제 경로(`../bongchil-design-system/src`)를 함께 적어야 할 수 있다.

**2. 앱이 소유하는 것** — 이 패키지는 화면 전용 토큰과 폰트를 싣지 않는다.

- 폰트: 토큰이 참조하는 `--font-pretendard` · `--font-spoqa` · `--font-mono`를 앱이 정의한다
  (Next는 `next/font/local`, 그 외는 `@font-face`).
- 화면 전용 토큰: 한 앱에서만 뜻이 통하는 값은 그 앱 CSS에 둔다.
- `html`/`body` 리셋과 스크롤바도 앱 몫이다 (패키지는 토큰만 준다).

**3. 바깥 세계 주입** — 이 패키지는 라우터도 백엔드도 모른다. 앱 진입점에서 한 번:

```tsx
import NextLink from "next/link";
import { configure } from "bongchil-design-system";

configure({
  Link: NextLink,                          // href를 받은 컴포넌트가 쓸 링크 (기본: <a>)
  uploadImage: (blob) => uploadFile(blob), // ImageEditor 업로드처 (기본: 실패)
  proxySrc: (src) => toSameOrigin(src),    // 캔버스 오염 회피용 주소 변환 (기본: 그대로)
  ownerName: () => profileName,            // 방문자가 주인장 이름을 못 쓰게 (기본: 검사 안 함)
});
```

넘긴 항목만 덮어쓴다. Next 앱은 `next.config.ts`에 `transpilePackages: ["bongchil-design-system"]`도 필요하다.

**4. 유리를 쓴다면** — `LiquidGlass`는 SVG 필터를 쓴다. 앱 루트에 `<LiquidGlassDefs />`를 한 번 둔다.

## 들어있는 것

| | |
| --- | --- |
| 표면 | `BasicGlass` · `LiquidGlass`/`LiquidGlassDefs` · `ModalProvider`/`useModal` · `BottomSheet` · `DockPopover` |
| 컨트롤 | `Button`(+grain) · `IconButton` · `Toggle` · `TodoCheckbox` · `Segmented` · `FilterChips` · `HeartRating` |
| 날짜 | `DatePicker`/`DatePickerCalendar` · `MonthPicker` · `DateRangeText` |
| 카테고리 | `CategoryChip` · `CategoryPill` · `CategoryMark` · `CategorySelect` · `CategoryIcon` |
| 레이아웃 | `NavTabs` · `PageTitle` · `PageContainer` |
| 카드 · 종이 | `PostItCard` · `CoverFrame` · `NoticeArea` |
| 피드백 | `ToastProvider`/`useToast` · `EmptyState` · `Skeleton` · `Tooltip` |
| 모션 · 장식 | `StickerImage` · `PaletteBlobs` · `TextSwapper` · 아이콘 hover(`icon-*`) |
| 임베드 | `EmbedCard`(표지 · CD · 본문 한 줄) · `VideoEmbed` + 마크업 · 주소 유틸 |
| 아이콘 | `CategoryIcon` · `WeatherIcon` · `WishIcon` · `RecommendationIcon` |
| 방문자 | `GuestTag`/`GuestName` · `GuestAvatar`/`GuestSwatch` + 정체성 · 닉네임 함수 |
| 그 외 | `ImageEditor` · `useImagePalette` · `useFileDrop` · 날짜 · 임베드 · 저장소 유틸 |
| CSS | `tokens.css`(색 · 타이포 · accent · 방문자 색) · `components.css`(재질 · 모션 · 컴포넌트 규칙) |

쓰는 규칙(어떤 variant를 언제 쓰나)은 각 컴포넌트 머리 주석에 있다.

**아직 안 가져온 것** — `PageHeader` · `StoryNav` · `Lightbox` · `PlaceBadge` · `GuestStamp`
(링크 · 인증 · 이미지를 주입으로 끊는 작업이 남음).

**일기에 둔 것** — `FieldGroup` · `PostHeader` · `AsideColumn` · `SubTitle` · `FadeDivider` ·
`DraftResumeCard` · `Quote` · `CountAccent`. 일기 화면에서만 뜻이 통한다.

**안 가져올 것** — 라우트를 하드코딩한 탭 훅, 서버 프록시가 필요한 링크 미리보기 조회, 앱 부팅 코드.
라우팅 · 데이터 조회 · 부팅은 앱 몫이다.

## 토큰 쓰는 법

| 쓰임 | 토큰 |
| --- | --- |
| 본문 글자 | `ink` · `ink-2` (대비 11:1 이상) |
| 날짜 · 라벨 같은 곁들이 | `ink-3` |
| 선 · 점 장식 | `ink-4` · `ink-5` — **글자에 쓰지 않는다** (각각 2.9:1 · 1.7:1) |
| 면 | `surface` · `surface-warm` · `surface-subtle` · `desk`(책상 바탕) |
| 포인트 | `primary` · `primary-hover` · `primary-subtle` · `primary-muted` · `primary-light` |
| 분류 색 | `comment-green` · `sky` · `sand` · `mint` · `pink` · `brown` · `charcoal` (+ `-solid`) |
| 배경 | `--desk-bg`(크림 + 좌상단 accent glow) · `--preview-base` |
| 그림자 | `rgb(var(--shadow-ink)/0.08)` — 검정 대신 따뜻한 회갈 |

`--accent-rgb` 하나만 갈아끼우면 glow · 스크롤바 · 칩 오라가 전부 따라온다.
테마 분기는 `.dark` 클래스가 아니라 **시맨틱 토큰**으로 한다.

## 주의할 점

- **모서리 토큰은 `rounded-[var(--radius-l)]`로 쓴다.** `rounded-l`은 Tailwind에서 **왼쪽 면**,
  `rounded-s`는 **시작 면**이라 이름이 겹친다(`rounded-m`만 안 겹침). 겹친 이름으로 쓰면 한쪽 모서리만 둥글어진다.
- **토큰을 `--container-max`처럼 짓지 않는다.** Tailwind v4는 `--container-*`를 `w-`/`max-w-` 크기로 읽어서
  `w-max`(내용 폭)가 그 값으로 덮인다. 그래서 페이지 폭 토큰은 `--page-max`다.
- **`node_modules` 안의 CSS는 HMR이 못 잡는다.** 토큰을 고치면 소비 앱의 dev 서버를 재시작해야 한다.
- **`.glass` 재질은 호출부 `className`으로 못 덮는다** — unlayered 규칙이라 Tailwind 유틸(`!` 포함)을 항상 이긴다.
- **`backdrop-filter`는 CSS 파일에서 죽는다.** 블러는 인라인 `style`로 준다 (`LiquidGlass`가 그렇게 한다).
- **Tailwind v4 `dark:` 변형은 OS 설정을 따른다** (앱의 `.dark` 클래스가 아님).
- **컴포넌트를 가져가면 앱 쪽 같은 CSS 규칙을 지운다.** 안 지우면 화면은 멀쩡한데 고칠 곳이 두 군데가 된다.

## 카탈로그

```bash
pnpm install
pnpm dev            # http://localhost:7788
```

`demo/`는 이 패키지를 workspace 심링크로 붙인 Vite 앱이다 — 실제 소비 경로(`exports`)를 그대로
타면서 패키지 소스를 고치면 HMR이 바로 붙는다.

좌측에 검색 가능한 스토리 목록, 본문에 미리보기 · props 손잡이 · 코드 스니펫이 있다.
손잡이를 돌리면 미리보기와 코드가 같이 바뀐다. 좌측 아래에서 라이트/다크와 accent 5종을
갈아끼워 토큰이 실제로 따라 움직이는지 확인한다.

스토리를 추가하려면 `demo/src/stories.tsx`의 `STORIES` 배열에 한 칸 넣는다 —
`controls`에 손잡이를, `render(p)`에 실물을, `code(p)`에 스니펫을 적으면 나머지는 셸이 한다.
`main`에 올리면 카탈로그가 자동 배포된다.

## 고치고 내보내기

```bash
pnpm check              # 패키지 타입체크 + CSS 온전성
cd demo && pnpm build   # 카탈로그 (타입체크 + 번들)
```

`scripts/check-css.mjs`는 CSS를 옮기다 조용히 깨지는 것들을 잡는다 — 중괄호 불균형,
잘려서 다음 주석까지 삼키는 주석, 쓰이지 않는 임베드 규칙, 위에 적은 토큰 이름 충돌.

내보내는 순서:

1. `pnpm check` 통과시키고 커밋
2. 태그를 찍는다 — `git tag v0.1.3 && git push origin v0.1.3`
3. 소비 앱에서 `package.json`의 태그를 올리고 설치 → 화면 확인 후 커밋

## 쓰는 곳

| 앱 | 쓰는 방식 |
| --- | --- |
| [bongchil-diary](https://github.com/E-JIWON/bongchil-diary) | 공통 컴포넌트를 한 번에 하나씩 이 패키지로 옮기는 중 (옮긴 것은 `/component`에서 본다) |
| 웹 이력서 | 토큰 · 버튼 · 세그먼트 · 모달 사용 |
