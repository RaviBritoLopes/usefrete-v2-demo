export type Role = 'contractor' | 'carrier'

export type DemoProfile = {
  id: string
  role: Role
  name: string
  company: string
  phone: string
  email: string
  city: string
  vehicle: string
  body: string
  capacity: string
  plate: string
  rntrc: string
}

export const demoProfiles: DemoProfile[] = [
  { id: 'demo-contractor', role: 'contractor', name: 'Marina Costa', company: 'Construtora Atlântico', phone: '(85) 99999-0000', email: 'marina@demo.usefrete', city: 'Fortaleza', vehicle: '', body: '', capacity: '', plate: '', rntrc: '' },
  { id: 'demo-carrier', role: 'carrier', name: 'João Silva', company: '', phone: '(85) 98888-0000', email: 'joao@demo.usefrete', city: 'Fortaleza', vehicle: 'Truck', body: 'Carroceria aberta', capacity: '5 t', plate: 'DEM-2026', rntrc: 'DEMO-000001' },
]

const profilesKey = 'usefrete-fusion-profiles-v1'
const activeKey = 'usefrete-fusion-active-v1'
let volatileProfiles: DemoProfile[] = []
let volatileActiveId: string | null = null

export function createProfileId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function readProfiles(): DemoProfile[] {
  let saved: DemoProfile[] = []
  try {
    const value = JSON.parse(localStorage.getItem(profilesKey) ?? '[]')
    if (Array.isArray(value)) saved = value
  } catch { /* dados disponíveis apenas nesta aba */ }
  return [...new Map([...demoProfiles, ...saved, ...volatileProfiles].map((profile) => [profile.id, profile])).values()]
}

export function saveProfile(profile: DemoProfile) {
  const custom = readProfiles().filter((item) => !item.id.startsWith('demo-'))
  volatileProfiles = [...custom.filter((item) => item.id !== profile.id), profile]
  try { localStorage.setItem(profilesKey, JSON.stringify(volatileProfiles)) } catch { /* fallback em memória */ }
  setActiveProfile(profile.id)
}

export function setActiveProfile(id: string) { volatileActiveId = id; try { sessionStorage.setItem(activeKey, id) } catch { /* fallback em memória */ } }
export function readActiveProfile() {
  let id = volatileActiveId
  try { id = sessionStorage.getItem(activeKey) ?? id } catch { /* fallback em memória */ }
  return readProfiles().find((profile) => profile.id === id) ?? null
}
export function clearActiveProfile() { volatileActiveId = null; try { sessionStorage.removeItem(activeKey) } catch { /* fallback em memória */ } }
