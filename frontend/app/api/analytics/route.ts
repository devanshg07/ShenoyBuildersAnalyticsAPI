import { NextResponse } from 'next/server'

const API_BASE = 'https://shenoybuildersanalyticsapi.onrender.com'

export async function GET() {
  const endpoints = ['analytics/visitors', 'analytics/monthly', 'analytics/supabase-test']
  const results = await Promise.allSettled(
    endpoints.map(async (endpoint) => {
      const response = await fetch(`${API_BASE}/${endpoint}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`${endpoint}: ${response.status}`)
      return response.json()
    }),
  )

  const [visitors, monthly, supabase] = results
  return NextResponse.json({
    visitors: visitors.status === 'fulfilled' ? visitors.value : null,
    monthly: monthly.status === 'fulfilled' ? monthly.value : null,
    supabase: supabase.status === 'fulfilled' ? supabase.value : null,
    errors: results.map((result, index) => result.status === 'rejected' ? `${endpoints[index]} unavailable` : null).filter(Boolean),
    fetchedAt: new Date().toISOString(),
  })
}
