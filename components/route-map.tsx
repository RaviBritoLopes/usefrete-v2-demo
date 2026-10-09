'use client'

import { useEffect, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Coordinate = [number, number]
const makeIcon = (color: string, label: string) => L.divIcon({ className: 'usefrete-marker', html: `<span style="background:${color}" title="${label}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] })

function FitRoute({ route }: { route: Coordinate[] }) {
  const map = useMap()
  useEffect(() => { map.fitBounds(route, { padding: [36, 36] }) }, [map, route])
  return null
}

function MapControls({ route }: { route: Coordinate[] }) {
  const map = useMap()
  return <div className="pointer-events-auto absolute right-3 top-3 z-[500] flex flex-col gap-2"><button type="button" aria-label="Aumentar zoom" onClick={() => map.zoomIn()} className="size-11 rounded-xl bg-white text-2xl font-bold text-[#071a9a] shadow">+</button><button type="button" aria-label="Diminuir zoom" onClick={() => map.zoomOut()} className="size-11 rounded-xl bg-white text-2xl font-bold text-[#071a9a] shadow">−</button><button type="button" aria-label="Visualizar rota completa" onClick={() => map.fitBounds(route, { padding: [36, 36] })} className="size-11 rounded-xl bg-white text-xl font-bold text-[#071a9a] shadow">◎</button></div>
}

export function RouteMap({ origin, destination, route, navigation = false }: { origin: Coordinate; destination: Coordinate; route: Coordinate[]; navigation?: boolean }) {
  const [offline, setOffline] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failedTiles, setFailedTiles] = useState(0)
  useEffect(() => {
    const update = () => { setOffline(!navigator.onLine); if (navigator.onLine) { setFailedTiles(0); setLoaded(false) } }
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])
  const showFallback = offline || (!loaded && failedTiles >= 3)
  return <div className="relative h-full w-full overflow-hidden bg-[#dfeaec]">
    {!showFallback && <MapContainer center={origin} zoom={9} scrollWheelZoom zoomControl={false} className="h-full w-full" preferCanvas><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileload: () => setLoaded(true), tileerror: () => setFailedTiles((count) => count + 1) }} /><FitRoute route={route} /><Polyline positions={route} pathOptions={{ color: '#071a9a', weight: 6, opacity: 0.9 }} /><Marker position={origin} icon={makeIcon('#071a9a', 'Origem')}><Popup>Origem · Fortaleza</Popup></Marker><Marker position={destination} icon={makeIcon('#f5a800', 'Destino')}><Popup>Destino · Sobral</Popup></Marker><Marker position={route[Math.min(2, route.length - 1)]} icon={makeIcon('#0f766e', 'Motorista simulado')}><Popup>Motorista · posição simulada</Popup></Marker><MapControls route={route} /></MapContainer>}
    {showFallback && <div className="relative h-full w-full bg-[#dce8e4]" role="img" aria-label="Mapa local simplificado da rota Fortaleza a Sobral"><img src="/offline-route.svg" alt="Rota simplificada de Fortaleza até Sobral" className="h-full w-full object-contain" /><span className="absolute left-3 top-3 rounded-full bg-white px-3 py-2 text-xs font-black text-[#071a9a] shadow">Modo offline · mapa simplificado</span><button type="button" onClick={() => { setFailedTiles(0); setLoaded(false); setOffline(!navigator.onLine) }} className="absolute bottom-3 right-3 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#071a9a] shadow">Tentar mapa online</button></div>}
    {!showFallback && !loaded && <span className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-[#071a9a]">Carregando mapa…</span>}
    {navigation && <span className="absolute bottom-3 left-3 z-[500] rounded-lg bg-white/90 px-2 py-1 text-[10px] text-slate-600">Posição simulada</span>}
  </div>
}
