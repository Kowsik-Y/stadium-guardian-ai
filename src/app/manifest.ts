import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stadium Guardian AI',
    short_name: 'StadiumGuardian',
    description:
      'Explainable AI-powered real-time safety, crowd, and sustainability control for FIFA World Cup mega-stadium operations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617', // bg-slate-950
    theme_color: '#10b981', // emerald-500
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
