import { useState } from 'react'
import { predictChurn } from '../services/api'
import { useTheme } from '../App'

const COUNTRIES    = ["US","PK","DE","IN","UK","BR","FR","CA","RU","AU"]
const GENRES       = ["Electronic","Pop","Classical","Jazz","Country","Rock","Hip-Hop"]
const RISK_COLORS  = { High: '#e74c3c', Medium: '#f39c12', Low: '#1DB954' }

// ── Semicircle Gauge ─────────────────────────────────────
function GaugeMeter({ probability, riskLevel }) {
  const color = RISK_COLORS[riskLevel] || '#1DB954'
  const pct   = Math.min(Math.max(probability, 0), 1)

  const R  = 70
  const cx = 110   // shift center right to give LOW label room on left
  const cy = 90

  // point on circle at given degree (0° = right, 90° = down, 180° = left)
  const pt = (deg) => [
    cx + R * Math.cos((deg * Math.PI) / 180),
    cy + R * Math.sin((deg * Math.PI) / 180),
  ]

  const [lx, ly] = pt(180)   // left  end of arc
  const [rx, ry] = pt(0)     // right end of arc

  // Zone split points on the arc
  const [z1x, z1y] = pt(120) // 1/3 → end of Low
  const [z2x, z2y] = pt(60)  // 2/3 → end of Medium

  // Progress arc: starts at 180° and sweeps clockwise by pct*180°
  const progressDeg  = 180 - pct * 180          // end angle of colored arc
  const [px, py]     = pt(progressDeg)
  const largeArc     = pct > 0.5 ? 1 : 0

  // Needle angle: 180° (left = 0%) → 0° (right = 100%)
  const needleDeg = 180 - pct * 180
  const nLen = 58
  const [nx, ny] = [
    cx + nLen * Math.cos((needleDeg * Math.PI) / 180),
    cy + nLen * Math.sin((needleDeg * Math.PI) / 180),
  ]

  return (
    <div style={{ textAlign: 'center' }}>
      {/* viewBox gives plenty of room: 200 wide, 110 tall */}
      <svg viewBox="0 0 220 110" width="250">

        {/* ── Zone colour bands (thick, behind track) ── */}
        <path d={`M ${lx} ${ly} A ${R} ${R} 0 0 1 ${z1x} ${z1y}`}
          fill="none" stroke="#1DB95428" strokeWidth="20"/>
        <path d={`M ${z1x} ${z1y} A ${R} ${R} 0 0 1 ${z2x} ${z2y}`}
          fill="none" stroke="#f39c1228" strokeWidth="20"/>
        <path d={`M ${z2x} ${z2y} A ${R} ${R} 0 0 1 ${rx} ${ry}`}
          fill="none" stroke="#e74c3c28" strokeWidth="20"/>

        {/* ── Grey track ── */}
        <path d={`M ${lx} ${ly} A ${R} ${R} 0 0 1 ${rx} ${ry}`}
          fill="none" stroke="#333" strokeWidth="10" strokeLinecap="round"/>

        {/* ── Colored progress ── */}
        {pct > 0 && (
          <path d={`M ${lx} ${ly} A ${R} ${R} 0 ${largeArc} 1 ${px} ${py}`}
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"/>
        )}

        {/* ── Needle ── */}
        <line x1={cx} y1={cy} x2={nx} y2={ny}
          stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="5"  fill="white"/>
        <circle cx={cx} cy={cy} r="2"  fill="#666"/>

        {/* ── Zone labels ── */}
        <text x="42"  y="106" fill="#1DB954" fontSize="9" fontWeight="700" textAnchor="middle">LOW</text>
        <text x="110" y="20"  fill="#f39c12" fontSize="9" fontWeight="700" textAnchor="middle">MED</text>
        <text x="178" y="106" fill="#e74c3c" fontSize="9" fontWeight="700" textAnchor="middle">HIGH</text>
      </svg>

      <div style={{ fontSize: '2.8rem', fontWeight: 900, color, marginTop: '4px',
        transition: 'color 0.4s' }}>
        {Math.round(pct * 100)}%
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
        Churn Probability
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────
export default function Predict() {
  const { dark } = useTheme()

  const inputStyle = {
    width: '100%',
    background:   'var(--input-bg)',
    border:       '1px solid var(--input-border)',
    color:        'var(--text)',
    borderRadius: '10px',
    padding:      '10px 14px',
    fontSize:     '0.93rem',
    outline:      'none',
    marginTop:    '6px',
    transition:   'background 0.3s, border 0.3s',
  }
  const labelStyle = {
    fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500
  }
  const cardStyle = {
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    borderRadius: '16px',
    padding:      '28px',
    transition:   'background 0.3s',
  }

  const [form, setForm] = useState({
    subscription_type:     'Premium',
    country:               'US',
    avg_daily_minutes:     90,
    number_of_playlists:   5,
    top_genre:             'Pop',
    skips_per_day:         4,
    support_tickets:       0,
    days_since_last_login: 3,
  })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await predictChurn({
        ...form,
        avg_daily_minutes:     parseFloat(form.avg_daily_minutes),
        number_of_playlists:   parseInt(form.number_of_playlists),
        skips_per_day:         parseInt(form.skips_per_day),
        support_tickets:       parseInt(form.support_tickets),
        days_since_last_login: parseInt(form.days_since_last_login),
      })
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.7rem', marginBottom: '4px',
        color: 'var(--text)' }}>Churn Predictor</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
        Enter a Spotify user's profile to predict their likelihood of churning.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

        {/* ── Form ── */}
        <div style={cardStyle}>
          <h3 style={{ fontWeight: 700, marginBottom: '20px', fontSize: '1rem', color: '#1DB954' }}>
            User Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

            <div>
              <label style={labelStyle}>Subscription</label>
              <select value={form.subscription_type}
                onChange={e => set('subscription_type', e.target.value)} style={inputStyle}>
                <option>Premium</option>
                <option>Free</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <select value={form.country}
                onChange={e => set('country', e.target.value)} style={inputStyle}>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Top Genre</label>
              <select value={form.top_genre}
                onChange={e => set('top_genre', e.target.value)} style={inputStyle}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Avg Daily Minutes</label>
              <input type="number" min="0" value={form.avg_daily_minutes}
                onChange={e => set('avg_daily_minutes', e.target.value)} style={inputStyle}/>
            </div>

            <div>
              <label style={labelStyle}>No. of Playlists</label>
              <input type="number" min="0" value={form.number_of_playlists}
                onChange={e => set('number_of_playlists', e.target.value)} style={inputStyle}/>
            </div>

            <div>
              <label style={labelStyle}>Skips per Day</label>
              <input type="number" min="0" value={form.skips_per_day}
                onChange={e => set('skips_per_day', e.target.value)} style={inputStyle}/>
            </div>

            <div>
              <label style={labelStyle}>Support Tickets</label>
              <input type="number" min="0" value={form.support_tickets}
                onChange={e => set('support_tickets', e.target.value)} style={inputStyle}/>
            </div>

            <div>
              <label style={labelStyle}>Days Since Login</label>
              <input type="number" min="0" value={form.days_since_last_login}
                onChange={e => set('days_since_last_login', e.target.value)} style={inputStyle}/>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            marginTop:    '24px',
            width:        '100%',
            background:   loading ? '#555' : '#1DB954',
            color:        loading ? '#aaa' : '#000',
            border:       'none',
            borderRadius: '30px',
            padding:      '13px',
            fontWeight:   700,
            fontSize:     '1rem',
            cursor:       loading ? 'not-allowed' : 'pointer',
            transition:   'background 0.2s',
          }}>
            {loading ? 'Predicting…' : 'Predict Churn →'}
          </button>

          {error && (
            <div style={{ marginTop: '12px', color: '#e74c3c', fontSize: '0.85rem',
              background: 'rgba(231,76,60,0.1)', padding: '10px', borderRadius: '8px' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── Result ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!result ? (
            <div style={{
              ...cardStyle,
              border:         `1px dashed var(--border)`,
              padding:        '40px',
              textAlign:      'center',
              color:          'var(--text-sub)',
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              minHeight:      '320px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎵</div>
              <div>Fill in the form and click Predict to see results</div>
            </div>
          ) : (
            <>
              {/* ── Gauge Card ── */}
              <div style={{ ...cardStyle, textAlign: 'center', paddingTop: '24px' }}>
                <GaugeMeter
                  probability={result.churn_probability}
                  riskLevel={result.risk_level}
                />

                {/* Risk badge */}
                <div style={{ marginTop: '14px' }}>
                  <span style={{
                    display:      'inline-block',
                    padding:      '6px 22px',
                    borderRadius: '20px',
                    fontWeight:   700,
                    fontSize:     '0.92rem',
                    background:   `${RISK_COLORS[result.risk_level]}22`,
                    color:        RISK_COLORS[result.risk_level],
                    border:       `1px solid ${RISK_COLORS[result.risk_level]}44`,
                  }}>
                    {result.risk_level} Risk &nbsp;·&nbsp;
                    {result.churn_prediction ? '⚠️ Will Churn' : '✅ Will Stay'}
                  </span>
                </div>
              </div>

              {/* ── Top Risk Factors ── */}
              <div style={cardStyle}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem',
                  marginBottom: '12px', fontWeight: 600 }}>
                  TOP RISK FACTORS
                </div>
                {result.top_risk_factors.map((f, i) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center',
                    gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: '#1DB95422', color: '#1DB954',
                      fontSize: '0.75rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</div>
                    <span style={{ fontSize: '0.92rem', color: 'var(--text)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* ── Recommendation ── */}
              <div style={{
                background: `${RISK_COLORS[result.risk_level]}11`,
                border:     `1px solid ${RISK_COLORS[result.risk_level]}44`,
                borderRadius: '16px',
                padding:    '20px',
                fontSize:   '0.9rem',
                lineHeight: 1.6,
                color:      'var(--text)',
              }}>
                <div style={{ fontWeight: 700, marginBottom: '6px',
                  color: RISK_COLORS[result.risk_level] }}>
                  Recommendation
                </div>
                {result.recommendation}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
