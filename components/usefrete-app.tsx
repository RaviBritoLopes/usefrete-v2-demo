'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Gauge,
  LocateFixed,
  Navigation,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Weight,
} from 'lucide-react'
import {
  carriers,
  matchingCriteria,
  opportunities,
  trackingStages,
  type Carrier,
  type Opportunity,
} from '@/lib/usefrete-data'
import { DemoAuth } from './demo-auth'
import { ExpandableRouteMap } from './expandable-route-map'
import { clearActiveProfile, readActiveProfile, type DemoProfile } from '@/lib/demo-profile'
import { emptyWorkflow, readDemoWorkflow, saveDemoWorkflow, type DemoOffer, type DemoWorkflow } from '@/lib/demo-workflow'

type Screen =
  | 'auth'
  | 'contractor'
  | 'route'
  | 'cargo'
  | 'vehicle'
  | 'matching'
  | 'results'
  | 'confirmation'
  | 'accepted'
  | 'tracking'
  | 'carrier'
  | 'opportunity'
  | 'operation'

type RequestData = {
  origin: string
  destination: string
  date: string
  customDate: string
  window: string
  cargoType: string
  weight: string
  dimensions: string
  volumes: string
  notes: string
  photoName: string
  knowsVehicle: boolean
  vehicle: string
  body: string
}

type Availability = 'now' | 'later' | 'route' | 'empty' | 'offline'
type OperationSettings = { origin: string; destination: string; departure: string; capacity: string; maxDetour: string }
const defaultOperation: OperationSettings = { origin: 'Fortaleza', destination: 'Sobral', departure: '17:30', capacity: '5 t', maxDetour: '15' }

const logoUrl = '/usefrete-logo.png'
const demoRequest: RequestData = {
  origin: 'Messejana, Fortaleza',
  destination: 'Centro, Sobral',
  date: 'Hoje',
  customDate: '',
  window: '16h–18h',
  cargoType: 'Estruturas',
  weight: '4,2 t',
  dimensions: '4,8 × 2,1 × 1,7 m',
  volumes: '6 volumes',
  notes: 'Estruturas metálicas embaladas. Coleta com empilhadeira no local.',
  photoName: '',
  knowsVehicle: false,
  vehicle: 'Truck',
  body: 'Carroceria aberta',
}

const progressSteps = ['Rota', 'Carga', 'Veículo', 'Matching']

function Logo({ compact = false }: { compact?: boolean }) {
  return <img src={logoUrl} alt="UseFrete" className={compact ? 'h-10 w-24 object-contain object-left' : 'h-20 w-44 object-contain'} />
}

function AppHeader({ onBack, label }: { onBack?: () => void; label?: string }) {
  return (
    <header className="sticky top-0 z-[1100] border-b border-slate-100 bg-[#fffefa]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {onBack ? (
          <button type="button" onClick={onBack} className="flex min-h-11 items-center gap-1.5 text-sm font-extrabold text-[#071a9a]"><ArrowLeft className="size-4" /> Voltar</button>
        ) : <Logo compact />}
        {onBack && <Logo compact />}
        {label && <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#071a9a] sm:block">{label}</span>}
      </div>
    </header>
  )
}

