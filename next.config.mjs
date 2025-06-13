/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle-Optimierungen
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@tanstack/react-query',
      'react-markdown',
      'react-syntax-highlighter',
    ],
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // Kompression
  compress: true,

  // Bundle-Analyze (für Debugging)
  ...(process.env.ANALYZE === 'true'
    ? {
        webpack: (config) => {
          config.plugins.push(
            new (require('@next/bundle-analyzer'))({
              enabled: true,
            })
          );
          config.resolve.alias = {
            ...config.resolve.alias,
            zod: require.resolve('zod/v4'),
          };
          return config;
        },
      }
    : {}),

  // Bilder-Optimierung
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Ausgabe-Optimierung
  output: 'standalone',

  // PoweredBy Header entfernen
  poweredByHeader: false,
};

export default nextConfig;
