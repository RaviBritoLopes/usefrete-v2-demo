'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || location.hostname === 'localhost' && process.env.NODE_ENV !== 'production') return
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        const ready = await navigator.serviceWorker.ready
        const assets = Array.from(document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src],link[rel="stylesheet"][href]')).map((element) => element instanceof HTMLScriptElement ? element.src : element.href).filter((url) => new URL(url).origin === location.origin)
        ;(ready.active ?? registration.active)?.postMessage({ type: 'CACHE_SHELL', assets })
      } catch { /* a demo continua online se SW estiver indisponível */ }
    }
    if (document.readyState === 'complete') void register()
    else window.addEventListener('load', register, { once: true })
    return () => window.removeEventListener('load', register)
  }, [])
  return null
}
