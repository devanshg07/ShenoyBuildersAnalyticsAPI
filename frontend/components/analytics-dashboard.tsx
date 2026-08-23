'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Activity, ArrowUpRight, BarChart3, CheckCircle2, CircleAlert, Eye, FileText, RefreshCw, Users } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type AnyData = Record<string, unknown> | unknown[] | number | string | null

type Payload = { visitors: AnyData; monthly: AnyData; supabase: AnyData; errors: string[]; fetchedAt: string }

const numberFrom = (value: AnyData, keys: string[]) => {
  if (typeof value === 'number') return value
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 0
  for (const key of keys) if (typeof value[key] === 'number') return value[key] as number
  return 0
}

const listFrom = (value: AnyData): Record<string, unknown>[] => {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
  if (value && typeof value === 'object') {
    for (const key of ['data', 'monthly', 'analytics', 'rows', 'results']) if (Array.isArray(value[key])) return listFrom(value[key])
  }
  return []
}

const labelFrom = (item: Record<string, unknown>, index: number) => String(item.month ?? item.date ?? item.period ?? item.label ?? `Month ${index + 1}`)
const valueFrom = (item: Record<string, unknown>) => numberFrom(item, ['visitors', 'visitor_count', 'pageviews', 'page_views', 'count', 'total'])

function Metric({ label, value, detail, icon: Icon, accent }: { label: string; value: string; detail: string; icon: typeof Users; accent?: boolean }) {
  return <article className={`metric-card ${accent ? 'metric-card-accent' : ''}`}>
    <div className="metric-top"><span>{label}</span><Icon aria-hidden="true" /></div>
    <strong>{value}</strong><p>{detail}</p>
  </article>
}

export function AnalyticsDashboard() {
  const [payload, setPayload] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [textTone, setTextTone] = useState<'default' | 'green' | 'red'>('default')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const response = await fetch('/api/analytics', { cache: 'no-store' }); if (!response.ok) throw new Error('Unable to reach analytics API'); setPayload(await response.json()) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load analytics') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const visitorTotal = numberFrom(payload?.visitors ?? null, ['visitors', 'total_visitors', 'count', 'total'])
  const pageviews = numberFrom(payload?.visitors ?? null, ['pageviews', 'page_views', 'total_pageviews', 'total_page_views'])
  const monthlyRows = useMemo(() => listFrom(payload?.monthly ?? null), [payload])
  const chartData = monthlyRows.map((item, index) => ({ name: labelFrom(item, index), value: valueFrom(item) }))
  const latest = monthlyRows[monthlyRows.length - 1]
  const apiHealthy = !!payload && !error && (payload.errors?.length ?? 0) < 3
  const fmt = (n: number) => n.toLocaleString('en-US')

  const toneStyle = { '--text-tone': textTone === 'green' ? 'oklch(0.62 0.17 145)' : textTone === 'red' ? 'oklch(0.62 0.19 25)' : 'var(--foreground)' } as CSSProperties

  return <main className="dashboard-shell" style={toneStyle}>
    <header className="dashboard-header"><div className="brand"><div className="brand-mark"><BarChart3 aria-hidden="true" /></div><div><p className="eyebrow">Shenoy Builders</p><h1>Analytics overview</h1></div></div><div className="header-actions"><div className="display-controls" aria-label="Display preferences"><div className="tone-controls" role="group" aria-label="Text color"><button className={textTone === 'default' ? 'control-active' : ''} onClick={() => setTextTone('default')} aria-label="Default text color">A</button><button className={textTone === 'green' ? 'control-active control-green' : 'control-green'} onClick={() => setTextTone('green')} aria-label="Green text">A</button><button className={textTone === 'red' ? 'control-active control-red' : 'control-red'} onClick={() => setTextTone('red')} aria-label="Red text">A</button></div><div className="theme-controls" role="group" aria-label="Theme"><button className={theme === 'light' ? 'control-active' : ''} onClick={() => setTheme('light')} aria-label="Light mode">Light</button><button className={theme === 'dark' ? 'control-active' : ''} onClick={() => setTheme('dark')} aria-label="Dark mode">Dark</button></div></div><span className={`status-pill ${apiHealthy ? 'is-live' : 'is-muted'}`}><span className="status-dot" />{apiHealthy ? 'Live data' : 'Waiting for data'}</span><button className="refresh-button" onClick={load} disabled={loading}><RefreshCw aria-hidden="true" className={loading ? 'spin' : ''} />Refresh</button></div></header>
    <section className="welcome-row"><div><p className="eyebrow">Performance monitor</p><h2>Know how your site is growing.</h2><p className="lede">Live traffic from your deployed analytics service, with monthly history saved to Supabase.</p></div><div className="last-updated">Last checked<br /><strong>{payload ? new Date(payload.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</strong></div></section>
    {error && <div className="error-banner"><CircleAlert aria-hidden="true" /><span>{error}. Check that the Render API is awake, then try again.</span><button onClick={load}>Retry</button></div>}
    <section className="metrics-grid" aria-label="Key metrics"><Metric label="Total visitors" value={loading ? '—' : fmt(visitorTotal)} detail="All tracked visitors" icon={Users} accent /><Metric label="Pageviews" value={loading ? '—' : fmt(pageviews)} detail="Across your website" icon={Eye} /><Metric label="Monthly records" value={loading ? '—' : fmt(monthlyRows.length)} detail="Stored analytics periods" icon={FileText} /><Metric label="API status" value={loading ? '—' : apiHealthy ? 'Healthy' : 'Partial'} detail={payload?.errors?.length ? `${payload.errors.length} endpoint issue` : 'Render + Supabase connected'} icon={Activity} /></section>
    <section className="content-grid"><article className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">Traffic history</p><h3>Monthly visitors</h3></div><span className="panel-note"><ArrowUpRight aria-hidden="true" />Since September</span></div>{chartData.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}><defs><linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--popover-foreground)' }} /><Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#trafficFill)" /></AreaChart></ResponsiveContainer></div> : <div className="empty-chart"><BarChart3 aria-hidden="true" /><h3>Monthly history starts September 1</h3><p>Your chart will fill in automatically when the API begins saving its first monthly record.</p></div>}</article><article className="panel latest-panel"><div className="panel-heading"><div><p className="eyebrow">Supabase archive</p><h3>Latest record</h3></div><CheckCircle2 aria-hidden="true" className="success-icon" /></div>{latest ? <dl className="record-list">{Object.entries(latest).slice(0, 6).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{String(value)}</dd></div>)}</dl> : <div className="archive-empty"><FileText aria-hidden="true" /><p>No monthly records yet.</p><span>Records saved from September 1 will appear here.</span></div>}</article></section>
    <footer className="dashboard-footer"><span>Source: shenoybuildersanalyticsapi.onrender.com</span><span>Auto-synced with Supabase</span></footer>
  </main>
}
