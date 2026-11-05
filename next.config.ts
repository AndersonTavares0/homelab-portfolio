import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const withMDX = createMDX({ extension: /\.(md|mdx)$/ });

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  output: 'export',
  basePath: process.env.SITE_BASE_PATH || '',
  trailingSlash: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: { unoptimized: true },
  poweredByHeader: false
};

export default withMDX(nextConfig);
