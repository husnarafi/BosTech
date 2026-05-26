import { useState, useEffect, useRef } from 'react'
import './index.css'

// ─── Mock Product Catalog ────────────────────────────────────────────────────
const CATALOG = [
  {
    id: "sofa-001",
    name: "Jessa Sectional Sofa",
    category: "Living Room",
    price: 1299,
    style: "Modern Minimal",
    dimensions: "112W x 85D x 34H inches",
    assembly: "moderate",
    petFriendly: true,
    smallSpace: false,
    accessible: true,
    deliveryDays: 7,
    returnDays: 30,
    reviews: [
      "Delivery was fast and packaging was excellent. The fabric held up after 6 months with two dogs.",
      "Assembly took 2 hours with two people. Instructions were clear. Very happy with quality for the price.",
      "Looks exactly like the photo. Firm cushions — great if you like support, not ideal if you want plush.",
      "Customer service replaced a damaged leg within 3 days. Impressed.",
      "Small living room — fits perfectly. Measuring first was key."
    ]
  },
  {
    id: "desk-001",
    name: "Prentice Standing Desk",
    category: "Home Office",
    price: 549,
    style: "Scandinavian",
    dimensions: "60W x 30D x 28-48H inches",
    assembly: "easy",
    petFriendly: true,
    smallSpace: true,
    accessible: true,
    deliveryDays: 5,
    returnDays: 60,
    reviews: [
      "Motor is whisper quiet. Goes from sitting to standing in 20 seconds.",
      "Built-in cable management is a game changer. Finally a clean desk.",
      "Wobbles slightly at max height under heavy monitors — add a mat.",
      "Assembly solo took 45 minutes. Every bolt had a labeled bag.",
      "Returned my old desk immediately after this arrived. Worth every penny."
    ]
  },
  {
    id: "crib-001",
    name: "Harlow 4-in-1 Convertible Crib",
    category: "Nursery",
    price: 389,
    style: "Cozy Farmhouse",
    dimensions: "54W x 30D x 45H inches",
    assembly: "easy",
    petFriendly: false,
    smallSpace: true,
    accessible: false,
    deliveryDays: 10,
    returnDays: 30,
    reviews: [
      "Converts to toddler bed easily — used the same crib for 3 years.",
      "Non-toxic finish confirmed by GREENGUARD certification. Peace of mind.",
      "Mattress not included — buy separately, it matters.",
      "Spindles are the perfect spacing. Baby can't get stuck.",
      "Gorgeous farmhouse look, matched our nursery perfectly."
    ]
  },
  {
    id: "bed-001",
    name: "Nora Upholstered Platform Bed",
    category: "Bedroom",
    price: 799,
    style: "Bold Eclectic",
    dimensions: "Queen: 65W x 87D x 48H inches",
    assembly: "moderate",
    petFriendly: false,
    smallSpace: false,
    accessible: false,
    deliveryDays: 14,
    returnDays: 30,
    reviews: [
      "The velvet is lush and hasn't pilled after a year.",
      "No box spring needed — platform is solid wood.",
      "Takes up space but makes a statement. Master bedroom upgrade.",
      "Headboard bolts took extra time but result is sturdy.",
      "Color online matched real life — unusual for upholstered furniture."
    ]
  },
  {
    id: "sofa-002",
    name: "Callum Loveseat",
    category: "Living Room",
    price: 499,
    style: "Cozy Farmhouse",
    dimensions: "58W x 34D x 35H inches",
    assembly: "easy",
    petFriendly: true,
    smallSpace: true,
    accessible: true,
    deliveryDays: 4,
    returnDays: 45,
    reviews: [
      "Perfect for a studio apartment. Two people fit comfortably.",
      "Microfiber cleaned up easily after a wine spill.",
      "Ships in one box, assembled in 20 minutes.",
      "Not for tall people — seat depth is shallow.",
      "Bought in sage green. Color is even better in person."
    ]
  },
  {
    id: "desk-002",
    name: "Marlowe Writing Desk",
    category: "Home Office",
    price: 229,
    style: "Scandinavian",
    dimensions: "48W x 24D x 30H inches",
    assembly: "easy",
    petFriendly: true,
    smallSpace: true,
    accessible: true,
    deliveryDays: 6,
    returnDays: 30,
    reviews: [
      "Minimal and clean. Exactly what I needed for a small home office.",
      "Surface scratches easily — use a desk pad.",
      "Ships flat, assembles in 15 min. No tools needed.",
      "Three drawers are shallow but good for stationery.",
      "Great value. Looks twice the price."
    ]
  }
]

