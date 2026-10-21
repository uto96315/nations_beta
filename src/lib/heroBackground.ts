import type { CSSProperties } from "react";

/** 国会・ヘッダー用背景（public/images/bg.png） */
export const HERO_BG_IMAGE = "/images/bg.png";

export const HERO_BG_STYLE: CSSProperties = {
  backgroundImage: `linear-gradient(
      105deg,
      rgba(26, 39, 68, 0.93) 0%,
      rgba(26, 39, 68, 0.55) 38%,
      rgba(255, 255, 255, 0.75) 72%,
      rgba(248, 250, 252, 0.92) 100%
    ), url('${HERO_BG_IMAGE}')`,
  backgroundSize: "cover",
  backgroundPosition: "center right",
  backgroundRepeat: "no-repeat",
};

export const LANDING_HERO_STYLE: CSSProperties = {
  backgroundImage: `linear-gradient(
      105deg,
      rgba(26, 39, 68, 0.92) 0%,
      rgba(26, 39, 68, 0.65) 45%,
      rgba(26, 39, 68, 0.35) 100%
    ), url('${HERO_BG_IMAGE}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};
