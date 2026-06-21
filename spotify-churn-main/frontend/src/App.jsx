import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { createContext, useContext, useState, useEffect } from 'react'
import Home      from './pages/Home'
import Predict   from './pages/Predict'
import Analytics from './pages/Analytics'
// Add this import at the top
import History from './pages/History'

// ── Theme Context ────────────────────────────────────────
export const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

// ── Theme Toggle Button ──────────────────────────────────
function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        background:   dark ? '#2a2a2a' : '#f0f0f0',
        border:       dark ? '1px solid #444' : '1px solid #ddd',
        borderRadius: '30px',
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        gap:          '6px',
        padding:      '6px 14px',
        fontSize:     '0.85rem',
        color:        dark ? '#fff' : '#333',
        fontWeight:   600,
        transition:   'all 0.25s',
        marginLeft:   '8px',
      }}
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}

export default function App() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('light', !dark)
  }, [dark])

  const toggle = () => setDark(d => !d)

  const navStyle = ({ isActive }) => ({
    color:          isActive ? '#1DB954' : (dark ? '#b3b3b3' : '#555'),
    textDecoration: 'none',
    fontWeight:     isActive ? 600 : 400,
    fontSize:       '0.95rem',
    padding:        '6px 14px',
    borderRadius:   '20px',
    background:     isActive ? 'rgba(29,185,84,0.12)' : 'transparent',
    transition:     'all 0.2s',
  })

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <BrowserRouter>
        <nav style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '8px',
          padding:      '16px 32px',
          background:   'var(--nav-bg)',
          borderBottom: '1px solid var(--border)',
          position:     'sticky',
          top:          0,
          zIndex:       100,
          transition:   'background 0.3s',
          boxShadow:    dark ? 'none' : '0 1px 12px rgba(0,0,0,0.08)',
        }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginRight:'auto' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1DB954">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 1 1-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.779.779 0 0 1-1.072.257C14.1 12.235 10.539 11.75 7.2 12.71a.78.78 0 0 1-.455-1.49c3.793-1.057 7.794-.533 10.808 1.411a.779.779 0 0 1 .256 1.071zm.105-2.835C14.692 9.15 9.375 8.977 6.297 9.9a.935.935 0 1 1-.543-1.788c3.532-1.072 9.404-.865 13.115 1.337a.936.936 0 0 1-.955 1.618z"/>
            </svg>
            <span style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--text)' }}>ChurnIQ</span>
            <span style={{ fontSize:'0.72rem', color:'#1DB954', background:'rgba(29,185,84,0.15)', padding:'2px 8px', borderRadius:'12px' }}>Spotify</span>
          </div>

          <NavLink to="/"          style={navStyle}>Home</NavLink>
          <NavLink to="/predict"   style={navStyle}>Predict</NavLink>
          <NavLink to="/analytics" style={navStyle}>Analytics</NavLink>
          <ThemeToggle />
          // Add this NavLink in the nav bar
          <NavLink to="/history" style={navStyle}>History</NavLink>
        </nav>

        <Routes>
          <Route path="/"          element={<Home />}      />
          <Route path="/predict"   element={<Predict />}   />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
