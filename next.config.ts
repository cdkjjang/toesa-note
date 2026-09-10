import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 보안 헤더 — 콘텐츠나 광고 동작에는 영향을 주지 않는다.
  // HSTS와 HTTPS 리다이렉트는 Vercel이 처리하므로 여기서는 세 가지만 둔다.
  // X-Frame-Options는 SAMEORIGIN — 광고는 우리 페이지 '안에' 들어오는
  // iframe이라 이 헤더의 영향을 받지 않는다.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // 이 사이트는 카메라·마이크·위치·결제를 쓰지 않는다. 명시적으로 꺼 두면
          // 광고 iframe을 포함한 하위 프레임에서도 요청할 수 없다.
          // 애드센스가 쓰는 기능이 아니라 광고 게재에 영향이 없다.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },

  // 2026-09-10 가이드 통합으로 사라진 슬러그 → 흡수한 글로 301.
  //
  // permanent: true는 308로 나가고 구글은 301과 같게 처리한다.
  // **이 목록을 지우지 말 것.** 지우는 순간 옛 URL이 404가 된다.
  //
  // 퇴사 후 건강보험과 국민연금은 둘 다 '소득이 끊긴 동안의 4대보험'이라
  // 한 글로 합쳤다. 둘 다 1,300~1,400자대로 얇았다.
  // ⚠️ 목적지 `health-insurance-after-quitting`은 **급여노트와 건강보험노트가
  //    301로 보내오는 슬러그**다(워크스페이스 CLAUDE.md 8장, 3중복 해소).
  //    이 슬러그를 바꾸면 저쪽 두 노트가 조용히 404가 된다.
  async redirects() {
    return [
      {
        source: "/guide/national-pension-after-quitting",
        destination: "/guide/health-insurance-after-quitting",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
