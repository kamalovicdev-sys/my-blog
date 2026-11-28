import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Saytdagi versiya qaysi commitdan build qilingan (Netlify build paytida COMMIT_REF beradi, lokalda bo'sh).
    // Admin paneldagi Deploy tugmasi undan keyingi commitlarni "saytga hali chiqmagan" deb ko'rsatadi
    BUILD_COMMIT: process.env.COMMIT_REF ?? "",
  },
};

export default nextConfig;
