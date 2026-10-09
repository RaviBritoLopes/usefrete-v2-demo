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

export function readProfiles(): DemoProfile[] {
  try {
    const saved = JSON.parse(localStorage.getItem(profilesKey) ?? '[]')
    return [...demoProfiles, ...(Array.isArray(saved) ? saved : [])]
  } catch { return demoProfiles }
}

export function saveProfile(profile: DemoProfile) {
  const custom = readProfiles().filter((item) => !item.id.startsWith('demo-'))
  localStorage.setItem(profilesKey, JSON.stringify([...custom, profile]))
  sessionStorage.setItem(activeKey, profile.id)
}

export function setActiveProfile(id: string) { sessionStorage.setItem(activeKey, id) }
export function readActiveProfile() { return readProfiles().find((profile) => profile.id === sessionStorage.getItem(activeKey)) ?? null }
export function clearActiveProfile() { sessionStorage.removeItem(activeKey) }
