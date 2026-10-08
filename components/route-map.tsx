'use client'

import { MapContainer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'

type Coordinate = [number, number]

const fallbackRoute: Coordinate[] = [
  [-3.7275, -38.5275],
  [-3.724, -38.518],
  [-3.713, -38.507],
  [-3.704, -38.497],
  [-3.694, -38.488],
  [-3.683, -38.482],
  [-3.671, -38.486],
  [-3.658, -38.495],
  [-3.646, -38.505],
  [-3.634, -38.517],
  [-3.622, -38.531],
  [-3.612, -38.548],
  [-3.604, -38.566],
  [-3.6005, -38.584],
  [-3.6105, -38.61],
]

const makeIcon = (color: string, label: string, glyph: string) =>
  L.divIcon({
    className: 'usefrete-marker',
    html: `<span aria-label="${label}" style="background:${color}; box-shadow: 0 0 0 5px ${color}33"><b>${glyph}</b></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

function NavigationCamera({ origin, route, navigation }: { origin: Coordinate; route: Coordinate[]; navigation: boolean }) {
  const map = useMap()
  const bearing = useMemo(() => {
    const next = route.find((point) => Math.hypot(point[0] - origin[0], point[1] - origin[1]) > 0.0003) ?? route[1]
    if (!next) return 0
    const radians = Math.atan2(next[1] - origin[1], next[0] - origin[0])
    return (radians * 180) / Math.PI
  }, [origin, route])
  useEffect(() => {
    if (navigation) map.setView(origin, Math.max(map.getZoom(), 15), { animate: true })
    else if (route.length > 1) map.fitBounds(route, { padding: [42, 42] })
  }, [map, navigation, origin, route])
  useEffect(() => {
    const container = map.getContainer()
    container.style.setProperty('--nav-bearing', `${-bearing}deg`)
    container.classList.toggle('usefrete-navigation-camera', navigation)
    return () => container.classList.remove('usefrete-navigation-camera')
  }, [bearing, map, navigation])
  return null
}

function MapControls({ route }: { route: Coordinate[] }) {
  const map = useMap()
  return (
    <div className="pointer-events-auto absolute right-4 top-1/2 z-[500] flex -translate-y-1/2 flex-col gap-2">
      <button type="button" aria-label="Aumentar zoom" onClick={() => map.zoomIn()} className="flex size-11 items-center justify-center rounded-full bg-black/85 text-2xl font-light text-white shadow-xl">+</button>
      <button type="button" aria-label="Diminuir zoom" onClick={() => map.zoomOut()} className="flex size-11 items-center justify-center rounded-full bg-black/85 text-2xl font-light text-white shadow-xl">−</button>
      <button type="button" aria-label="Visualizar rota completa" onClick={() => map.fitBounds(route, { padding: [42, 42] })} className="flex size-11 items-center justify-center rounded-full bg-black/85 text-lg text-white shadow-xl">◎</button>
    </div>
  )
}

export function RouteMap({ origin, destination, route = fallbackRoute, navigation = false }: { origin?: Coordinate; destination?: Coordinate; route?: Coordinate[]; navigation?: boolean }) {
  const actualOrigin = origin ?? route[0]
  const actualDestination = destination ?? route[route.length - 1]
  const points = useMemo(() => {
    if (!origin) return route
    const nearestIndex = route.reduce((best, point, index) => {
      const bestDistance = Math.hypot(route[best][0] - origin[0], route[best][1] - origin[1])
      const distance = Math.hypot(point[0] - origin[0], point[1] - origin[1])
      return distance < bestDistance ? index : best
    }, 0)
    return [origin, ...route.slice(nearestIndex + 1)]
  }, [origin, route])

  return (
    <MapContainer center={actualOrigin} zoom={12} scrollWheelZoom zoomControl={false} className="usefrete-offline-map h-full w-full">
      <NavigationCamera origin={actualOrigin} route={points} navigation={navigation} />
      <Polyline positions={points} pathOptions={{ color: '#ffffff', weight: 11, opacity: 0.9 }} />
      <Polyline positions={points} pathOptions={{ color: '#FF4500', weight: 7, opacity: 1 }} />
      <Marker position={actualOrigin} icon={makeIcon('#000080', 'Localização atual', '●')}>
        <Popup>Você está aqui</Popup>
      </Marker>
      <Marker position={actualDestination} icon={makeIcon('#FF4500', 'Destino da entrega', '▰')}>
        <Popup>Destino da entrega</Popup>
      </Marker>
      <MapControls route={points} />
    </MapContainer>
  )
}
