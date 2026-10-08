export type Carrier = {
  id: number
  name: string
  initials: string
  color: string
  vehicle: string
  body: string
  capacity: string
  rating: string
  trips: number
  distance: string
  availability: string
  eta: string
  price: string
  match: number
  note: string
}

export type Opportunity = {
  id: number
  from: string
  to: string
  distance: string
  cargo: string
  weight: string
  vehicle: string
  collection: string
  detour: string
  price: string
  match: number
  company: string
  dimensions: string
  requirements: string[]
}

export const carriers: Carrier[] = [
  {
    id: 1,
    name: 'Carlos Almeida',
    initials: 'CA',
    color: '#071a9a',
    vehicle: 'Truck',
    body: 'Carroceria aberta',
    capacity: 'Até 14 t',
    rating: '4,9',
    trips: 186,
    distance: '8 km de distância',
    availability: 'Disponível agora',
    eta: '35 min',
    price: 'R$ 1.280',
    match: 96,
    note: 'Melhor combinação entre rota, veículo e horário.',
  },
  {
    id: 2,
    name: 'Marcos Vinícius',
    initials: 'MV',
    color: '#f5a800',
    vehicle: 'Truck',
    body: 'Carga seca',
    capacity: 'Até 12 t',
    rating: '4,8',
    trips: 142,
    distance: '12 km de distância',
    availability: 'Disponível às 16h30',
    eta: '50 min',
    price: 'R$ 1.190',
    match: 92,
    note: 'Ótimo preço e disponibilidade dentro da janela.',
  },
  {
    id: 3,
    name: 'Ana Paula Freitas',
    initials: 'AF',
    color: '#0f766e',
    vehicle: 'Bitruck',
    body: 'Plataforma',
    capacity: 'Até 16 t',
    rating: '5,0',
    trips: 97,
    distance: '18 km de distância',
    availability: 'Retornando vazio',
    eta: '1h05',
    price: 'R$ 1.340',
    match: 89,
    note: 'Retorno vazio compatível com o destino informado.',
  },
]

export const opportunities: Opportunity[] = [
  {
    id: 1,
    from: 'Fortaleza',
    to: 'Sobral',
    distance: '235 km',
    cargo: 'Estrutura metálica',
    weight: '4,2 t',
    vehicle: 'Truck aberto',
    collection: 'Hoje até 18h30',
    detour: '+8 km',
    price: 'R$ 1.150',
    match: 94,
    company: 'Construtora Atlântico',
    dimensions: '4,8 × 2,1 × 1,7 m',
    requirements: ['Cintas de amarração', 'Carroceria aberta', 'Coleta com empilhadeira'],
  },
  {
    id: 2,
    from: 'Caucaia',
    to: 'Itapipoca',
    distance: '126 km',
    cargo: 'Equipamentos industriais',
    weight: '3,8 t',
    vehicle: 'Truck ou Toco',
    collection: 'Amanhã, 08h–10h',
    detour: '+14 km',
    price: 'R$ 890',
    match: 88,
    company: 'Norte Máquinas',
    dimensions: '3,2 × 1,9 × 1,8 m',
    requirements: ['Carga protegida', 'Rastreamento ativo'],
  },
]

export const matchingCriteria = [
  'Rota e localização',
  'Tipo de veículo',
  'Carroceria',
  'Capacidade de carga',
  'Janela de horário',
  'Disponibilidade',
  'Perfil verificado',
]

export const trackingStages = [
  'Transportador confirmado',
  'A caminho da coleta',
  'Chegou ao local',
  'Carga coletada',
  'Em trânsito',
  'Entrega concluída',
]
