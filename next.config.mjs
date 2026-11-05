/** @type {import('next').NextConfig} */
const MOVED = {
  "/calendar": "/marketing/calendar",
  "/platforms": "/marketing/platforms",
  "/kpis": "/marketing/performance",
  "/toolkit": "/marketing/toolkit",
  "/plan": "/marketing/plan",
  "/assets": "/marketing/assets",
  "/tasks": "/company/tasks",
  "/decisions": "/company/decisions",
  "/integrations": "/company/integrations",
  "/team": "/company/team",
};

const nextConfig = {
  experimental: { serverActions: { bodySizeLimit: "50mb" } },
  async redirects() {
    return Object.entries(MOVED).map(([source, destination]) => ({ source, destination, permanent: false }));
  },
};
export default nextConfig;
