# 배포 — 퇴사노트 (toesa.lifebanjang.com)

생활반장 노트 시리즈의 배포 방식을 그대로 따른다. **배포는 `git push origin main`만 사용**(Vercel 자동 배포). CLI 직접 배포 금지.

> ⚠️ **배포 시점 주의 — 애드센스 재심사 전에는 배포하지 않는다.**
> 2026-08-19 애드센스가 lifebanjang.com을 "가치가 별로 없는 콘텐츠"로 반려했다.
> 크롤 이력이 없는 새 서브도메인을 재심사 직전에 같은 도메인 속성에 얹으면
> 반려 사유를 되살릴 수 있다. **승인 확인 후에 1~3단계를 진행할 것.**
> 그때까지는 로컬(포트 4500)에서만 돌린다.

## 1. GitHub 레포 생성

아직 레포가 없다. 아래 중 하나로 만든다.

```powershell
$env:Path = "E:\클로드\tools\node;$env:Path"
cd E:\클로드\toesa-note
git init
git branch -M main
git config credential.helper manager
git config user.name "Claude Code"
git config user.email "cdkjjang@gmail.com"
git add -A
git commit -F commit-msg.txt   # 한국어 메시지는 UTF-8 파일로
git remote add origin https://github.com/cdkjjang/toesa-note.git
git push -u origin main
```

레포는 GitHub 웹에서 `toesa-note` 이름으로 먼저 만들어 두거나, 포터블 gh를 쓴다.

```powershell
& "E:\클로드\tools\gh\bin\gh.exe" repo create toesa-note --private --source . --push
```

> 새로 `git init`한 레포는 자격증명 헬퍼가 없어 `git config credential.helper manager` 선설정이 필요하다.
> 전역 user.name/user.email이 비어 있어 레포마다 설정해야 커밋이 된다.
> 기존 레포들은 Windows 자격 증명 관리자(git:https://github.com)에 저장된 정보로 인증된다.

## 2. Vercel 연결

1. Vercel 대시보드 → Add New Project → `toesa-note` 레포 임포트
2. Framework: Next.js (자동 감지, `vercel.json`에 명시됨)
3. 환경변수:
   - `NEXT_PUBLIC_SITE_URL` = `https://toesa.lifebanjang.com`
   - `NEXT_PUBLIC_ADSENSE_CLIENT`는 설정하지 않아도 된다. 코드에 기본값
     `ca-pub-6029964277117053`이 들어 있다.
4. Deploy

## 3. 도메인 연결

1. Vercel 프로젝트 → Settings → Domains → `toesa.lifebanjang.com` 추가
2. 가비아 DNS에 CNAME 레코드 추가
   - 호스트: `toesa`
   - 값: `cname.vercel-dns.com`
3. 전파 후 Vercel에서 유효성 확인 (보통 몇 분)

## 4. 검색엔진 등록

- **구글**: `sc-domain:lifebanjang.com` 도메인 속성으로 자동 커버된다.
  Search Console → Sitemaps에서 `https://toesa.lifebanjang.com/sitemap.xml`만 제출하면 된다.
  배포 직후 `https://toesa.lifebanjang.com/` URL 검사 → 색인 요청을 해 두면 크롤링이 빨라진다.
- **네이버**: 서치어드바이저에 사이트를 개별 등록해야 한다.
  `app/layout.tsx`의 `metadata`에는 **현재 verification 항목이 비어 있다**(다른 노트 코드를
  그대로 두면 소유확인이 실패하므로 지워 두었다).
  1. 서치어드바이저에서 `https://toesa.lifebanjang.com` 등록
  2. 발급받은 값으로 `app/layout.tsx`에 아래를 추가

     ```ts
     verification: { other: { "naver-site-verification": "<발급받은 값>" } },
     ```
  3. 커밋·푸시 후 소유확인 → 사이트맵 제출

## 5. 배포 후 확인

```powershell
$ProgressPreference='SilentlyContinue'
foreach($p in @("/","/calc/benefit","/calc/eligibility","/calc/early","/calc/health","/guide","/ads.txt","/sitemap.xml")){
  try{ $r=Invoke-WebRequest "https://toesa.lifebanjang.com$p" -UseBasicParsing -TimeoutSec 30; "$p => $($r.StatusCode)" }
  catch{ "$p => ERR" }
}
```

- `/ads.txt`가 `google.com, pub-6029964277117053, DIRECT, f08c47fec0942fa0`를 반환하는지
- 홈 원본 HTML `<head>`에 애드센스 script 태그가 있는지
- 사이트맵 URL(정적 7 + 계산기 4 + 가이드 10 = **21개**)이 전부 200인지

## 6. 허브 반영 (로컬 완료, 배포 대기)

- `lifebanjang-hub/lib/notes.ts` — toesa 항목 추가됨 (emoji 🚪, 계산기 4개 딥링크)
- `lifebanjang-hub/lib/article-intros.ts` — `/articles/toesa` 해설 추가됨
- `lifebanjang-hub/lib/guides-4.ts` — 허브 가이드 `job-loss`가 퇴사노트 계산기로 링크
- `lifebanjang-hub/scripts/gen-note-guides.mjs` — NOTE_DIRS에 toesa 추가
- `lifebanjang-hub/lib/note-guides.ts` — 재생성 완료 (319 → **329편**)
- 전 노트 `components/FamilyLinks.tsx` — toesa 한 줄 추가됨 (15개 사이트)
- 워크스페이스 `.claude/launch.json` — `toesa-note-dev` (포트 4500)

**허브와 다른 14개 노트도 함께 푸시해야 크로스링크가 반영된다.**
다만 위의 배포 시점 주의를 지킬 것 — 애드센스 승인 전에는 크로스링크만 먼저 나가도
`toesa.lifebanjang.com`이 아직 없어 404 링크가 되므로, **전부 같은 시점에 배포한다.**
