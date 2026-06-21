import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { getAnalytics } from '../services/api'

const GREENS  = ['#1DB954', '#158a3e', '#0f5c29', '#0a3d1b']
const PALETTE = ['#1DB954','#1ed760','#17a349','#128f40','#0d7a37','#09652e','#065024']

const StatCard = ({ label, value, sub }) => (
  <div style={{
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    borderRadius: '14px',
    padding:      '22px 20px',
    flex:         '1',
    minWidth:     '140px',
    transition:   'background 0.3s, border 0.3s',
  }}>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1DB954' }}>{value}</div>
    {sub && <div style={{ color: 'var(--text-sub)', fontSize: '0.78rem', marginTop: '4px' }}>{sub}</div>}
  </div>
)

const SectionTitle = ({ children }) => (
  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '18px', marginTop: '36px' }}>
    {children}
  </h3>
)

export default function Analytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#b3b3b3' }}>
      Loading analytics…
    </div>
  )
  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#e74c3c' }}>
      Could not load analytics. Make sure the backend is running.<br />
      <code style={{ fontSize: '0.8rem' }}>{error}</code>
    </div>
  )

  // Prepare chart data
  const pieData = [
    { name: 'Retained', value: data.retained_users },
    { name: 'Churned',  value: data.churned_users  },
  ]

  const subData = Object.entries(data.churn_by_subscription).map(([name, rate]) => ({
    name, churnRate: +(rate * 100).toFixed(1)
  }))

  const genreData = Object.entries(data.churn_by_genre)
    .map(([name, rate]) => ({ name, churnRate: +(rate * 100).toFixed(1) }))
    .sort((a, b) => b.churnRate - a.churnRate)

  const countryData = Object.entries(data.churn_by_country)
    .map(([name, rate]) => ({ name, churnRate: +(rate * 100).toFixed(1) }))
    .sort((a, b) => b.churnRate - a.churnRate)

  const featData = data.feature_importance.slice(0, 7).map(f => ({
    name: f.feature.replace(/_/g, ' '),
    importance: +(f.importance * 100).toFixed(1)
  }))

  const chartBg  = {
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    borderRadius: '14px',
    padding:      '24px',
    transition:   'background 0.3s, border 0.3s',
  }
  const axisProps = { tick: { fill: 'var(--text-muted)', fontSize: 11 }, axisLine: { stroke: 'var(--border)' }, tickLine: false }
  const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.7rem', marginBottom: '4px', color: 'var(--text)' }}>Dataset Analytics</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
        Insights from 1,000 Spotify users · Model AUC: <strong style={{ color: '#1DB954' }}>{data.model_auc}</strong>
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <StatCard label="TOTAL USERS"   value={data.total_users.toLocaleString()} />
        <StatCard label="CHURNED"       value={data.churned_users} sub={`${data.churn_rate}% churn rate`} />
        <StatCard label="RETAINED"      value={data.retained_users} />
        <StatCard label="AVG DAILY MIN" value={`${data.avg_daily_minutes}`} sub="minutes / day" />
        <StatCard label="AVG PLAYLISTS" value={`${data.avg_playlists}`} />
      </div>

      {/* Churn Distribution + Subscription */}
      <SectionTitle>Churn Overview</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={chartBg}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '16px' }}>USER DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}
              >
                <Cell fill="#1DB954" />
                <Cell fill="#e74c3c" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={chartBg}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '16px' }}>CHURN RATE BY SUBSCRIPTION (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subData} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis {...axisProps} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`]} />
              <Bar dataKey="churnRate" fill="#1DB954" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Churn by Genre */}
      <SectionTitle>Churn by Genre</SectionTitle>
      <div style={chartBg}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={genreData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`]} />
            <Bar dataKey="churnRate" radius={[6,6,0,0]}>
              {genreData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Churn by Country */}
      <SectionTitle>Churn by Country</SectionTitle>
      <div style={chartBg}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={countryData} barSize={34}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`]} />
            <Bar dataKey="churnRate" radius={[6,6,0,0]}>
              {countryData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Importance */}
      <SectionTitle>Model — Feature Importance</SectionTitle>
      <div style={chartBg}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
          How much each feature contributed to the model's predictions (%)
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={featData} layout="vertical" barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" {...axisProps} unit="%" />
            <YAxis type="category" dataKey="name" width={150} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`]} />
            <Bar dataKey="importance" fill="#1DB954" radius={[0,6,6,0]}>
              {featData.map((_, i) => <Cell key={i} fill={GREENS[Math.min(i, GREENS.length-1)]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
