'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, X } from 'lucide-react'

const RouteMap = dynamic(() => import('./route-map').then((module) => module.RouteMap), { ssr: false })
type Coordinate = [number, number]

export function ExpandableRouteMap({ origin, destination, route }: { origin: Coordinate; destination: Coordinate; route: Coordinate[] }) {
  const [expanded, setExpanded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!expanded) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown) }
  }, [expanded])

  return <>
    <div className="relative h-full w-full">
      <RouteMap origin={origin} destination={destination} route={route} />
      <button type="button" onClick={() => setExpanded(true)} className="absolute left-3 top-3 z-[600] flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-[#071a9a] shadow-lg" aria-label="Expandir mapa"><Maximize2 className="size-4" /> Expandir mapa</button>
    </div>
    {expanded && createPortal(<div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/75 p-2 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setExpanded(false) }}>
      <section role="dialog" aria-modal="true" aria-label="Mapa expandido do transporte" className="flex h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:h-[calc(100dvh-3rem)] sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3"><div><p className="text-xs font-black uppercase tracking-wider text-[#f5a800]">Acompanhamento</p><h2 className="text-lg font-black text-[#071a9a]">Mapa da operação</h2></div><button ref={closeRef} type="button" onClick={() => setExpanded(false)} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#071a9a] px-4 text-sm font-black text-white" aria-label="Fechar mapa"><X className="size-4" /> Fechar</button></div>
        <div className="min-h-0 flex-1"><RouteMap origin={origin} destination={destination} route={route} expanded /></div>
        <p className="shrink-0 px-4 py-2 text-[11px] text-slate-500">Rota e posição do motorista simuladas · use dois dedos para mover ou ampliar no celular.</p>
      </section>
    </div>, document.body)}
  </>
}