function Page({ children, onBack, label, wide = false }: { children: ReactNode; onBack?: () => void; label?: string; wide?: boolean }) {
  return (
    <main className="min-h-screen bg-[#f4f5ef] pb-12">
      <AppHeader onBack={onBack} label={label} />
      <div className={`mx-auto px-4 pt-6 sm:px-8 ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>{children}</div>
    </main>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e89a00]">{children}</p>
}

function PrimaryButton({ children, onClick, type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#f5a800] px-5 text-sm font-black text-white shadow-lg shadow-orange-200/70 transition hover:-translate-y-0.5 hover:bg-[#e99e00] disabled:cursor-not-allowed disabled:opacity-50">
      {children}
    </button>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
      <span>{label}</span>
      <input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-12 rounded-xl border border-slate-200 bg-[#fffefa] px-3 text-sm font-medium outline-none" />
    </label>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-xl border border-slate-200 bg-[#fffefa] px-3 text-sm font-medium outline-none">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Progress({ active }: { active: number }) {
  return (
    <div className="mb-7 grid grid-cols-4 gap-2" aria-label={`Etapa ${active + 1} de 4`}>
      {progressSteps.map((step, index) => (
        <div key={step}><div className={`h-1.5 rounded-full ${index <= active ? 'bg-[#f5a800]' : 'bg-slate-200'}`} /><span className={`mt-1.5 block text-[10px] font-bold ${index === active ? 'text-[#071a9a]' : 'text-slate-400'}`}>{step}</span></div>
      ))}
    </div>
  )
}

function ContractorHome({ profile, workflow, onNew, onAccept, onTracking, onLogout }: { profile: DemoProfile; workflow: DemoWorkflow; onNew: () => void; onAccept: () => void; onTracking: () => void; onLogout: () => void }) {
  const offer = workflow.offer
  const confirmed = ['accepted', 'in_progress', 'completed', 'direct'].includes(workflow.phase)
  return <Page label="Área do contratante">
    <div className="flex items-start justify-between gap-3"><div><Eyebrow>Painel do contratante</Eyebrow><h1 className="mt-2 text-3xl font-black text-[#071a9a]">Olá, {profile.name.split(' ')[0]}!</h1><p className="mt-1 text-sm text-slate-500">O que você precisa transportar hoje?</p></div><button type="button" onClick={onLogout} className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600">Sair</button></div>
    <section className="mt-6 rounded-3xl bg-[#071a9a] p-6 text-white"><Package className="size-8 text-[#f5a800]" /><h2 className="mt-4 text-2xl font-black">Preciso de transporte</h2><p className="mt-2 text-sm leading-6 text-blue-100">Conte a rota e a carga. Encontraremos opções compatíveis com sua necessidade.</p><div className="mt-5"><PrimaryButton onClick={onNew}>Nova solicitação <ArrowRight className="size-4" /></PrimaryButton></div></section>
    <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-[#071a9a]">Solicitação ativa</h2>{workflow.phase === 'none' ? <p className="mt-2 text-sm text-slate-500">Nenhuma solicitação ativa nesta sessão.</p> : <><p className="mt-2 text-sm text-slate-600">Fortaleza → Sobral · {workflow.phase === 'awaiting' ? 'Aguardando propostas' : workflow.phase === 'interested' ? 'Transportador interessado' : trackingStages[workflow.stage]}</p>{confirmed && offer && <p className="mt-2 text-sm font-bold text-[#071a9a]">Transportador selecionado: {offer.name}</p>}{confirmed && <button type="button" onClick={onTracking} className="mt-3 min-h-11 text-sm font-black text-[#071a9a]">Ver acompanhamento →</button>}</>}</section>
    {workflow.phase === 'interested' && offer && <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#f5a800]"><Eyebrow>Proposta recebida · dado simulado</Eyebrow><h2 className="mt-2 text-xl font-black text-[#071a9a]">{offer.name} tem interesse</h2><div className="mt-3"><SummaryRow label="Veículo" value={`${offer.vehicle} · ${offer.body}`} /><SummaryRow label="Compatibilidade" value={`${offer.match}%`} /><SummaryRow label="Avaliação" value={`${offer.rating} ★`} /><SummaryRow label="Disponibilidade" value={offer.availability} /><SummaryRow label="Proposta" value={offer.price} /><SummaryRow label="Faixa estimada" value={offer.priceRange} /></div><p className="mt-3 text-xs text-slate-500">Estimativa demonstrativa; o aceite não gera contratação ou pagamento real.</p><div className="mt-4"><PrimaryButton onClick={onAccept}>Aceitar proposta <Check className="size-4" /></PrimaryButton></div></section>}
    <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-[#071a9a]">Transportes recentes</h2><p className="mt-2 text-sm text-slate-500">Fortaleza → Maracanaú · Entregue · Dado demonstrativo</p></section>
  </Page>
}

function RouteStep({ data, update, onBack, onNext }: { data: RequestData; update: (patch: Partial<RequestData>) => void; onBack: () => void; onNext: () => void }) {
  return (
    <Page onBack={onBack} label="Solicitação de transporte">
      <Progress active={0} /><Eyebrow>Etapa 1 de 4</Eyebrow><h1 className="mt-2 text-3xl font-black tracking-tight text-[#071a9a]">Qual é a rota?</h1><p className="mt-2 text-sm leading-6 text-slate-500">Começamos pela localização e pelo prazo para buscar quem pode atender você.</p>
      <form onSubmit={(event) => { event.preventDefault(); onNext() }} className="mt-6 space-y-4">
        <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><Field label="Origem" value={data.origin} onChange={(origin) => update({ origin })} placeholder="Bairro, cidade" /><Field label="Destino" value={data.destination} onChange={(destination) => update({ destination })} placeholder="Bairro, cidade" /></section>
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex items-center gap-2 text-sm font-black text-slate-800"><CalendarDays className="size-4 text-[#f5a800]" /> Data da coleta</div><div className="mt-3 grid grid-cols-3 gap-2">{['Hoje', 'Amanhã', 'Escolher data'].map((date) => <button key={date} type="button" onClick={() => update({ date })} className={`min-h-12 rounded-xl px-2 text-xs font-extrabold ${data.date === date ? 'bg-[#071a9a] text-white' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'}`}>{date}</button>)}</div>{data.date === 'Escolher data' && <label className="mt-3 block text-sm font-bold text-slate-700">Escolha a data<input required type="date" value={data.customDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => update({ customDate: event.target.value })} className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-3" /></label>}<div className="mt-4"><SelectField label="Janela de horário" value={data.window} onChange={(window) => update({ window })} options={['16h–18h', '18h–20h', '08h–10h', 'Horário flexível']} /></div></section>
        <PrimaryButton type="submit">Continuar para carga <ArrowRight className="size-4" /></PrimaryButton>
      </form>
    </Page>
  )
}

function CargoStep({ data, update, onBack, onNext }: { data: RequestData; update: (patch: Partial<RequestData>) => void; onBack: () => void; onNext: () => void }) {
  return (
    <Page onBack={onBack} label="Solicitação de transporte">
      <Progress active={1} /><Eyebrow>Etapa 2 de 4</Eyebrow><h1 className="mt-2 text-3xl font-black tracking-tight text-[#071a9a]">Conte sobre a carga</h1><p className="mt-2 text-sm leading-6 text-slate-500">Essas informações determinam capacidade, carroceria e cuidados necessários.</p>
      <form onSubmit={(event) => { event.preventDefault(); onNext() }} className="mt-6 space-y-4">
        <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2"><SelectField label="Tipo de carga" value={data.cargoType} onChange={(cargoType) => update({ cargoType })} options={['Equipamentos', 'Estruturas', 'Materiais', 'Máquinas', 'Mercadorias', 'Outros']} /><Field label="Peso aproximado" value={data.weight} onChange={(weight) => update({ weight })} placeholder="Ex.: 4,2 t" /><Field label="Dimensões" value={data.dimensions} onChange={(dimensions) => update({ dimensions })} placeholder="Compr. × larg. × alt." /><Field label="Quantidade / volumes" value={data.volumes} onChange={(volumes) => update({ volumes })} placeholder="Ex.: 6 volumes" /><label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700 sm:col-span-2"><span>Observações</span><textarea value={data.notes} onChange={(event) => update({ notes: event.target.value })} className="min-h-24 rounded-xl border border-slate-200 bg-[#fffefa] p-3 text-sm font-medium outline-none" /></label><label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700 sm:col-span-2"><span>Foto da carga (opcional)</span><input type="file" accept="image/*" onChange={(event) => update({ photoName: event.target.files?.[0]?.name ?? '' })} className="text-xs" /><span className="text-xs font-normal text-slate-400">{data.photoName ? `${data.photoName} selecionada apenas nesta sessão` : 'Nenhum arquivo enviado; demonstração sem upload.'}</span></label></section>
        <PrimaryButton type="submit">Continuar para veículo <ArrowRight className="size-4" /></PrimaryButton>
      </form>
    </Page>
  )
}

function VehicleRecommendation({ data, update }: { data: RequestData; update: (patch: Partial<RequestData>) => void }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-[#071a9a] text-white shadow-xl shadow-blue-950/15"><div className="p-5"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5a800] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white"><Sparkles className="size-3" /> Veículo recomendado</span><div className="mt-5 flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-white/10"><Truck className="size-8 text-[#f5a800]" /></div><div><h2 className="text-2xl font-black">{data.vehicle}</h2><p className="text-sm font-bold text-blue-100">{data.body}</p></div></div><p className="mt-4 text-sm leading-6 text-blue-100">Recomendação demonstrativa com base nos dados informados. Confirme os requisitos antes de contratar.</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold"><span className="rounded-xl bg-white/10 p-3"><Weight className="mb-1 size-4 text-[#f5a800]" /> Capacidade até 14 t</span><span className="rounded-xl bg-white/10 p-3"><ShieldCheck className="mb-1 size-4 text-[#f5a800]" /> Carga bem acomodada</span></div></div><div className="grid grid-cols-2 border-t border-white/10 bg-white/5 p-3"><SelectField label="Veículo" value={data.vehicle} onChange={(vehicle) => update({ vehicle })} options={['VUC', 'Toco', 'Truck', 'Bitruck', 'Carreta']} /><div className="pl-2"><SelectField label="Carroceria" value={data.body} onChange={(body) => update({ body })} options={['Baú', 'Carga seca', 'Carroceria aberta', 'Sider', 'Plataforma']} /></div></div></section>
  )
}

function VehicleStep({ data, update, onBack, onNext }: { data: RequestData; update: (patch: Partial<RequestData>) => void; onBack: () => void; onNext: () => void }) {
  return (
    <Page onBack={onBack} label="Solicitação de transporte">
      <Progress active={2} /><Eyebrow>Etapa 3 de 4</Eyebrow><h1 className="mt-2 text-3xl font-black tracking-tight text-[#071a9a]">Você sabe qual veículo precisa?</h1>
      <div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => update({ knowsVehicle: true })} className={`rounded-2xl p-4 text-sm font-black ring-1 ${data.knowsVehicle ? 'bg-[#071a9a] text-white ring-[#071a9a]' : 'bg-white text-slate-500 ring-slate-200'}`}>Sim, quero escolher</button><button type="button" onClick={() => update({ knowsVehicle: false })} className={`rounded-2xl p-4 text-sm font-black ring-1 ${!data.knowsVehicle ? 'bg-[#071a9a] text-white ring-[#071a9a]' : 'bg-white text-slate-500 ring-slate-200'}`}>Não sei qual preciso</button></div>
      <div className="mt-5">{data.knowsVehicle ? <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2"><SelectField label="Veículo" value={data.vehicle} onChange={(vehicle) => update({ vehicle })} options={['VUC', 'Toco', 'Truck', 'Bitruck', 'Carreta']} /><SelectField label="Carroceria" value={data.body} onChange={(body) => update({ body })} options={['Baú', 'Carga seca', 'Carroceria aberta', 'Sider', 'Plataforma']} /></section> : <VehicleRecommendation data={data} update={update} />}</div>
      <div className="mt-5"><PrimaryButton onClick={onNext}>Confirmar e buscar transportadores <ArrowRight className="size-4" /></PrimaryButton></div>
    </Page>
  )
}

function Matching({ onDone }: { onDone: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onDone, 2400); return () => window.clearTimeout(timer) }, [onDone])
  return (
    <main className="flex min-h-screen items-center bg-[#071a9a] px-4 py-10 text-white"><div className="mx-auto w-full max-w-lg"><div className="matching-orbit relative mx-auto flex size-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20"><Truck className="size-10 text-[#f5a800]" /><span className="absolute size-3 rounded-full bg-[#f5a800]" /></div><div className="mt-8 text-center"><Eyebrow>Matching UseFrete</Eyebrow><h1 className="mt-3 text-3xl font-black sm:text-4xl">Buscando transportadores compatíveis...</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-blue-100">Estamos cruzando sua necessidade com veículos e rotas disponíveis.</p></div><div className="mt-8 grid gap-2 sm:grid-cols-2">{matchingCriteria.map((criterion, index) => <div key={criterion} style={{ animationDelay: `${index * 120}ms` }} className="matching-item flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10"><span className="flex size-6 items-center justify-center rounded-full bg-emerald-400 text-[#071a9a]"><Check className="size-3.5 stroke-[3]" /></span><span className="text-sm font-bold">{criterion}</span></div>)}</div></div></main>
  )
}

function MatchBadge({ value }: { value: number }) { return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{value}% compatível</span> }

function CarrierCard({ carrier, expanded, onExpand, onSelect }: { carrier: Carrier; expanded: boolean; onExpand: () => void; onSelect: () => void }) {
  return (
    <article className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ${carrier.id === 1 ? 'ring-[#f5a800]' : 'ring-slate-100'}`}><div className="flex items-start gap-3"><div style={{ background: carrier.color }} className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white">{carrier.initials}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-black text-slate-900">{carrier.name}</h2><BadgeCheck className="size-4 fill-blue-50 text-[#071a9a]" /></div><p className="mt-0.5 text-xs font-semibold text-slate-500">{carrier.vehicle} · {carrier.body}</p></div><MatchBadge value={carrier.match} /></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Disponibilidade</span><p className="mt-1 font-extrabold text-emerald-700">● {carrier.availability}</p></div><div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Chegada estimada</span><p className="mt-1 font-extrabold text-slate-800">{carrier.eta}</p></div></div>
      {expanded && <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-[11px]"><div><Star className="mx-auto size-4 fill-[#f5a800] text-[#f5a800]" /><p className="mt-1 font-black">{carrier.rating}</p><span className="text-slate-400">{carrier.trips} operações</span></div><div><Gauge className="mx-auto size-4 text-[#071a9a]" /><p className="mt-1 font-black">{carrier.capacity}</p><span className="text-slate-400">Capacidade</span></div><div><LocateFixed className="mx-auto size-4 text-[#071a9a]" /><p className="mt-1 font-black">{carrier.distance}</p><span className="text-slate-400">Localização</span></div><p className="col-span-3 mt-2 rounded-xl bg-blue-50 p-3 text-left font-semibold leading-5 text-[#071a9a]">{carrier.note}<br />{carrier.completion} · Validação ilustrativa de perfil e documentos · Desvio {carrier.detour}</p></div>}
      <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-slate-700"><p>Faixa estimada: <strong>{carrier.priceRange}</strong></p><p className="mt-1 font-bold text-emerald-700">{carrier.priceStatus}</p><p className="mt-1 text-[11px] text-slate-500" title="Faixa demonstrativa baseada em rota, veículo e requisitos.">ⓘ Estimativa demonstrativa por rota, veículo e requisitos. Sem teto de preço.</p></div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4"><div><span className="text-xs text-slate-400">Proposta</span><p className="text-xl font-black text-[#071a9a]">{carrier.price}</p></div><div className="flex gap-2"><button type="button" onClick={onExpand} className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-extrabold text-slate-600">{expanded ? 'Fechar' : 'Ver detalhes'}</button><button type="button" onClick={onSelect} className="min-h-11 rounded-xl bg-[#f5a800] px-3 text-xs font-black text-white">Selecionar</button></div></div></article>
  )
}

function Results({ onBack, onSelect, onWait }: { onBack: () => void; onSelect: (carrier: Carrier) => void; onWait: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(1)
  return (
    <Page onBack={onBack} label="Resultado do matching" wide><div className="rounded-3xl bg-[#071a9a] p-6 text-white sm:p-8"><Eyebrow>Matching concluído</Eyebrow><h1 className="mt-2 text-3xl font-black">3 transportadores compatíveis encontrados</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Selecionamos as opções que melhor atendem rota, veículo, capacidade e baixa antecedência.</p><p className="mt-3 text-xs text-blue-200">Compatibilidade, disponibilidade, avaliações e valores são dados demonstrativos.</p></div><div className="mt-5 grid gap-4 lg:grid-cols-3">{carriers.map((carrier) => <CarrierCard key={carrier.id} carrier={carrier} expanded={expanded === carrier.id} onExpand={() => setExpanded(expanded === carrier.id ? null : carrier.id)} onSelect={() => onSelect(carrier)} />)}</div><button type="button" onClick={onWait} className="mt-5 min-h-12 w-full rounded-2xl border-2 border-[#071a9a] px-4 text-sm font-black text-[#071a9a]">Aguardar interesse de outro transportador</button><p className="mt-2 text-center text-xs text-slate-500">Use esta opção para demonstrar o aceite bilateral com o perfil transportador.</p></Page>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0"><span className="text-sm text-slate-400">{label}</span><strong className="max-w-[65%] text-right text-sm text-slate-800">{value}</strong></div> }

function Confirmation({ data, carrier, onBack, onConfirm }: { data: RequestData; carrier: Carrier; onBack: () => void; onConfirm: () => void }) {
  return (
    <Page onBack={onBack} label="Confirmação"><Eyebrow>Revise os dados</Eyebrow><h1 className="mt-2 text-3xl font-black text-[#071a9a]">Tudo certo para confirmar?</h1><section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><SummaryRow label="Origem" value={data.origin} /><SummaryRow label="Destino" value={data.destination} /><SummaryRow label="Carga" value={`${data.cargoType} · ${data.weight} · ${data.volumes}`} /><SummaryRow label="Veículo" value={`${data.vehicle} · ${data.body}`} /><SummaryRow label="Coleta" value={`${data.date === 'Escolher data' ? data.customDate : data.date}, ${data.window}`} /></section><section className="mt-4 flex items-center gap-4 rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100"><div style={{ background: carrier.color }} className="flex size-12 items-center justify-center rounded-2xl font-black text-white">{carrier.initials}</div><div className="flex-1"><p className="font-black text-[#071a9a]">{carrier.name}</p><p className="text-xs font-semibold text-slate-500">Verificado · {carrier.rating} ★ · chegada em {carrier.eta}</p></div><strong className="text-[#071a9a]">{carrier.price}</strong></section><div className="mt-5"><PrimaryButton onClick={onConfirm}><CheckCircle2 className="size-5" /> Confirmar transporte</PrimaryButton></div><p className="mt-3 text-center text-[11px] leading-5 text-slate-400">Demonstração: valor, aceite e transportador são dados ilustrativos.</p></Page>
  )
}

const demoRoute: [number, number][] = [[-3.7275, -38.5275], [-3.735, -38.67], [-3.65, -38.91], [-3.6, -39.1], [-3.69, -39.36], [-3.68, -39.59], [-3.66, -39.83], [-3.69, -40.35]]

function Tracking({ carrier, stage, canAdvance, onAdvance, onHome }: { carrier: { name: string; eta: string }; stage: number; canAdvance: boolean; onAdvance: () => void; onHome: () => void }) {
  return <main className="min-h-screen bg-[#f4f5ef] pb-12">
    <AppHeader label="Transporte confirmado" />
    <div className="mx-auto grid max-w-5xl gap-5 px-4 pt-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="relative h-[340px] bg-[#dce8ed]"><ExpandableRouteMap origin={demoRoute[0]} destination={demoRoute[demoRoute.length - 1]} route={demoRoute} /></div>
        <div className="p-5"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{trackingStages[stage]}</p><h1 className="font-black text-[#071a9a]">{carrier.name} {stage >= 3 ? 'está a caminho' : 'foi confirmado'}</h1></div></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Chegada na coleta</span><p className="mt-1 font-black">{carrier.eta}</p></div><div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Rota</span><p className="mt-1 font-black">Fortaleza → Sobral</p></div></div></div>
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><Eyebrow>Acompanhamento</Eyebrow><h2 className="mt-2 text-2xl font-black text-[#071a9a]">Status do transporte</h2><div className="mt-5">{trackingStages.map((item, index) => <div key={item} className="flex gap-3"><div className="flex flex-col items-center"><span className={`flex size-7 items-center justify-center rounded-full ${index <= stage ? 'bg-[#f5a800] text-white' : 'bg-slate-100 text-slate-400'}`}>{index < stage ? <Check className="size-3.5" /> : index + 1}</span>{index < trackingStages.length - 1 && <span className={`h-8 w-0.5 ${index < stage ? 'bg-[#f5a800]' : 'bg-slate-200'}`} />}</div><div className="pt-1"><p className={`text-sm font-extrabold ${index === stage ? 'text-[#071a9a]' : index < stage ? 'text-slate-700' : 'text-slate-400'}`}>{item}</p>{index === stage && <p className="mt-0.5 text-xs text-slate-400">Atualizado agora · dado simulado</p>}</div></div>)}</div><button type="button" onClick={onAdvance} disabled={!canAdvance || stage === trackingStages.length - 1} className="mt-5 h-11 w-full rounded-xl bg-[#071a9a] text-sm font-black text-white disabled:opacity-50">{stage === trackingStages.length - 1 ? 'Entrega concluída' : !canAdvance ? 'Aguardando transportador iniciar operação' : 'Simular próxima etapa'}</button><button type="button" onClick={onHome} className="mt-2 h-11 w-full rounded-xl text-sm font-black text-slate-500">Voltar ao início</button></section>
    </div>
  </main>
}

function AcceptedProposal({ offer, onTracking, onHome }: { offer: DemoOffer; onTracking: () => void; onHome: () => void }) {
  return <Page label="Proposta aceita"><div className="rounded-3xl bg-white p-6 text-center shadow-sm"><CheckCircle2 className="mx-auto size-14 text-emerald-600" /><Eyebrow>Confirmação demonstrativa</Eyebrow><h1 className="mt-2 text-3xl font-black text-[#071a9a]">Proposta aceita!</h1><p className="mt-3 text-sm leading-6 text-slate-600">{offer.name} foi selecionado para a rota Fortaleza → Sobral. O transportador verá o aceite e poderá iniciar a operação.</p><div className="mt-4 rounded-2xl bg-blue-50 p-4 text-left"><SummaryRow label="Transportador" value={offer.name} /><SummaryRow label="Veículo" value={`${offer.vehicle} · ${offer.body}`} /><SummaryRow label="Proposta" value={offer.price} /></div><div className="mt-5"><PrimaryButton onClick={onTracking}>Ver acompanhamento <ArrowRight className="size-4" /></PrimaryButton></div><button type="button" onClick={onHome} className="mt-3 min-h-11 text-sm font-bold text-[#071a9a]">Voltar ao painel</button></div></Page>
}

const availabilityOptions: { id: Availability; title: string; icon: string; tone: string }[] = [{ id: 'now', title: 'Disponível agora', icon: '●', tone: 'text-emerald-600' }, { id: 'later', title: 'Disponível mais tarde', icon: '◷', tone: 'text-amber-600' }, { id: 'route', title: 'Em rota', icon: '↗', tone: 'text-blue-600' }, { id: 'empty', title: 'Retornando vazio', icon: '↩', tone: 'text-[#f5a800]' }, { id: 'offline', title: 'Indisponível', icon: '●', tone: 'text-slate-400' }]

function AvailabilitySelector({ value, onChange, operation, updateOperation }: { value: Availability; onChange: (value: Availability) => void; operation: OperationSettings; updateOperation: (patch: Partial<OperationSettings>) => void }) {
  const showRoute = value === 'route' || value === 'empty'
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex items-center justify-between"><div><Eyebrow>Minha disponibilidade</Eyebrow><h2 className="mt-1 text-xl font-black text-[#071a9a]">Como você está hoje?</h2></div><span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#071a9a]"><Navigation className="size-5" /></span></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{availabilityOptions.map((option) => <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-xs font-extrabold ring-1 ${value === option.id ? 'bg-[#071a9a] text-white ring-[#071a9a]' : 'bg-[#fffefa] text-slate-600 ring-slate-200'}`}><span className={value === option.id ? 'text-[#f5a800]' : option.tone}>{option.icon}</span>{option.title}</button>)}</div>{showRoute && <div className="mt-4 grid gap-3 rounded-2xl bg-orange-50/70 p-4 sm:grid-cols-2"><Field label="Origem atual" value={operation.origin} onChange={(origin) => updateOperation({ origin })} placeholder="Cidade" /><Field label="Destino" value={operation.destination} onChange={(destination) => updateOperation({ destination })} placeholder="Cidade" /><Field label="Saída estimada" value={operation.departure} onChange={(departure) => updateOperation({ departure })} placeholder="Horário" /><Field label="Capacidade disponível" value={operation.capacity} onChange={(capacity) => updateOperation({ capacity })} placeholder="Ex.: 5 t" /><Field label="Desvio máximo aceito (km)" value={operation.maxDetour} onChange={(maxDetour) => updateOperation({ maxDetour })} placeholder="Ex.: 15" type="number" /><p className="rounded-xl bg-white p-3 text-xs font-bold leading-5 text-[#071a9a] sm:col-span-2"><Sparkles className="mr-1 inline size-3.5 text-[#f5a800]" /> Oportunidades são filtradas pela sua rota, capacidade e desvio.</p></div>}</section>
  )
}

function OpportunityCard({ item, onOpen }: { item: Opportunity; onOpen: () => void }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex items-center justify-between gap-3"><MatchBadge value={item.match} /><strong className="whitespace-nowrap text-base text-[#071a9a]">{item.price}</strong></div><h3 className="mt-4 text-xl font-black text-slate-900">{item.from} <span className="text-slate-300">→</span> {item.to}</h3><p className="mt-1 text-xs font-semibold text-slate-400">{item.distance} · desvio da sua rota: <strong className="text-emerald-700">{item.detour}</strong></p><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><Package className="mb-1 size-4 text-[#f5a800]" /><strong>{item.cargo}</strong><p className="mt-1 text-slate-400">{item.weight}</p></div><div className="rounded-xl bg-slate-50 p-3"><Truck className="mb-1 size-4 text-[#071a9a]" /><strong>{item.vehicle}</strong><p className="mt-1 text-slate-400">{item.collection}</p></div></div><p className="mt-3 text-xs text-slate-600">Faixa estimada: <strong>{item.priceRange}</strong> · Dado simulado</p><button type="button" onClick={onOpen} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#071a9a] text-sm font-black text-white">Ver oportunidade <ChevronRight className="size-4" /></button></article>
  )
}

function CarrierHome({ profile, workflow, onBack, onOpportunity, onOperation, onStart }: { profile: DemoProfile; workflow: DemoWorkflow; onBack: () => void; onOpportunity: (item: Opportunity) => void; onOperation: () => void; onStart: () => void }) {
  const [availability, setAvailability] = useState<Availability>('empty')
  const [operation, setOperation] = useState<OperationSettings>(defaultOperation)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  useEffect(() => { try { const saved = JSON.parse(window.localStorage.getItem('usefrete-operation-v1') ?? 'null'); if (saved) { setAvailability(saved.availability ?? 'empty'); setOperation({ ...defaultOperation, ...saved.operation }) } } catch { /* modo privado */ } setSettingsLoaded(true) }, [])
  useEffect(() => { if (!settingsLoaded) return; try { window.localStorage.setItem('usefrete-operation-v1', JSON.stringify({ availability, operation })) } catch { /* modo privado */ } }, [availability, operation, settingsLoaded])
  const capacity = Number.parseFloat(operation.capacity.replace(',', '.')) || 0
  const maxDetour = Number.parseFloat(operation.maxDetour) || 0
  const matched = availability === 'offline' ? [] : opportunities.filter((item) => {
    const weight = Number.parseFloat(item.weight.replace(',', '.'))
    const detour = Number.parseFloat(item.detour.replace(/[+]/g, ''))
    const vehicleFits = item.vehicle.toLowerCase().split(' ou ').some((option) => option.includes(profile.vehicle.toLowerCase()))
    const routeFits = availability !== 'route' && availability !== 'empty' || (operation.destination.toLowerCase() === item.to.toLowerCase() && operation.origin.toLowerCase() === item.from.toLowerCase())
    return vehicleFits && capacity >= weight && maxDetour >= detour && routeFits
  })
  const myOffer = workflow.offer?.profileId === profile.id ? workflow.offer : null
  return (
    <Page onBack={onBack} label="Área do transportador" wide>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>Painel do transportador</Eyebrow><h1 className="mt-2 text-3xl font-black text-[#071a9a]">Olá, {profile.name.split(' ')[0]}!</h1><p className="mt-1 text-sm text-slate-500">{profile.vehicle} · {profile.body} · Perfil demonstrativo</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700"><BadgeCheck className="size-4" /> Verificado · demonstração</span></div>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={onOperation} className="min-h-11 rounded-xl bg-[#071a9a] px-4 text-sm font-black text-white">Minha operação</button><button type="button" onClick={onBack} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Sair</button></div>
      {myOffer && <section className={`mt-5 rounded-3xl p-5 shadow-sm ${workflow.phase === 'interested' ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-emerald-50 ring-1 ring-emerald-200'}`}><Eyebrow>Fortaleza → Sobral</Eyebrow><h2 className="mt-2 text-xl font-black text-[#071a9a]">{workflow.phase === 'interested' ? 'Interesse enviado' : workflow.phase === 'accepted' ? 'Sua proposta foi aceita' : workflow.phase === 'completed' ? 'Operação concluída' : 'Operação iniciada'}</h2><p className="mt-2 text-sm text-slate-600">{workflow.phase === 'interested' ? 'Aguardando o contratante avaliar sua proposta simulada.' : workflow.phase === 'accepted' ? 'O contratante selecionou você. Inicie a operação quando estiver pronto.' : workflow.phase === 'completed' ? 'Entrega concluída · operação demonstrativa finalizada.' : `${trackingStages[workflow.stage]} · acompanhe as próximas etapas no painel.`}</p>{workflow.phase === 'accepted' && <button type="button" onClick={onStart} className="mt-4 min-h-12 w-full rounded-xl bg-[#071a9a] px-4 text-sm font-black text-white">Iniciar operação <ArrowRight className="ml-1 inline size-4" /></button>}</section>}
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><div className="space-y-4"><AvailabilitySelector value={availability} onChange={setAvailability} operation={operation} updateOperation={(patch) => setOperation((current) => ({ ...current, ...patch }))} /><div className="rounded-3xl bg-white p-5 shadow-sm"><Eyebrow>Minha operação</Eyebrow><p className="mt-2 text-sm font-bold text-[#071a9a]">{profile.vehicle} · {profile.capacity || operation.capacity}</p><p className="mt-1 text-sm text-slate-500">{operation.origin} → {operation.destination} · {availabilityOptions.find((item) => item.id === availability)?.title}</p><p className="mt-2 text-xs text-slate-400">Dados demonstrativos</p></div></div><section><Eyebrow>Oportunidades para você</Eyebrow><h2 className="mt-1 text-2xl font-black text-slate-900">Oportunidades compatíveis</h2><p className="mt-1 text-sm text-slate-500">Selecionadas por rota, veículo, capacidade, desvio e disponibilidade.</p><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{matched.length ? matched.map((item) => <OpportunityCard key={item.id} item={item} onOpen={() => onOpportunity(item)} />) : <p className="rounded-2xl bg-white p-5 text-sm text-slate-600">Nenhuma oportunidade atende aos filtros atuais. Ajuste sua rota, capacidade ou desvio máximo.</p>}</div></section></div>
    </Page>
  )
}

function OpportunityDetail({ item, workflow, onBack, onInterest }: { item: Opportunity; workflow: DemoWorkflow; onBack: () => void; onInterest: () => void }) {
  const sent = workflow.offer?.opportunityId === item.id && workflow.phase !== 'none' && workflow.phase !== 'awaiting'
  return (
    <Page onBack={onBack} label="Oportunidade compatível"><div className="flex items-center justify-between gap-3"><MatchBadge value={item.match} /><strong className="whitespace-nowrap text-2xl text-[#071a9a]">{item.price}</strong></div><h1 className="mt-4 text-3xl font-black text-[#071a9a]">{item.from} → {item.to}</h1><p className="mt-2 text-sm text-slate-500">{item.company} · {item.distance} · coleta {item.collection.toLowerCase()}</p><section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><SummaryRow label="Carga" value={item.cargo} /><SummaryRow label="Peso" value={item.weight} /><SummaryRow label="Dimensões" value={item.dimensions} /><SummaryRow label="Veículo" value={item.vehicle} /><SummaryRow label="Desvio da sua rota" value={item.detour} /><SummaryRow label="Faixa estimada" value={item.priceRange} /></section><section className="mt-4 rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100"><p className="text-sm font-black text-[#071a9a]">Contratante verificado · demonstração</p><p className="mt-2 text-xs text-slate-600">{item.company} · 4,8 ★ · 42 operações concluídas · Dados demonstrativos</p><p className="mt-4 text-sm font-black text-[#071a9a]">Requisitos da carga</p><div className="mt-3 flex flex-wrap gap-2">{item.requirements.map((requirement) => <span key={requirement} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600">✓ {requirement}</span>)}</div></section><div className="mt-5"><PrimaryButton onClick={onInterest} disabled={sent}>{sent ? <><CheckCircle2 className="size-5" /> Interesse enviado</> : <>Tenho interesse <ArrowRight className="size-4" /></>}</PrimaryButton></div>{sent && <p className="mt-3 text-center text-sm font-bold text-emerald-700">{workflow.phase === 'interested' ? 'Interesse enviado ao contratante nesta demonstração.' : 'Sua proposta foi aceita. Volte ao painel para iniciar a operação.'}</p>}</Page>
  )
}

function OperationHistory({ profile, workflow, onBack, onAdvance }: { profile: DemoProfile; workflow: DemoWorkflow; onBack: () => void; onAdvance: () => void }) {
  const offer = workflow.offer?.profileId === profile.id ? workflow.offer : null
  const operation = offer && ['accepted', 'in_progress', 'completed'].includes(workflow.phase) ? opportunities.find((item) => item.id === offer.opportunityId) : null
  const stage = Math.min(Math.max(workflow.stage, 1), trackingStages.length - 1)
  const completed = workflow.phase === 'completed' || stage === trackingStages.length - 1
  return <Page onBack={onBack} label="Minha operação" wide>
    <Eyebrow>Ecossistema do transportador</Eyebrow><h1 className="mt-2 text-3xl font-black text-[#071a9a]">Minha operação</h1><p className="mt-2 text-sm text-slate-500">Acompanhe a operação ativa e consulte seu resumo demonstrativo.</p>
    {operation && offer ? <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><Eyebrow>{completed ? 'Operação concluída' : 'Operação atual'}</Eyebrow><h2 className="mt-2 text-2xl font-black text-[#071a9a]">{operation.from} → {operation.to}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{trackingStages[stage]}</span></div>
        <div className="mt-4 grid gap-x-6 sm:grid-cols-2"><SummaryRow label="Contratante" value={operation.company} /><SummaryRow label="Tipo de carga" value={`${operation.cargo} · ${operation.weight}`} /><SummaryRow label="Veículo" value={`${offer.vehicle} · ${offer.body}`} /><SummaryRow label="Proposta" value={`${offer.price} · demonstrativa`} /><SummaryRow label="Status atual" value={trackingStages[stage]} /><SummaryRow label="Coleta" value={operation.collection} /></div>
      </div>
      <div className="h-[300px] bg-[#dce8ed] sm:h-[360px]"><ExpandableRouteMap origin={demoRoute[0]} destination={demoRoute[demoRoute.length - 1]} route={demoRoute} /></div>
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_0.7fr]"><div><h3 className="text-lg font-black text-[#071a9a]">Timeline da operação</h3><div className="mt-4">{trackingStages.slice(1).map((item, timelineIndex) => { const index = timelineIndex + 1; return <div key={item} className="flex gap-3"><div className="flex flex-col items-center"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${index <= stage ? 'bg-[#f5a800] text-white' : 'bg-slate-100 text-slate-400'}`}>{index < stage ? <Check className="size-3.5" /> : timelineIndex + 1}</span>{index < trackingStages.length - 1 && <span className={`h-8 w-0.5 ${index < stage ? 'bg-[#f5a800]' : 'bg-slate-200'}`} />}</div><div className="min-w-0 pt-1"><p className={`text-sm font-extrabold ${index === stage ? 'text-[#071a9a]' : index < stage ? 'text-slate-700' : 'text-slate-400'}`}>{item}</p>{index === stage && <p className="mt-0.5 text-xs text-slate-400">Estado atual · dado simulado</p>}</div></div> })}</div></div>
        <div className="self-start rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100"><p className="text-sm font-black text-[#071a9a]">Controle de demonstração</p><p className="mt-2 text-xs leading-5 text-slate-600">Avance a operação simulada. Nenhuma cobrança ou pagamento será criado.</p>{completed && <p className="mt-3 rounded-xl bg-white p-3 text-sm font-black text-emerald-700">Entrega concluída com sucesso.</p>}<button type="button" onClick={onAdvance} disabled={workflow.phase !== 'in_progress' || completed} className="mt-4 min-h-12 w-full rounded-xl bg-[#071a9a] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{completed ? 'Entrega concluída' : 'Avançar etapa'}</button>{workflow.phase === 'accepted' && <p className="mt-2 text-xs text-slate-500">Inicie a operação pelo painel do transportador para liberar o avanço.</p>}</div>
      </div>
    </section> : <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><h2 className="text-lg font-black text-[#071a9a]">Nenhuma operação atual</h2><p className="mt-2 text-sm text-slate-500">Quando uma proposta for aceita e iniciada, a rota, o mapa e a timeline aparecerão aqui.</p></section>}
    <div className="mt-5 grid grid-cols-2 gap-3">{[['42', 'Fretes concluídos'], ['R$ 18.900', 'Receita ilustrativa'], ['780 km', 'Km aproveitados'], ['4,9 ★', 'Avaliação']].map(([value, label]) => <div key={label} className="min-w-0 rounded-2xl bg-white p-4 shadow-sm"><strong className="break-words text-xl text-[#071a9a]">{value}</strong><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}</div><section className="mt-5 rounded-3xl bg-white p-5"><h2 className="text-lg font-black text-[#071a9a]">Rotas e histórico</h2><p className="mt-3 border-b border-slate-100 pb-3 text-sm">Fortaleza → Sobral · Concluído</p><p className="mt-3 border-b border-slate-100 pb-3 text-sm">Caucaia → Itapipoca · Concluído</p><p className="mt-3 text-sm">Próxima oportunidade: Fortaleza → Sobral</p></section><p className="mt-4 text-xs text-slate-400">Todos os valores, rotas e avaliações acima são dados demonstrativos.</p>
  </Page>
}

export default function UseFreteApp() {
  const [screen, setScreen] = useState<Screen>('auth')
  const [profile, setProfile] = useState<DemoProfile | null>(null)
  const [workflow, setWorkflow] = useState<DemoWorkflow>(emptyWorkflow)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [screen])
  useEffect(() => {
    try { const active = readActiveProfile(); if (active) { setProfile(active); setScreen(active.role === 'contractor' ? 'contractor' : 'carrier') } } catch { /* armazenamento indisponível */ }
    setWorkflow(readDemoWorkflow())
    setHydrated(true)
    const onStorage = (event: StorageEvent) => { if (event.key === 'usefrete-fusion-workflow-v1') setWorkflow(readDemoWorkflow()) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  useEffect(() => { if (hydrated) saveDemoWorkflow(workflow) }, [workflow, hydrated])
  const [request, setRequest] = useState<RequestData>(demoRequest)
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier>(carriers[0])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>(opportunities[0])
  const updateRequest = (patch: Partial<RequestData>) => setRequest((current) => ({ ...current, ...patch }))
  const logout = () => { try { clearActiveProfile() } catch { /* armazenamento indisponível */ }; setProfile(null); setScreen('auth') }
  const sendInterest = () => {
    if (!profile || profile.role !== 'carrier') return
    let availability = 'Retornando vazio'
    try { const saved = JSON.parse(localStorage.getItem('usefrete-operation-v1') ?? 'null'); availability = availabilityOptions.find((option) => option.id === saved?.availability)?.title ?? availability } catch { /* valor demonstrativo */ }
    const offer: DemoOffer = { profileId: profile.id, opportunityId: selectedOpportunity.id, name: profile.name, vehicle: profile.vehicle, body: profile.body, match: selectedOpportunity.match, rating: '4,9', availability, price: selectedOpportunity.price, priceRange: selectedOpportunity.priceRange, eta: '35 min' }
    setWorkflow({ phase: 'interested', offer, stage: 0 })
  }
  const advanceWorkflow = () => setWorkflow((current) => {
    const stage = Math.min(current.stage + 1, trackingStages.length - 1)
    return { ...current, stage, phase: current.phase === 'in_progress' && stage === trackingStages.length - 1 ? 'completed' : current.phase }
  })
  if (screen === 'auth') return <DemoAuth onEnter={(next) => { setProfile(next); setScreen(next.role === 'contractor' ? 'contractor' : 'carrier') }} />
  if (screen === 'contractor' && profile) return <ContractorHome profile={profile} workflow={workflow} onNew={() => { setRequest(demoRequest); setWorkflow(emptyWorkflow); setScreen('route') }} onAccept={() => { if (workflow.phase === 'interested' && workflow.offer) { setWorkflow({ ...workflow, phase: 'accepted', stage: 2 }); setScreen('accepted') } }} onTracking={() => setScreen('tracking')} onLogout={logout} />
  if (screen === 'route') return <RouteStep data={request} update={updateRequest} onBack={() => setScreen('contractor')} onNext={() => setScreen('cargo')} />
  if (screen === 'cargo') return <CargoStep data={request} update={updateRequest} onBack={() => setScreen('route')} onNext={() => setScreen('vehicle')} />
  if (screen === 'vehicle') return <VehicleStep data={request} update={updateRequest} onBack={() => setScreen('cargo')} onNext={() => setScreen('matching')} />
  if (screen === 'matching') return <Matching onDone={() => setScreen('results')} />
  if (screen === 'results') return <Results onBack={() => setScreen('vehicle')} onSelect={(carrier) => { setSelectedCarrier(carrier); setScreen('confirmation') }} onWait={() => { setWorkflow({ phase: 'awaiting', offer: null, stage: 0 }); setScreen('contractor') }} />
  if (screen === 'confirmation') return <Confirmation data={request} carrier={selectedCarrier} onBack={() => setScreen('results')} onConfirm={() => { setWorkflow({ phase: 'direct', offer: null, stage: 2 }); setScreen('tracking') }} />
  if (screen === 'accepted' && workflow.offer) return <AcceptedProposal offer={workflow.offer} onTracking={() => setScreen('tracking')} onHome={() => setScreen('contractor')} />
  if (screen === 'tracking') return <Tracking carrier={workflow.offer && ['accepted', 'in_progress', 'completed'].includes(workflow.phase) ? workflow.offer : selectedCarrier} stage={workflow.stage} canAdvance={workflow.phase !== 'accepted'} onAdvance={advanceWorkflow} onHome={() => setScreen('contractor')} />
  if (screen === 'carrier' && profile) return <CarrierHome profile={profile} workflow={workflow} onBack={logout} onOpportunity={(item) => { setSelectedOpportunity(item); setScreen('opportunity') }} onOperation={() => setScreen('operation')} onStart={() => { if (workflow.phase === 'accepted' && workflow.offer?.profileId === profile.id) setWorkflow({ ...workflow, phase: 'in_progress', stage: 3 }) }} />
  if (screen === 'operation' && profile) return <OperationHistory profile={profile} workflow={workflow} onBack={() => setScreen('carrier')} onAdvance={advanceWorkflow} />
  return <OpportunityDetail item={selectedOpportunity} workflow={workflow.offer?.profileId === profile?.id ? workflow : emptyWorkflow} onInterest={sendInterest} onBack={() => setScreen('carrier')} />
}
