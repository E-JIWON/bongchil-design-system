# bongchil-design-system

봉칠 디자인 시스템 — 토큰 · 재질 · 컨트롤 컴포넌트.
[bongchil-diary](https://github.com/bongchil/bongchil-diary)의 `shared/ui`에서 뽑아냈다.

**빌드가 없다.** 소스(`src/`)를 그대로 내보내고 소비 앱이 자기 번들러로 트랜스파일한다.
Next 의존도 없다 — 링크는 주입, 인증은 prop.

## 설치

```bash
# 개발 중 (HMR이 붙는다)
pnpm add "bongchil-design-system@file:../bongchil-design-system"

# 배포용
pnpm add github:bongchil/bongchil-design-system
```

## 붙이기

**1. CSS** — 앱의 전역 스타일시트에서:

```css
@import "tailwindcss";
@import "bongchil-design-system/tokens.css";
@import "bongchil-design-system/components.css";

@source "../node_modules/bongchil-design-system/src";
```

> ⚠️ **`@source` 가 빠지면 에러 없이 스타일만 전부 사라진다.** Tailwind v4는 `node_modules`를 스캔하지 않는다.
> `file:` 프로토콜로 심링크된 경우 실제 경로(`../bongchil-design-system/src`)를 함께 적어야 할 수 있다.

**2. 앱이 소유하는 것** — 이 패키지는 화면 전용 토큰과 폰트를 싣지 않는다.

- 폰트: 토큰이 참조하는 `--font-pretendard` · `--font-spoqa` · `--font-mono` 를 앱이 정의한다
  (Next는 `next/font/local`, 그 외는 `@font-face`).
- 화면 전용 토큰: 일기라면 `--color-note-*`(인쇄물) · `--dashboard-max` · `--photo-glow` ·
  `--bleed-opacity`. 한 앱에서만 뜻이 통하는 값은 그 앱 CSS에 둔다.
- `html`/`body` 리셋과 스크롤바도 앱 몫이다 (패키지는 토큰만 준다).

**3. 바깥 세계 주입** — 이 패키지는 라우터도 백엔드도 모른다. 앱 진입점에서 한 번:

```tsx
import NextLink from "next/link";
import { configure } from "bongchil-design-system";

configure({
  Link: NextLink,                          // href를 받은 컴포넌트가 쓸 링크 (기본: <a>)
  uploadImage: (blob) => uploadFile(blob), // ImageEditor 업로드처 (기본: 실패)
  proxySrc: (src) => toSameOrigin(src),    // 캔버스 오염 회피용 주소 변환 (기본: 그대로)
  ownerName: () => blogConfig.profileName, // 방문자가 주인장 이름을 못 쓰게 (기본: 검사 안 함)
});
```

넘긴 항목만 덮어쓴다. Next 앱은 `next.config.ts`에 `transpilePackages: ["bongchil-design-system"]`도 필요하다.

## 들어있는 것

| | |
| --- | --- |
| 표면 | `BasicGlass` · `LiquidGlass` · `ModalProvider`/`useModal` · `BottomSheet` · `DockPopover` |
| 컨트롤 | `Button`(+grain) · `IconButton` · `Toggle` · `TodoCheckbox` · `HypeDots` · `HeartRating` · `FilterChips` |
| 날짜 | `DatePicker`/`DatePickerCalendar` · `MonthPicker` · `DateRangeText` |
| 카테고리 | `CategoryChip` · `CategoryPill` · `CategoryMark` · `CategorySelect` · `CategoryIcon` |
| 레이아웃 | `NavTabs` · `PageTitle` · `PageContainer` |
| 카드·종이 | `PostItCard` · `CoverFrame` · `NoticeArea` |
| 피드백 | `ToastProvider`/`useToast` · `EmptyState` · `Skeleton` |
| 모션 | `StickerPhotoButton` · `PaletteBlobs` · 아이콘 hover(`icon-*`) |
| 임베드 | `EmbedCard`(표지·CD·본문 한 줄) · `VideoEmbed` + 마크업·URL 유틸 |
| 아이콘 | `CategoryIcon` · `WeatherIcon` · `WISH_CAT_ICONS` · `RecommendationIcon` |
| 방문자 | `GuestTag`/`GuestName` · `GuestAvatar`/`GuestSwatch` + 정체성·닉네임 함수 |
| 그 외 | `ImageEditor` · `Tooltip` · `TextSwapper` · `useImagePalette` · `useFileDrop` |
| CSS | `tokens.css`(색·타이포·accent·방문자 색) · `components.css`(재질·모션·컴포넌트 규칙) |

**아직 안 가져온 것** — `PageHeader` · `StoryNav` · `Lightbox` · `PlaceBadge` · `GuestStamp`
(링크·인증·이미지를 주입으로 끊는 작업이 남음). 기능 화면 조각(필름롤·감상 티켓·폴라로이드·
타임라인·독)은 포트폴리오 설계 때 골라서 뽑는다.

**일기에 둔 것** — `FieldGroup` · `PostHeader` · `AsideColumn` · `SubTitle` · `FadeDivider` ·
`DraftResumeCard` · `Quote` · `CountAccent` (일기 화면에서만 뜻이 통함, 일기 `/component`에서 본다).

**안 가져올 것** — `useNavTabs`/`useNavSwipe`(일기 라우트를 하드코딩), `fetchOg`(서버 프록시가
필요한 OG 조회), `ConfigApplier`(일기 부팅 코드). 라우팅·데이터 조회·부팅은 앱 몫이다.

쓰는 규칙(어떤 variant를 언제 쓰나)은 각 컴포넌트 머리 주석에 있다.

## 주의할 점

- **모서리 토큰은 `rounded-[var(--radius-l)]` 로 쓴다.** `rounded-l` 은 Tailwind에서 **왼쪽 면**,
  `rounded-s` 는 **시작 면**이라 이름이 겹친다 (`rounded-m` 만 안 겹침). 겹친 이름으로 쓰면 한쪽 모서리만 둥글어진다.
- **토큰을 `--container-max`처럼 짓지 않는다.** Tailwind v4는 `--container-*`를 `w-`/`max-w-` 크기로 읽어서
  `w-max`(내용 폭)가 그 값으로 덮인다. 그래서 페이지 폭은 `--page-max`다 — 일기에서 가져올 때 이름을 바꿔야 한다.
- **일기와 CSS 규칙 69개가 겹친다.** 일기가 이 패키지를 쓰기 시작할 때, 패키지가 가져간 규칙
  (`.glass` · `.liquid-glass` · `.nav-aura-pill` · `.icon-*` · 임베드 카드)을 일기의
  `utilities.css`/`animations.css`/`editor.css`에서 **지워야 한다**. 안 지우면 내용이 같아
  화면은 안 깨지지만 고칠 곳이 두 군데가 된다.
- **`node_modules` 안의 CSS는 HMR이 못 잡는다.** 토큰을 고치면 소비 앱의 dev 서버를 재시작해야 한다. 개발 중엔 `file:` 설치를 권장.
- **`.glass` 재질은 호출부 `className`으로 못 덮는다** — unlayered 규칙이라 Tailwind 유틸(`!` 포함)을 항상 이긴다.
- **Tailwind v4 `dark:` 변형은 OS 설정을 따른다** (앱의 `.dark` 클래스가 아님). 테마 분기는 시맨틱 토큰으로.

## 카탈로그 보기

주소 뒤에 `#스토리id`를 붙이면 그 스토리로 바로 열린다 (`localhost:7788/#date-picker`).

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

```bash
pnpm check              # 패키지 타입체크 + CSS 온전성
cd demo && pnpm build   # 데모 (타입체크 + 번들)
```

`scripts/check-css.mjs`는 CSS를 옮기다 조용히 깨지는 것들을 잡는다 — 중괄호 불균형,
잘려서 다음 주석까지 삼키는 주석, 아무도 안 쓰는 `embed-*` 규칙.
