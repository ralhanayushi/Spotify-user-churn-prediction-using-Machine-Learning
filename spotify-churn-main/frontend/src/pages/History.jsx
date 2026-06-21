import { useEffect, useState } from 'react'
import { getPredictionHistory, getPredictionStats } from '../services/api'

const RISK_COLORS = {
    High:   { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
    Medium: { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
    Low:    { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' },
}

export default function History() {
    const [records, setRecords] = useState([])
    const [stats,   setStats]   = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getPredictionHistory(50), getPredictionStats()])
            .then(([histRes, statsRes]) => {
                setRecords(histRes.data.predictions)
                setStats(statsRes.data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div style={{ textAlign: 'center', padding: 60, color: '#b3b3b3' }}>
            Loading history...
        </div>
    )

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.7rem',
                color: 'var(--text)', marginBottom: 4 }}>
                Prediction History
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
                All predictions stored in MongoDB — {records.length} records
            </p>

            {/* Stats cards */}
            {stats && (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
                    {[
                        { label: 'Total Predictions', value: stats.total_predictions },
                        { label: 'High Risk',   value: stats.high_risk,   col: '#dc2626' },
                        { label: 'Medium Risk', value: stats.medium_risk, col: '#d97706' },
                        { label: 'Low Risk',    value: stats.low_risk,    col: '#059669' },
                        { label: 'Avg Churn %', value: `${stats.avg_churn_probability}%` },
                    ].map(s => (
                        <div key={s.label} style={{
                            flex: 1, minWidth: 130,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 12, padding: '16px 12px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800,
                                color: s.col || '#1DB954' }}>{s.value}</div>
                            <div style={{ color: 'var(--text-muted)',
                                fontSize: '0.78rem', marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Records table */}
            <div style={{ background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 14,
                overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse',
                    fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--surface2)' }}>
                            {['Date', 'Subscription', 'Country', 'Genre',
                              'Daily Min', 'Risk Level', 'Probability'].map(h => (
                                <th key={h} style={{ padding: '12px 10px',
                                    textAlign: 'left', color: 'var(--text-muted)',
                                    fontWeight: 600, fontSize: '0.78rem',
                                    borderBottom: '1px solid var(--border)' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r, i) => {
                            const rc = RISK_COLORS[r.risk_level] || RISK_COLORS.Low
                            return (
                                <tr key={i} style={{
                                    borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '10px 10px',
                                        color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                        {new Date(r.predicted_at)
                                            .toLocaleString('en-IN')}
                                    </td>
                                    <td style={{ padding: '10px 10px',
                                        color: 'var(--text)' }}>
                                        {r.subscription_type}
                                    </td>
                                    <td style={{ padding: '10px 10px',
                                        color: 'var(--text)' }}>{r.country}</td>
                                    <td style={{ padding: '10px 10px',
                                        color: 'var(--text)' }}>{r.top_genre}</td>
                                    <td style={{ padding: '10px 10px',
                                        color: 'var(--text)' }}>
                                        {r.avg_daily_minutes}
                                    </td>
                                    <td style={{ padding: '10px 10px' }}>
                                        <span style={{
                                            background: rc.bg, color: rc.text,
                                            border: `1px solid ${rc.border}`,
                                            padding: '3px 10px', borderRadius: 20,
                                            fontWeight: 700, fontSize: '0.78rem'
                                        }}>
                                            {r.risk_level}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 10px',
                                        color: 'var(--text)', fontWeight: 700 }}>
                                        {(r.churn_probability * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {records.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40,
                        color: 'var(--text-muted)' }}>
                        No predictions yet. Make your first prediction!
                    </div>
                )}
            </div>
        </div>
    )
}