// Runtime API key store — updated when user enters key
let RUNTIME_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''

async function callClaude(systemPrompt, userMessage) {
  const key = RUNTIME_API_KEY
  if (!key) throw new Error('No API key set')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.content[0].text
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Style Quiz', 'Processing', 'Your Matches']
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const idx = i + 1
        const active = step === idx
        const done = step > idx
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 600,
                  backgroundColor: done ? '#14b8a6' : active ? '#1a3557' : '#e5e7eb',
                  color: done || active ? '#fff' : '#9ca3af',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.4s ease',
                  boxShadow: active ? '0 4px 14px rgba(26,53,87,0.3)' : 'none',
                }}
              >
                {done ? '✓' : idx}
              </div>
              <span style={{
                marginTop: 6, fontSize: 12, fontWeight: 500,
                color: active ? '#1a3557' : done ? '#14b8a6' : '#9ca3af',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 80, height: 2, margin: '0 8px', marginBottom: 20,
                backgroundColor: step > idx ? '#14b8a6' : '#e5e7eb',
                transition: 'background-color 0.6s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Match Score Ring ────────────────────────────────────────────────────────
function ScoreRing({ score, delay = 0 }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const targetOffset = circ - (score / 100) * circ
  const [currentOffset, setCurrentOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setCurrentOffset(targetOffset), delay)
    return () => clearTimeout(t)
  }, [targetOffset, delay])

  const color = score >= 80 ? '#14b8a6' : score >= 60 ? '#3b82f6' : '#f59e0b'

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={currentOffset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{score}</span>
        <span style={{ fontSize: 10, color: '#9ca3af', marginTop: -2 }}>match</span>
      </div>
    </div>
  )
}

// ─── STEP 1: Style Quiz ──────────────────────────────────────────────────────
const VIBES = [
  { id: 'Modern Minimal', emoji: '◻', desc: 'Clean lines, neutral palette', bg: '#f1f5f9', accent: '#64748b' },
  { id: 'Cozy Farmhouse', emoji: '🌾', desc: 'Warm wood, soft textures', bg: '#fffbeb', accent: '#d97706' },
  { id: 'Bold Eclectic', emoji: '✦', desc: 'Color, pattern, personality', bg: '#fdf4ff', accent: '#a855f7' },
  { id: 'Scandinavian', emoji: '❄', desc: 'Functional, light, airy', bg: '#f0f9ff', accent: '#0ea5e9' },
]
const ROOMS = [
  { name: 'Living Room', icon: '🛋' },
  { name: 'Bedroom', icon: '🛏' },
  { name: 'Home Office', icon: '💻' },
  { name: 'Nursery', icon: '🍼' },
]
const CONSTRAINTS = [
  { id: 'petFriendly', label: '🐾 Pet-friendly' },
  { id: 'easyAssembly', label: '🔧 Easy assembly' },
  { id: 'smallSpace', label: '📐 Small space <200sqft' },
  { id: 'accessible', label: '♿ Wheelchair accessible' },
]

