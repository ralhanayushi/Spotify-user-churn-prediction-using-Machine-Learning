import { useNavigate } from 'react-router-dom'

const Card = ({ icon, title, desc }) => (
  <div style={{
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    borderRadius: '16px',
    padding:      '28px',
    flex:         '1',
    minWidth:     '220px',
    transition:   'background 0.3s, border 0.3s',
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
    <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '8px',
      color: 'var(--text)' }}>{title}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</div>
  </div>
)

export default function Home() {
  const nav = useNavigate()
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(29,185,84,0.12)',
          color: '#1DB954', padding: '6px 18px', borderRadius: '20px',
          fontSize: '0.82rem', fontWeight: 600, marginBottom: '20px', letterSpacing: '0.5px'
        }}>
          MACHINE LEARNING · SPOTIFY DATA
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.2,
          marginBottom: '20px', color: 'var(--text)' }}>
          Predict Customer Churn<br />
          <span style={{ color: '#1DB954' }}>Before It Happens</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '540px',
          margin: '0 auto 36px', lineHeight: 1.7 }}>
          A Gradient Boosting model trained on 1,000 Spotify users to identify who is likely
          to cancel their subscription — with 80% accuracy and 0.75 AUC.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => nav('/predict')} style={{
            background: '#1DB954', color: '#000', border: 'none', borderRadius: '30px',
            padding: '14px 32px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer'
          }}>
            Try Prediction →
          </button>
          <button onClick={() => nav('/analytics')} style={{
            background:   'transparent',
            color:        'var(--text)',
            border:       '1px solid var(--border)',
            borderRadius: '30px',
            padding:      '14px 32px',
            fontWeight:   600,
            fontSize:     '1rem',
            cursor:       'pointer',
            transition:   'border 0.3s, color 0.3s',
          }}>
            View Analytics
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
        {[
          { label: 'Training Samples', value: '1,000' },
          { label: 'Model Accuracy',   value: '80%'   },
          { label: 'ROC-AUC Score',    value: '0.75'  },
          { label: 'Churn Rate',       value: '18.6%' },
        ].map(s => (
          <div key={s.label} style={{
            flex:         '1',
            minWidth:     '140px',
            background:   'var(--surface)',
            border:       '1px solid var(--border)',
            borderRadius: '12px',
            padding:      '20px',
            textAlign:    'center',
            transition:   'background 0.3s, border 0.3s',
          }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1DB954' }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Card icon="🎯" title="Churn Prediction"    desc="Input any user's listening behaviour and get an instant churn probability with risk classification." />
        <Card icon="📊" title="Dataset Analytics"   desc="Explore churn patterns across genres, countries, and subscription types from the real Spotify dataset." />
        <Card icon="💡" title="Actionable Insights"  desc="Each prediction comes with the top risk factors and a tailored retention recommendation." />
      </div>
    </div>
  )
}
