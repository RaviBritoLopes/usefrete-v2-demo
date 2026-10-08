'use client'

import dynamic from 'next/dynamic'
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
  Route,
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

const RouteMap = dynamic(() => import('./route-map').then((module) => module.RouteMap), { ssr: false })

type Screen =
  | 'welcome'
  | 'route'
  | 'cargo'
  | 'vehicle'
  | 'matching'
  | 'results'
  | 'confirmation'
  | 'tracking'
  | 'carrier'
  | 'opportunity'

type RequestData = {
  origin: string
  destination: string
  date: string
  window: string
  cargoType: string
  weight: string
  dimensions: string
  volumes: string
  notes: string
  knowsVehicle: boolean
  vehicle: string
  body: string
}

type Availability = 'now' | 'later' | 'route' | 'empty' | 'offline'

const logoUrl = '/usefrete-logo.png'
const demoRequest: RequestData = {
  origin: 'Messejana, Fortaleza',
  destination: 'Centro, Sobral',
  date: 'Hoje',
  window: '16h–18h',
  cargoType: 'Estruturas',
  weight: '4,2 t',
  dimensions: '4,8 × 2,1 × 1,7 m',
  volumes: '6 volumes',
  notes: 'Estruturas metálicas embaladas. Coleta com empilhadeira no local.',
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
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm font-extrabold text-[#071a9a]"><ArrowLeft className="size-4" /> Voltar</button>
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

function Welcome({ onContractor, onCarrier }: { onContractor: () => void; onCarrier: () => void }) {
  return (
    <main className="min-h-screen bg-[#f4f5ef]">
      <section className="usefrete-hero px-4 pb-9 pt-5 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Logo />
          <div className="mt-8 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-white/20"><Sparkles className="size-3.5 text-[#f5a800]" /> UseFrete V2 · Matching inteligente</span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl">Sua carga encontra o transporte certo.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">Conte o que precisa transportar. A UseFrete analisa rota, veículo, capacidade e disponibilidade para mostrar apenas opções compatíveis.</p>
          </div>
        </div>
      </section>
      <section className="relative mx-auto -mt-1 grid max-w-5xl gap-4 px-4 pb-12 sm:grid-cols-2 sm:px-8">
        <button type="button" onClick={onContractor} className="group rounded-[1.75rem] bg-[#fffefa] p-6 text-left shadow-[0_18px_50px_rgba(7,26,154,0.10)] ring-1 ring-slate-100 transition hover:-translate-y-1">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#f5a800]"><Package className="size-6" /></span>
          <div className="mt-5"><Eyebrow>Para empresas e contratantes</Eyebrow></div>
          <h2 className="mt-2 text-2xl font-black text-[#071a9a]">Preciso de transporte</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Estruture sua demanda e encontre transportadores realmente compatíveis.</p>
          <span className="mt-5 flex items-center gap-2 text-sm font-black text-[#071a9a]">Começar solicitação <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
        </button>
        <button type="button" onClick={onCarrier} className="group rounded-[1.75rem] bg-[#fffefa] p-6 text-left shadow-[0_18px_50px_rgba(7,26,154,0.08)] ring-1 ring-slate-100 transition hover:-translate-y-1">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-[#071a9a]"><Truck className="size-6" /></span>
          <div className="mt-5"><Eyebrow>Para quem transporta</Eyebrow></div>
          <h2 className="mt-2 text-2xl font-black text-[#071a9a]">Sou transportador</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Informe sua disponibilidade e receba oportunidades alinhadas à sua rota.</p>
          <span className="mt-5 flex items-center gap-2 text-sm font-black text-[#071a9a]">Ver oportunidades <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
        </button>
        <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 sm:col-span-2">
          <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#071a9a] text-white"><Route className="size-5" /></div><div><p className="font-black text-[#071a9a]">Não é um mural de fretes.</p><p className="mt-1 text-sm leading-6 text-slate-600">Cada solicitação gera um matching por requisitos. Retornos vazios entram como disponibilidade e viram oportunidades melhores para todos.</p></div></div>
        </div>
      </section>
    </main>
  )
}

function RouteStep({ data, update, onBack, onNext }: { data: RequestData; update: (patch: Partial<RequestData>) => void; onBack: () => void; onNext: () => void }) {
  return (
    <Page onBack={onBack} label="Solicitação de transporte">
      <Progress active={0} /><Eyebrow>Etapa 1 de 4</Eyebrow><h1 className="mt-2 text-3xl font-black tracking-tight text-[#071a9a]">Qual é a rota?</h1><p className="mt-2 text-sm leading-6 text-slate-500">Começamos pela localização e pelo prazo para buscar quem pode atender você.</p>
      <form onSubmit={(event) => { event.preventDefault(); onNext() }} className="mt-6 space-y-4">
        <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><Field label="Origem" value={data.origin} onChange={(origin) => update({ origin })} placeholder="Bairro, cidade" /><Field label="Destino" value={data.destination} onChange={(destination) => update({ destination })} placeholder="Bairro, cidade" /></section>
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex items-center gap-2 text-sm font-black text-slate-800"><CalendarDays className="size-4 text-[#f5a800]" /> Data da coleta</div><div className="mt-3 grid grid-cols-3 gap-2">{['Hoje', 'Amanhã', 'Escolher data'].map((date) => <button key={date} type="button" onClick={() => update({ date })} className={`rounded-xl px-2 py-3 text-xs font-extrabold ${data.date === date ? 'bg-[#071a9a] text-white' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'}`}>{date}</button>)}</div><div className="mt-4"><SelectField label="Janela de horário" value={data.window} onChange={(window) => update({ window })} options={['16h–18h', '18h–20h', '08h–10h', 'Horário flexível']} /></div></section>
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
        <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2"><SelectField label="Tipo de carga" value={data.cargoType} onChange={(cargoType) => update({ cargoType })} options={['Equipamentos', 'Estruturas', 'Materiais', 'Máquinas', 'Mercadorias', 'Outros']} /><Field label="Peso aproximado" value={data.weight} onChange={(weight) => update({ weight })} placeholder="Ex.: 4,2 t" /><Field label="Dimensões" value={data.dimensions} onChange={(dimensions) => update({ dimensions })} placeholder="Compr. × larg. × alt." /><Field label="Quantidade / volumes" value={data.volumes} onChange={(volumes) => update({ volumes })} placeholder="Ex.: 6 volumes" /><label className="flex flex-col gap-1.5 text-sm font-bold text-slate-700 sm:col-span-2"><span>Observações</span><textarea value={data.notes} onChange={(event) => update({ notes: event.target.value })} className="min-h-24 rounded-xl border border-slate-200 bg-[#fffefa] p-3 text-sm font-medium outline-none" /></label></section>
        <PrimaryButton type="submit">Continuar para veículo <ArrowRight className="size-4" /></PrimaryButton>
      </form>
    </Page>
  )
}

function VehicleRecommendation({ data, update }: { data: RequestData; update: (patch: Partial<RequestData>) => void }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-[#071a9a] text-white shadow-xl shadow-blue-950/15"><div className="p-5"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5a800] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white"><Sparkles className="size-3" /> Veículo recomendado</span><div className="mt-5 flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-white/10"><Truck className="size-8 text-[#f5a800]" /></div><div><h2 className="text-2xl font-black">{data.vehicle}</h2><p className="text-sm font-bold text-blue-100">{data.body}</p></div></div><p className="mt-4 text-sm leading-6 text-blue-100">Compatível com o peso, as dimensões e o tipo de carga informados.</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold"><span className="rounded-xl bg-white/10 p-3"><Weight className="mb-1 size-4 text-[#f5a800]" /> Capacidade até 14 t</span><span className="rounded-xl bg-white/10 p-3"><ShieldCheck className="mb-1 size-4 text-[#f5a800]" /> Carga bem acomodada</span></div></div><div className="grid grid-cols-2 border-t border-white/10 bg-white/5 p-3"><SelectField label="Veículo" value={data.vehicle} onChange={(vehicle) => update({ vehicle })} options={['VUC', 'Toco', 'Truck', 'Bitruck', 'Carreta']} /><div className="pl-2"><SelectField label="Carroceria" value={data.body} onChange={(body) => update({ body })} options={['Baú', 'Carga seca', 'Carroceria aberta', 'Sider', 'Plataforma']} /></div></div></section>
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
      {expanded && <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-[11px]"><div><Star className="mx-auto size-4 fill-[#f5a800] text-[#f5a800]" /><p className="mt-1 font-black">{carrier.rating}</p><span className="text-slate-400">{carrier.trips} viagens</span></div><div><Gauge className="mx-auto size-4 text-[#071a9a]" /><p className="mt-1 font-black">{carrier.capacity}</p><span className="text-slate-400">Capacidade</span></div><div><LocateFixed className="mx-auto size-4 text-[#071a9a]" /><p className="mt-1 font-black">{carrier.distance}</p><span className="text-slate-400">Localização</span></div><p className="col-span-3 mt-2 rounded-xl bg-blue-50 p-3 text-left font-semibold leading-5 text-[#071a9a]">{carrier.note}</p></div>}
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4"><div><span className="text-xs text-slate-400">Proposta</span><p className="text-xl font-black text-[#071a9a]">{carrier.price}</p></div><div className="flex gap-2"><button type="button" onClick={onExpand} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600">{expanded ? 'Fechar' : 'Ver detalhes'}</button><button type="button" onClick={onSelect} className="rounded-xl bg-[#f5a800] px-3 py-2 text-xs font-black text-white">Selecionar</button></div></div></article>
  )
}

function Results({ onBack, onSelect }: { onBack: () => void; onSelect: (carrier: Carrier) => void }) {
  const [expanded, setExpanded] = useState<number | null>(1)
  return (
    <Page onBack={onBack} label="Resultado do matching" wide><div className="rounded-3xl bg-[#071a9a] p-6 text-white sm:p-8"><Eyebrow>Matching concluído</Eyebrow><h1 className="mt-2 text-3xl font-black">3 transportadores compatíveis encontrados</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Em vez de uma lista genérica, selecionamos as opções que atendem rota, veículo, capacidade e prazo.</p></div><div className="mt-5 grid gap-4 lg:grid-cols-3">{carriers.map((carrier) => <CarrierCard key={carrier.id} carrier={carrier} expanded={expanded === carrier.id} onExpand={() => setExpanded(expanded === carrier.id ? null : carrier.id)} onSelect={() => onSelect(carrier)} />)}</div></Page>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0"><span className="text-sm text-slate-400">{label}</span><strong className="max-w-[65%] text-right text-sm text-slate-800">{value}</strong></div> }

function Confirmation({ data, carrier, onBack, onConfirm }: { data: RequestData; carrier: Carrier; onBack: () => void; onConfirm: () => void }) {
  return (
    <Page onBack={onBack} label="Confirmação"><Eyebrow>Revise os dados</Eyebrow><h1 className="mt-2 text-3xl font-black text-[#071a9a]">Tudo certo para confirmar?</h1><section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><SummaryRow label="Origem" value={data.origin} /><SummaryRow label="Destino" value={data.destination} /><SummaryRow label="Carga" value={`${data.cargoType} · ${data.weight} · ${data.volumes}`} /><SummaryRow label="Veículo" value={`${data.vehicle} · ${data.body}`} /><SummaryRow label="Coleta" value={`${data.date}, ${data.window}`} /></section><section className="mt-4 flex items-center gap-4 rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100"><div style={{ background: carrier.color }} className="flex size-12 items-center justify-center rounded-2xl font-black text-white">{carrier.initials}</div><div className="flex-1"><p className="font-black text-[#071a9a]">{carrier.name}</p><p className="text-xs font-semibold text-slate-500">Verificado · {carrier.rating} ★ · chegada em {carrier.eta}</p></div><strong className="text-[#071a9a]">{carrier.price}</strong></section><div className="mt-5"><PrimaryButton onClick={onConfirm}><CheckCircle2 className="size-5" /> Confirmar transporte</PrimaryButton></div><p className="mt-3 text-center text-[11px] leading-5 text-slate-400">Demonstração: valor, aceite e transportador são dados ilustrativos.</p></Page>
  )
}

const demoRoute: [number, number][] = [[-3.7275, -38.5275], [-3.72, -38.49], [-3.69, -38.48], [-3.64, -38.51], [-3.59, -38.56], [-3.31, -39.02], [-3.1, -40.02], [-3.69, -40.35]]

function Tracking({ carrier, onHome }: { data: RequestData; carrier: Carrier; onHome: () => void }) {
  const [stage, setStage] = useState(1)
  return (
    <main className="min-h-screen bg-[#f4f5ef] pb-12"><AppHeader label="Transporte confirmado" /><div className="mx-auto grid max-w-5xl gap-5 px-4 pt-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]"><section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100"><div className="relative h-[340px] bg-[#dce8ed]"><RouteMap origin={demoRoute[0]} destination={demoRoute[demoRoute.length - 1]} route={demoRoute} /></div><div className="p-5"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="size-5" /></div><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Transporte confirmado</p><h1 className="font-black text-[#071a9a]">{carrier.name} está a caminho</h1></div></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Chegada na coleta</span><p className="mt-1 font-black">{carrier.eta}</p></div><div className="rounded-xl bg-slate-50 p-3"><span className="text-slate-400">Rota</span><p className="mt-1 font-black">Fortaleza → Sobral</p></div></div></div></section><section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><Eyebrow>Acompanhamento</Eyebrow><h2 className="mt-2 text-2xl font-black text-[#071a9a]">Status do transporte</h2><div className="mt-5">{trackingStages.map((item, index) => <div key={item} className="flex gap-3"><div className="flex flex-col items-center"><span className={`flex size-7 items-center justify-center rounded-full ${index <= stage ? 'bg-[#f5a800] text-white' : 'bg-slate-100 text-slate-400'}`}>{index < stage ? <Check className="size-3.5" /> : index + 1}</span>{index < trackingStages.length - 1 && <span className={`h-8 w-0.5 ${index < stage ? 'bg-[#f5a800]' : 'bg-slate-200'}`} />}</div><div className="pt-1"><p className={`text-sm font-extrabold ${index === stage ? 'text-[#071a9a]' : index < stage ? 'text-slate-700' : 'text-slate-400'}`}>{item}</p>{index === stage && <p className="mt-0.5 text-xs text-slate-400">Atualizado agora</p>}</div></div>)}</div><button type="button" onClick={() => setStage((current) => Math.min(current + 1, trackingStages.length - 1))} disabled={stage === trackingStages.length - 1} className="mt-5 h-11 w-full rounded-xl bg-[#071a9a] text-sm font-black text-white disabled:opacity-50">{stage === trackingStages.length - 1 ? 'Entrega concluída' : 'Simular próxima etapa'}</button><button type="button" onClick={onHome} className="mt-2 h-11 w-full rounded-xl text-sm font-black text-slate-500">Voltar ao início</button></section></div></main>
  )
}

const availabilityOptions: { id: Availability; title: string; icon: string; tone: string }[] = [{ id: 'now', title: 'Disponível agora', icon: '●', tone: 'text-emerald-600' }, { id: 'later', title: 'Disponível mais tarde', icon: '◷', tone: 'text-amber-600' }, { id: 'route', title: 'Em rota', icon: '↗', tone: 'text-blue-600' }, { id: 'empty', title: 'Retornando vazio', icon: '↩', tone: 'text-[#f5a800]' }, { id: 'offline', title: 'Indisponível', icon: '●', tone: 'text-slate-400' }]

function AvailabilitySelector({ value, onChange }: { value: Availability; onChange: (value: Availability) => void }) {
  const showRoute = value === 'route' || value === 'empty'
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex items-center justify-between"><div><Eyebrow>Minha disponibilidade</Eyebrow><h2 className="mt-1 text-xl font-black text-[#071a9a]">Como você está hoje?</h2></div><span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#071a9a]"><Navigation className="size-5" /></span></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{availabilityOptions.map((option) => <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-extrabold ring-1 ${value === option.id ? 'bg-[#071a9a] text-white ring-[#071a9a]' : 'bg-[#fffefa] text-slate-600 ring-slate-200'}`}><span className={value === option.id ? 'text-[#f5a800]' : option.tone}>{option.icon}</span>{option.title}</button>)}</div>{showRoute && <div className="mt-4 grid gap-3 rounded-2xl bg-orange-50/70 p-4 sm:grid-cols-2"><Field label="Origem atual" value="Fortaleza" onChange={() => undefined} placeholder="Cidade" /><Field label="Destino" value="Sobral" onChange={() => undefined} placeholder="Cidade" /><Field label="Saída estimada" value="17:30" onChange={() => undefined} placeholder="Horário" /><Field label="Capacidade disponível" value="5 t" onChange={() => undefined} placeholder="Ex.: 5 t" /><p className="rounded-xl bg-white p-3 text-xs font-bold leading-5 text-[#071a9a] sm:col-span-2"><Sparkles className="mr-1 inline size-3.5 text-[#f5a800]" /> Encontramos uma oportunidade compatível com sua rota de retorno.</p></div>}</section>
  )
}

function OpportunityCard({ item, onOpen }: { item: Opportunity; onOpen: () => void }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex items-center justify-between gap-3"><MatchBadge value={item.match} /><strong className="text-lg text-[#071a9a]">{item.price}</strong></div><h3 className="mt-4 text-xl font-black text-slate-900">{item.from} <span className="text-slate-300">→</span> {item.to}</h3><p className="mt-1 text-xs font-semibold text-slate-400">{item.distance} · desvio da sua rota: <strong className="text-emerald-700">{item.detour}</strong></p><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-3"><Package className="mb-1 size-4 text-[#f5a800]" /><strong>{item.cargo}</strong><p className="mt-1 text-slate-400">{item.weight}</p></div><div className="rounded-xl bg-slate-50 p-3"><Truck className="mb-1 size-4 text-[#071a9a]" /><strong>{item.vehicle}</strong><p className="mt-1 text-slate-400">{item.collection}</p></div></div><button type="button" onClick={onOpen} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#071a9a] text-sm font-black text-white">Ver oportunidade <ChevronRight className="size-4" /></button></article>
  )
}

function CarrierHome({ onBack, onOpportunity }: { onBack: () => void; onOpportunity: (item: Opportunity) => void }) {
  const [availability, setAvailability] = useState<Availability>('empty')
  useEffect(() => { try { window.localStorage.setItem('usefrete-availability', availability) } catch { /* modo privado */ } }, [availability])
  return (
    <Page onBack={onBack} label="Área do transportador" wide><div className="flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>Painel do transportador</Eyebrow><h1 className="mt-2 text-3xl font-black text-[#071a9a]">Olá, João!</h1><p className="mt-1 text-sm text-slate-500">Truck · Carroceria aberta · Perfil verificado</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700"><BadgeCheck className="size-4" /> Verificado</span></div><div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><AvailabilitySelector value={availability} onChange={setAvailability} /><section><Eyebrow>Oportunidades para você</Eyebrow><h2 className="mt-1 text-2xl font-black text-slate-900">Fretes compatíveis</h2><p className="mt-1 text-sm text-slate-500">Ordenados pela sua rota, veículo e disponibilidade.</p><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{opportunities.map((item) => <OpportunityCard key={item.id} item={item} onOpen={() => onOpportunity(item)} />)}</div></section></div></Page>
  )
}

function OpportunityDetail({ item, onBack }: { item: Opportunity; onBack: () => void }) {
  const [sent, setSent] = useState(false)
  return (
    <Page onBack={onBack} label="Oportunidade compatível"><div className="flex items-center justify-between"><MatchBadge value={item.match} /><strong className="text-2xl text-[#071a9a]">{item.price}</strong></div><h1 className="mt-4 text-3xl font-black text-[#071a9a]">{item.from} → {item.to}</h1><p className="mt-2 text-sm text-slate-500">{item.company} · {item.distance} · coleta {item.collection.toLowerCase()}</p><section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><SummaryRow label="Carga" value={item.cargo} /><SummaryRow label="Peso" value={item.weight} /><SummaryRow label="Dimensões" value={item.dimensions} /><SummaryRow label="Veículo" value={item.vehicle} /><SummaryRow label="Desvio da sua rota" value={item.detour} /></section><section className="mt-4 rounded-3xl bg-blue-50 p-5 ring-1 ring-blue-100"><p className="text-sm font-black text-[#071a9a]">Requisitos da carga</p><div className="mt-3 flex flex-wrap gap-2">{item.requirements.map((requirement) => <span key={requirement} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600">✓ {requirement}</span>)}</div></section><div className="mt-5"><PrimaryButton onClick={() => setSent(true)} disabled={sent}>{sent ? <><CheckCircle2 className="size-5" /> Interesse enviado ao contratante</> : <>Tenho interesse <ArrowRight className="size-4" /></>}</PrimaryButton></div>{sent && <p className="mt-3 text-center text-sm font-bold text-emerald-700">Você será avisado quando o contratante responder.</p>}</Page>
  )
}

export default function UseFreteApp() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [request, setRequest] = useState<RequestData>(demoRequest)
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier>(carriers[0])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>(opportunities[0])
  const updateRequest = (patch: Partial<RequestData>) => setRequest((current) => ({ ...current, ...patch }))
  if (screen === 'welcome') return <Welcome onContractor={() => setScreen('route')} onCarrier={() => setScreen('carrier')} />
  if (screen === 'route') return <RouteStep data={request} update={updateRequest} onBack={() => setScreen('welcome')} onNext={() => setScreen('cargo')} />
  if (screen === 'cargo') return <CargoStep data={request} update={updateRequest} onBack={() => setScreen('route')} onNext={() => setScreen('vehicle')} />
  if (screen === 'vehicle') return <VehicleStep data={request} update={updateRequest} onBack={() => setScreen('cargo')} onNext={() => setScreen('matching')} />
  if (screen === 'matching') return <Matching onDone={() => setScreen('results')} />
  if (screen === 'results') return <Results onBack={() => setScreen('vehicle')} onSelect={(carrier) => { setSelectedCarrier(carrier); setScreen('confirmation') }} />
  if (screen === 'confirmation') return <Confirmation data={request} carrier={selectedCarrier} onBack={() => setScreen('results')} onConfirm={() => setScreen('tracking')} />
  if (screen === 'tracking') return <Tracking data={request} carrier={selectedCarrier} onHome={() => setScreen('welcome')} />
  if (screen === 'carrier') return <CarrierHome onBack={() => setScreen('welcome')} onOpportunity={(item) => { setSelectedOpportunity(item); setScreen('opportunity') }} />
  return <OpportunityDetail item={selectedOpportunity} onBack={() => setScreen('carrier')} />
}
