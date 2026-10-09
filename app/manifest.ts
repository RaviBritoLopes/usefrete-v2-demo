import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Use Frete · Demonstração STS',
    short_name: 'Use Frete',
    description: 'Demonstração de compatibilidade para cargas de baixa antecedência.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f4f5ef',
    theme_color: '#071a9a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  }
}
