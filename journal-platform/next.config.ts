import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

// TODO: Enable BotID when deploying to Vercel
// import { withBotId } from 'botid/next/config';
// export default withBotId(nextConfig);

export default nextConfig;
