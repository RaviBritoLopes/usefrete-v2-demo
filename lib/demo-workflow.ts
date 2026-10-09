export type DemoOffer = {
  profileId: string
  opportunityId: number
  name: string
  vehicle: string
  body: string
  match: number
  rating: string
  availability: string
  price: string
  priceRange: string
  eta: string
}

export type DemoWorkflow = {
  phase: 'none' | 'awaiting' | 'interested' | 'accepted' | 'in_progress' | 'direct'
  offer: DemoOffer | null
  stage: number
}

export const emptyWorkflow: DemoWorkflow = { phase: 'none', offer: null, stage: 0 }
const key = 'usefrete-fusion-workflow-v1'

export function readDemoWorkflow(): DemoWorkflow {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (stored && typeof stored === 'object' && ['none', 'awaiting', 'interested', 'accepted', 'in_progress', 'direct'].includes(stored.phase)) {
      return { phase: stored.phase, offer: stored.offer ?? null, stage: Number.isInteger(stored.stage) ? stored.stage : 0 }
    }
  } catch { /* armazenamento indisponível */ }
  return emptyWorkflow
}

export function saveDemoWorkflow(workflow: DemoWorkflow) {
  try { localStorage.setItem(key, JSON.stringify(workflow)) } catch { /* armazenamento indisponível */ }
}
