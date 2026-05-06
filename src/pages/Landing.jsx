import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { LockKeyhole, ShieldCheck, Trophy, Clock, Wallet, Key, AlertTriangle, X, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageTransition } from '@/components/shared/PageTransition'
import { AuctionCard } from '@/components/auction/AuctionCard'
import { BlackHoleCanvas } from '@/components/shared/BlackHoleCanvas'
import { ROUTES } from '@/lib/constants'

/* ── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target, duration = 2000, format) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    let start = null
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ''))
    const raf = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * numeric))
      if (progress < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [inView, target, duration])

  const display = format ? format(value) : value
  return [ref, display]
}

/* ── Scroll-in wrapper ─────────────────────────────────────── */
function ScrollReveal({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const dirs = { up: [0, 32], left: [-48, 0], right: [48, 0] }
  const [x, y] = dirs[direction] || dirs.up

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Data ──────────────────────────────────────────────────── */
const features = [
  {
    icon: EyeOff,
    title: 'Absolute Secrecy',
    desc: 'Bids remain cryptographically hidden until the reveal phase. Front-running is mathematically impossible.',
    colSpan: 'md:col-span-2'
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Knowledge Proofs',
    desc: 'Verify bid validity on-chain without exposing any underlying transaction data.',
    colSpan: 'md:col-span-1'
  },
  {
    icon: Scale,
    title: 'Mathematical Fairness',
    desc: 'Winner selection is guaranteed by cryptography, eliminating trust from the equation completely.',
    colSpan: 'md:col-span-1'
  },
  {
    icon: Cpu,
    title: '100% On-Chain',
    desc: 'A fully decentralized protocol. No off-chain dependencies, no trusted third parties.',
    colSpan: 'md:col-span-1'
  },
  {
    icon: Fingerprint,
    title: 'Privacy by Default',
    desc: 'Your identity, wallet footprint, and bidding strategies are protected at the protocol level.',
    colSpan: 'md:col-span-1'
  }
]

const steps = [
  { icon: Wallet,    n: '01', title: 'Connect Wallet',    desc: 'Link your Phantom wallet in one click. Your identity stays private.' },
  { icon: LockKeyhole, n: '02', title: 'Seal Your Bid',  desc: 'Enter amount + auto-generated secret. Bid is hashed and locked on-chain.' },
  { icon: Clock,     n: '03', title: 'Timer Counts Down', desc: '60 seconds. All bids sealed. Bots see absolutely nothing.' },
  { icon: Key,       n: '04', title: 'Reveal Phase',      desc: 'Prove your bid with your secret key. ZK proof verified on-chain.' },
  { icon: Trophy,    n: '05', title: 'Winner Claims',     desc: 'Highest bid wins. Losers get automatic refunds. All math-guaranteed.' },
]

const stats = [
  { label: 'Stolen By Bots Annually', raw: '2', prefix: '$', suffix: 'B+' },
  { label: 'Front-Running Guarantee', raw: '0', prefix: '', suffix: 'ms' },
  { label: 'On-Chain Cryptographic',  raw: '100', prefix: '', suffix: '%' },
]

const demoAuctions = [
  { id: '1', name: 'PhantomToken', symbol: '$PHNTM', reserve: '100.00', endTimestamp: Date.now() + 45000, bids: '21', status: 'Live' },
  { id: '2', name: 'ZeroCoin',     symbol: '$ZERO',  reserve: '50.00',  endTimestamp: Date.now() + 135000, bids: '14', status: 'Live' },
  { id: '3', name: 'Eclipse',      symbol: '$ECL',   reserve: '500.00', endTimestamp: Date.now() + 14 * 3600000, bids: '5',  status: 'Live' },
]

function StatCard({ s, i }) {
  const [ref, val] = useCountUp(s.raw)
  return (
    <ScrollReveal delay={i * 0.12}>
      <div
        ref={ref}
        className="p-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center
          hover:border-[var(--violet-500)] hover:shadow-glow-v transition-all duration-300"
      >
        <div className="font-display text-5xl font-bold text-white mb-2">
          {s.prefix}{val}{s.suffix}
        </div>
        <div className="text-sm text-[var(--text-muted)] uppercase tracking-wider">{s.label}</div>
      </div>
    </ScrollReveal>
  )
}

/* ── Landing ───────────────────────────────────────────────── */
export default function Landing() {
  // Scroll indicator fade
  const [showScroll, setShowScroll] = useState(true)
  useEffect(() => {
    const h = () => setShowScroll(window.scrollY < 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <PageTransition className="w-full">

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-6">
        {/* Canvas background */}
        <BlackHoleCanvas />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">

          {/* Lock icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative inline-flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-[rgba(124,58,237,0.15)]" />
              <LockKeyhole
                className="text-[var(--violet-400)]"
                style={{ width: 40, height: 40 }}
              />
            </div>
          </motion.div>

          {/* Logo word */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-2"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-[var(--violet-400)] font-semibold">
              DARKBID PROTOCOL
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-display mb-6"
          >
            Bids So Secret,<br />
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#06FFA5] bg-clip-text text-transparent">
              Even Bots Go Blind.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.35 }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl leading-relaxed"
          >
            Zero-knowledge sealed auctions on Solana.
            Fair launch, guaranteed by math — not promises.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to={ROUTES.DASHBOARD}
              className="relative px-8 py-4 bg-[var(--violet-500)] text-white font-bold rounded-xl text-base overflow-hidden group
                shadow-[0_0_32px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]
                transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="relative z-10">🚀 Launch App</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#9C4FFF] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-transparent border border-[var(--border-default)] text-white font-medium rounded-xl
                hover:bg-[var(--bg-surface)] hover:border-[var(--violet-500)] transition-all duration-300 text-base"
            >
              How it works ↓
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ opacity: showScroll ? 1 : 0, y: showScroll ? 0 : 8 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-[var(--text-muted)] tracking-widest uppercase">scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-px h-10 bg-gradient-to-b from-[var(--violet-400)] to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — THE PROTOCOL
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs tracking-[0.25em] uppercase text-[var(--violet-400)] font-semibold mb-3 block">DarkBid Protocol</span>
          <h2 className="text-h2">Fair Launches, Guaranteed by Math</h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-2xl mx-auto text-lg">
            We've eliminated the trusted third party. DarkBid uses zero-knowledge cryptography to ensure every auction is provably fair and completely blind to bots.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className={f.colSpan}>
              <div className="h-full p-8 md:p-10 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col group hover:border-[var(--violet-500)]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--violet-500)]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--violet-500)]/15 transition-colors duration-500 pointer-events-none" />
                
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-default)] group-hover:border-[var(--violet-500)]/30 group-hover:bg-[var(--violet-500)]/10 transition-colors duration-300 mb-8 relative z-10">
                  <f.icon className="w-7 h-7 text-[var(--violet-400)] group-hover:text-[var(--violet-300)] transition-colors" />
                </div>
                
                <h3 className="text-2xl font-display font-bold text-white mb-3 relative z-10">{f.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed relative z-10">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--bg-surface)]">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs tracking-[0.25em] uppercase text-[var(--violet-400)] font-semibold mb-3 block">The Process</span>
            <h2 className="text-h2">How DarkBid Works</h2>
            <p className="text-[var(--text-secondary)] mt-3 max-w-xl mx-auto">
              Five steps from wallet to winner — every step cryptographically verified.
            </p>
          </ScrollReveal>

          {/* Steps grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-[var(--border-default)] via-[var(--violet-500)] to-[var(--border-default)]"
                style={{ transformOrigin: 'left' }}
              />
            </div>

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22,1,0.36,1] }}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-[var(--border-subtle)]
                  bg-[var(--bg-elevated)] hover:border-[var(--violet-500)] hover:shadow-[0_4px_16px_rgba(124,58,237,0.15)] transition-all duration-300 group"
              >
                {/* Icon */}
                <div className="relative mb-4 w-16 h-16 flex items-center justify-center rounded-xl
                  bg-[rgba(124,58,237,0.1)]
                  border border-[rgba(124,58,237,0.25)] transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-[var(--violet-400)]" />
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)] mb-1">{step.n}</span>
                <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <StatCard key={i} s={s} i={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5 — LIVE AUCTIONS PREVIEW
      ═══════════════════════════════════════════════════════ */}
      <section id="live" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <ScrollReveal>
            <span className="text-xs tracking-[0.25em] uppercase text-[var(--violet-400)] font-semibold mb-2 block">Live Now</span>
            <h2 className="text-h2 mb-2">Active Auctions</h2>
            <p className="text-[var(--text-muted)]">Bid on the most anticipated tokens securely.</p>
          </ScrollReveal>
          <Link
            to={ROUTES.DASHBOARD}
            className="text-[var(--violet-400)] font-medium hover:text-[var(--violet-200)] transition-colors text-sm"
          >
            View All →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {demoAuctions.map((a, i) => (
            <ScrollReveal key={a.id} delay={i * 0.1}>
              <AuctionCard {...a} isLive />
            </ScrollReveal>
          ))}
        </div>
      </section>

    </PageTransition>
  )
}
