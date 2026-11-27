/** @type {import('next').NextConfig} */

// GitHub Pages serves the site from https://<user>.github.io/<repo>/,
// so every route and asset needs the repo name as a prefix.
// The workflow sets NEXT_PUBLIC_BASE_PATH; local dev leaves it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export', // emit a fully static site into ./out
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