function StyleQuiz({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState({ room: '', vibe: '', budget: 1500, constraints: [] })
  const [visible, setVisible] = useState(true)

  const advance = (update) => {
    setVisible(false)
    setTimeout(() => {
      const next = { ...answers, ...update }
      setAnswers(next)
      if (qIdx < 3) { setQIdx((i) => i + 1); setVisible(true) }
      else onComplete(next)
    }, 260)
  }

  const toggleConstraint = (id) =>
    setAnswers((p) => ({
      ...p,
      constraints: p.constraints.includes(id) ? p.constraints.filter((c) => c !== id) : [...p.constraints, id],
    }))

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 6, backgroundColor: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #14b8a6, #1a3557)',
            width: `${((qIdx + 1) / 4) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{qIdx + 1}/4</span>
      </div>

      <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.26s ease' }}>
        {qIdx === 0 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a3557', marginBottom: 6 }}>What room are you furnishing?</h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>We'll tailor every recommendation to your space.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {ROOMS.map((r) => (
                <button
                  key={r.name}
                  onClick={() => advance({ room: r.name })}
                  style={{
                    padding: '20px 16px', borderRadius: 16, border: '2px solid',
                    borderColor: answers.room === r.name ? '#14b8a6' : '#e5e7eb',
                    backgroundColor: answers.room === r.name ? '#f0fdfa' : '#fff',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (answers.room !== r.name) e.currentTarget.style.borderColor = '#99f6e4' }}
                  onMouseLeave={(e) => { if (answers.room !== r.name) e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{r.icon}</div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>{r.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {qIdx === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a3557', marginBottom: 6 }}>Pick a vibe</h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Your aesthetic guides every match.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => advance({ vibe: v.id })}
                  style={{
                    padding: '20px 16px', borderRadius: 16, border: '2px solid',
                    borderColor: answers.vibe === v.id ? v.accent : 'transparent',
                    backgroundColor: v.bg, textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (answers.vibe !== v.id) e.currentTarget.style.borderColor = v.accent + '88' }}
                  onMouseLeave={(e) => { if (answers.vibe !== v.id) e.currentTarget.style.borderColor = 'transparent' }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{v.emoji}</div>
                  <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>{v.id}</div>
                  <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{v.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {qIdx === 2 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a3557', marginBottom: 6 }}>What's your budget?</h2>
            <p style={{ color: '#6b7280', marginBottom: 32 }}>Slide to set your comfortable max spend.</p>
            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 52, fontWeight: 700, color: '#1a3557' }}>${answers.budget.toLocaleString()}</span>
              </div>
              <input
                type="range" min={200} max={5000} step={50}
                value={answers.budget}
                onChange={(e) => setAnswers((p) => ({ ...p, budget: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#14b8a6', cursor: 'pointer', height: 6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
                <span>$200</span><span>$5,000</span>
              </div>
            </div>
            <button
              onClick={() => advance({})}
              style={{
                marginTop: 24, width: '100%', padding: '14px 0',
                background: '#1a3557', color: '#fff', fontWeight: 600, fontSize: 15,
                borderRadius: 12, border: 'none', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#142b47'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#1a3557'}
            >
              That's my budget →
            </button>
          </div>
        )}

        {qIdx === 3 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a3557', marginBottom: 6 }}>Any constraints?</h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Select all that apply — we'll filter for you.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CONSTRAINTS.map((c) => {
                const checked = answers.constraints.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleConstraint(c.id)}
                    style={{
                      padding: '14px 16px', borderRadius: 12, border: '2px solid',
                      borderColor: checked ? '#14b8a6' : '#e5e7eb',
                      backgroundColor: checked ? '#f0fdfa' : '#fff',
                      textAlign: 'left', cursor: 'pointer', fontWeight: 500,
                      fontSize: 15, color: checked ? '#0d9488' : '#374151',
                      display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 5, border: '2px solid',
                      borderColor: checked ? '#14b8a6' : '#d1d5db',
                      backgroundColor: checked ? '#14b8a6' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 700, flexShrink: 0,
                    }}>
                      {checked ? '✓' : ''}
                    </span>
                    {c.label}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => advance({})}
              style={{
                marginTop: 24, width: '100%', padding: '14px 0',
                background: 'linear-gradient(90deg, #14b8a6, #1a3557)',
                color: '#fff', fontWeight: 600, fontSize: 15,
                borderRadius: 12, border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
              }}
            >
              Find my perfect furniture ✨
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── STEP 2: Loading ─────────────────────────────────────────────────────────
function LoadingScreen() {
  const messages = [
    'Scanning 847 products for your vibe...',
    'Checking constraints against each pick...',
    'Reading 2,400+ customer reviews...',
    'Asking RoomMate to rank your top matches...',
    'Almost there — adding personal notes...',
  ]
  const [msgIdx, setMsgIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px' }}>
      <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 32 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #f3f4f6' }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '4px solid transparent', borderTopColor: '#14b8a6', borderRightColor: '#5eead4',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        <div style={{ position: 'absolute', inset: 12, borderRadius: '50%',
          border: '4px solid transparent', borderBottomColor: '#1a3557',
          animation: 'spin 1.5s linear infinite reverse',
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏠</div>
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a3557', marginBottom: 12 }}>
        RoomMate is curating your space...
      </h3>
      <p style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', minHeight: 20 }}>{messages[msgIdx]}</p>
      <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="loading-dot" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#14b8a6' }} />
        ))}
      </div>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ rec, product, rank, delay, allRecs, profile }) {
  const [compareOpen, setCompareOpen] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [compareText, setCompareText] = useState('')

  const rankLabels = ['🥇 Top Pick', '🥈 Runner Up', '🥉 Solid Choice']
  const rankBgColors = ['#fef9c3', '#f3f4f6', '#fef3c7']

  const handleCompare = async () => {
    if (compareText) { setCompareOpen((o) => !o); return }
    setCompareOpen(true)
    setComparing(true)
    try {
      const text = await callClaude(
        'You are RoomMate, an honest interior design agent. Write a short paragraph (3-4 sentences) explaining why the top pick beats the alternatives for this specific user. Reference product names. Be specific and personal. No markdown, no headers.',
        `User profile: ${JSON.stringify(profile)}\n\nTop pick: ${rec.productId}\nAll recommendations: ${JSON.stringify(allRecs)}`
      )
      setCompareText(text)
    } catch (e) {
      setCompareText('Unable to compare: ' + e.message)
    } finally {
      setComparing(false)
    }
  }

  return (
    <div
      className="fade-in-up"
      style={{
        background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        border: '1px solid #f3f4f6', overflow: 'hidden',
        animationDelay: `${delay}ms`, animationFillMode: 'both',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={`https://picsum.photos/seed/${product.id}/600/280`}
          alt={product.name}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            background: rankBgColors[rank], backdropFilter: 'blur(6px)',
            fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}>
            {rankLabels[rank]}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
            fontSize: 12, padding: '4px 10px', borderRadius: 99, fontWeight: 500,
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)', color: '#374151',
          }}>
            {product.deliveryDays}d delivery
          </span>
        </div>
      </div>

      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{product.name}</h3>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#0d9488', marginBottom: 8 }}>${product.price.toLocaleString()}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[product.style, product.category, `↩ ${product.returnDays}d returns`].map((tag) => (
                <span key={tag} style={{
                  fontSize: 11, background: '#f3f4f6', color: '#6b7280',
                  padding: '3px 8px', borderRadius: 99,
                }}>{tag}</span>
              ))}
            </div>
          </div>
          <ScoreRing score={rec.matchScore} delay={delay + 200} />
        </div>

        <div style={{ background: '#f0fdfa', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: '#065f46', lineHeight: 1.6 }}>{rec.whyThisProduct}</p>
        </div>

        <div style={{ marginBottom: 12 }}>
          {rec.prosForYou.map((pro, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#14b8a6', fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
              <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{pro}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fffbeb', borderRadius: 12, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>{rec.watchOut}</p>
        </div>

        <div style={{ background: '#f9fafb', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Customer Sentiment</p>
          <p style={{ fontSize: 13, color: '#4b5563', fontStyle: 'italic' }}>"{ rec.reviewSummary}"</p>
        </div>

        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>📐 {product.dimensions}</p>

        {rank === 0 && (
          <div>
            <button
              onClick={handleCompare}
              style={{
                width: '100%', padding: '12px 0',
                background: compareOpen ? '#f3f4f6' : '#1a3557',
                color: compareOpen ? '#1a3557' : '#fff',
                fontWeight: 600, fontSize: 14,
                borderRadius: 12, border: compareOpen ? '2px solid #1a3557' : 'none',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {compareOpen ? 'Hide comparison ↑' : 'Why this beats the alternatives →'}
            </button>

            {compareOpen && (
              <div
                className="fade-in-up"
                style={{ marginTop: 12, padding: '14px 16px', background: '#f8f9ff', borderRadius: 12, border: '1px solid #e0e7ff' }}
              >
                {comparing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280' }}>
                    <div style={{ width: 16, height: 16, border: '2px solid #1a3557', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Comparing products...
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>{compareText}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Ask RoomMate Chat ────────────────────────────────────────────────────────
function AskRoomMate({ profile, recommendations }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm RoomMate. Ask me anything about your picks — dimensions, styling tips, what to buy first, or how pieces will work together. 🏠" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const SUGGESTIONS = [
    'Will the top pick fit through a 32-inch doorway?',
    "What should I buy first if I'm on a tight budget?",
    'How do I style a small space with these pieces?',
  ]

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const context = `
User profile: ${JSON.stringify(profile)}
Recommended products: ${JSON.stringify(
        recommendations.map((r) => ({ ...r, ...CATALOG.find((c) => c.id === r.productId) }))
      )}`
      const reply = await callClaude(
        "You are RoomMate, a friendly expert interior design assistant. Answer concisely and helpfully (2-4 sentences) based on the user's room profile and recommendations. Be conversational and specific. No markdown headers.",
        `${context}\n\nUser question: ${msg}`
      )
      setMessages((m) => [...m, { role: 'assistant', text: reply }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: `Sorry, something went wrong: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 40, background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a3557, #0d7a6e)', padding: '20px 24px' }}>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>💬 Ask RoomMate</h3>
        <p style={{ color: '#99f6e4', fontSize: 13 }}>Get personalized answers about your space</p>
      </div>

      <div style={{ padding: 16, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.55,
              borderBottomRightRadius: m.role === 'user' ? 4 : 16,
              borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16,
              background: m.role === 'user' ? '#1a3557' : '#f3f4f6',
              color: m.role === 'user' ? '#fff' : '#1f2937',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#f3f4f6', padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 4, display: 'flex', gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="loading-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af' }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div style={{ padding: '4px 16px 12px' }}>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Suggested questions:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 99,
                  background: '#f0fdfa', color: '#0d9488',
                  border: '1px solid #99f6e4', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#ccfbf1'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdfa'}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
        <input
          type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about dimensions, styling, budget..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12,
            border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: loading || !input.trim() ? '#e5e7eb' : '#14b8a6',
            color: '#fff', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}

// ─── Results Page ─────────────────────────────────────────────────────────────
function ResultsPage({ profile, recs, onReset }) {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 80px' }}>
      <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: '#1a3557', marginBottom: 6 }}>Your Perfect Matches</h2>
        <p style={{ color: '#6b7280', fontSize: 15 }}>
          Curated for your <strong>{profile.room}</strong> · <strong>{profile.vibe}</strong> style · <strong>${profile.budget.toLocaleString()}</strong> budget
        </p>
        {profile.constraints?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            {profile.constraints.map((c) => {
              const label = CONSTRAINTS.find((x) => x.id === c)?.label || c
              return (
                <span key={c} style={{ fontSize: 12, background: '#f0fdfa', color: '#0d9488', padding: '3px 10px', borderRadius: 99, border: '1px solid #99f6e4' }}>
                  {label}
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {recs.map((rec, i) => {
          const product = CATALOG.find((p) => p.id === rec.productId)
          return product ? (
            <ProductCard key={rec.productId} rec={rec} product={product} rank={i} delay={i * 150} allRecs={recs} profile={profile} />
          ) : null
        })}
      </div>

      <AskRoomMate profile={profile} recommendations={recs} />
    </div>
  )
}

// ─── API Key Input ────────────────────────────────────────────────────────────
function ApiKeyInput({ onSubmit }) {
  const [key, setKey] = useState('')
  const valid = key.trim().startsWith('sk-')
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔑</div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a3557', marginBottom: 8 }}>Add your Anthropic API Key</h3>
      <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        RoomMate uses Claude to power its recommendations.
        Your key is stored in memory only — never logged or shared.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="password" value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && valid && onSubmit(key.trim())}
          placeholder="sk-ant-..."
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 12,
            border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        <button
          onClick={() => valid && onSubmit(key.trim())}
          disabled={!valid}
          style={{
            padding: '11px 20px', borderRadius: 12,
            background: valid ? '#14b8a6' : '#e5e7eb',
            color: '#fff', fontWeight: 600, border: 'none',
            cursor: valid ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >
          Go
        </button>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState(null)
  const [recs, setRecs] = useState(null)
  const [error, setError] = useState('')
  const [hasKey, setHasKey] = useState(!!import.meta.env.VITE_ANTHROPIC_API_KEY)

  const handleApiKey = (key) => {
    RUNTIME_API_KEY = key
    setHasKey(true)
  }

  const handleQuizComplete = async (answers) => {
    setProfile(answers)
    setError('')
    setStep(2)

    const systemPrompt = `You are RoomMate, an expert interior design agent for Wayfair. Given a user's room profile and a product catalog, return ONLY valid JSON (no markdown) with ranked recommendations. Be specific, personal, and honest — including real caveats. Your job is to help the user make the best decision, not just sell them something.`

    const userMessage = `User profile:
- Room: ${answers.room}
- Style preference: ${answers.vibe}
- Budget: $${answers.budget}
- Constraints: ${answers.constraints?.length ? answers.constraints.join(', ') : 'none'}

Product catalog:
${JSON.stringify(CATALOG, null, 2)}

Return ONLY a JSON array of exactly 3 objects, ranked best to worst match. Each object:
{
  "productId": string,
  "whyThisProduct": "2 sentences, personalized to their room/style/budget/constraints",
  "prosForYou": ["bullet 1 tailored to their needs", "bullet 2", "bullet 3"],
  "watchOut": "1 honest caveat specific to this user",
  "reviewSummary": "synthesized summary from the mock reviews",
  "matchScore": number 0-100
}

Only recommend products at or under $${answers.budget}. Rank by how well they match the user's specific room, style, constraints, and budget.`

    try {
      const raw = await callClaude(systemPrompt, userMessage)
      const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const start = clean.indexOf('[')
      const end = clean.lastIndexOf(']') + 1
      const jsonStr = start >= 0 ? clean.slice(start, end) : clean
      const parsed = JSON.parse(jsonStr)
      setRecs(parsed)
      setStep(3)
    } catch (e) {
      setError(e.message)
      setStep(1)
    }
  }

  const handleReset = () => {
    setStep(1)
    setProfile(null)
    setRecs(null)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0fdfa 100%)' }}>
      <header style={{
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #14b8a6, #1a3557)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 15,
            }}>R</div>
            <span style={{ fontWeight: 700, color: '#1a3557', fontSize: 18, letterSpacing: '-0.3px' }}>RoomMate AI</span>
            <span style={{ fontSize: 11, background: '#f0fdfa', color: '#0d9488', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>BETA</span>
          </div>
          {step === 3 && (
            <button
              onClick={handleReset}
              style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ← Start over
            </button>
          )}
        </div>
      </header>

      <main style={{ paddingTop: 32 }}>
        {step !== 2 && <StepIndicator step={step} />}

        {error && (
          <div style={{ maxWidth: 520, margin: '0 auto 24px', padding: '0 16px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 16px', fontSize: 14, color: '#dc2626' }}>
              <strong>Something went wrong:</strong> {error}
              <br /><span style={{ fontSize: 12, color: '#ef4444' }}>Check your API key or try again.</span>
            </div>
          </div>
        )}

        {!hasKey && step === 1 && (
          <>
            <div style={{ textAlign: 'center', padding: '0 16px', marginBottom: 8 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a3557', letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 10 }}>
                Find your perfect<br />furniture match
              </h1>
              <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 360, margin: '0 auto' }}>
                AI-powered recommendations tailored to your room, style &amp; budget.
              </p>
            </div>
            <ApiKeyInput onSubmit={handleApiKey} />
          </>
        )}

        {hasKey && step === 1 && (
          <div>
            <div style={{ textAlign: 'center', padding: '0 16px', marginBottom: 28 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1a3557', letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 8 }}>
                Find your perfect furniture
              </h1>
              <p style={{ color: '#6b7280', fontSize: 15 }}>4 quick questions. Personalized AI matches.</p>
            </div>
            <StyleQuiz onComplete={handleQuizComplete} />
          </div>
        )}

        {step === 2 && <LoadingScreen />}

        {step === 3 && recs && <ResultsPage profile={profile} recs={recs} onReset={handleReset} />}
      </main>
    </div>
  )
}
