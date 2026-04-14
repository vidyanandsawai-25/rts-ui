import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Turbopack is enabled via CLI flag --turbo
  // No additional configuration needed in next.config.ts for Turbopack
  experimental: {
    // Add experimental features here if needed
  },
  
  // Production optimizations
  // swcMinify is enabled by default in Next.js 13+
  
  // Output configuration for production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Include locale files in standalone build (required for next-intl)
  outputFileTracingIncludes: {
    '/*': ['./src/i18n/locales/**/*'],
  },
  
  // Performance optimizations
  compress: true,
  
  // Enable static optimization
  trailingSlash: false,
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
