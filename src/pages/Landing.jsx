import { motion } from "framer-motion"
import { Lock, Shield, Trophy } from "lucide-react"
import { PageTransition } from "@/components/shared/PageTransition"
import { AuctionCard } from "@/components/auction/AuctionCard"

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const reveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function Landing() {
  return (
    <PageTransition className="w-full">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-32 px-6 max-w-7xl mx-auto min-h-[calc(100vh-160px)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--violet-900)_0%,_transparent_70%)] opacity-20 pointer-events-none"></div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-default bg-bg-surface mb-8">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="text-xs text-text-muted font-medium tracking-wide">Built on Solana ✦ ZK Powered</span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-display text-center mb-6 max-w-4xl font-bold">
          The First <span className="relative inline-block text-white">
            Front-Run Proof
            <span className="absolute bottom-2 left-0 w-full h-[4px] bg-violet-500 rounded-full"></span>
          </span> Token Launch
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-text-secondary text-center max-w-2xl mb-12 leading-relaxed">
          Sealed bids. ZK proofs. Mathematical fairness. <br/>
          No one sees your bid — not even us.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex gap-4 mb-20">
          <a href="#live" className="px-7 py-3.5 bg-gradient-to-br from-[#7C5CBF] to-[#4A3A8A] text-white rounded-xl shadow-[0_0_24px_rgba(124,92,191,0.25)] hover:shadow-[0_0_32px_rgba(124,92,191,0.4)] transition-all font-medium">
            View Live Auctions →
          </a>
          <a href="#how-it-works" className="px-7 py-3.5 bg-transparent border border-border-default text-text-primary rounded-xl hover:bg-bg-surface transition-all font-medium">
            How it works ↓
          </a>
        </motion.div>

        <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col md:flex-row gap-8 md:gap-16 text-center divide-y md:divide-y-0 md:divide-x divide-border-default border border-border-default rounded-2xl bg-bg-surface/50 p-6 max-w-4xl w-full">
          {[
            { value: "$2B+", label: "MEV prevented annually" },
            { value: "0", label: "bids front-run" },
            { value: "100%", label: "Mathematically impossible" }
          ].map((stat, i) => (
            <motion.div variants={reveal} key={i} className="flex-1 pt-4 md:pt-0 first:pt-0">
              <div className="font-mono text-3xl font-bold text-text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-h2 text-center mb-16">How It Works</h2>
        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-px border-t border-dashed border-border-subtle z-0"></div>
          
          {[
            { step: "01", icon: Lock, title: "Lock Your Bid", desc: "Enter amount. Bid is hashed and locked on-chain." },
            { step: "02", icon: Shield, title: "Auction Runs", desc: "60 seconds. All bids sealed. Bots see absolutely nothing." },
            { step: "03", icon: Trophy, title: "Winner Revealed", desc: "Highest sealed bid wins. Zero knowledge proof verified." }
          ].map((item, i) => (
            <motion.div variants={reveal} key={i} className="bg-bg-surface border border-border-subtle p-8 rounded-2xl relative z-10">
              <div className="flex justify-between items-start mb-6">
                <span className="font-mono text-4xl text-border-strong font-bold">{item.step}</span>
                <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border-default flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-violet-400" />
                </div>
              </div>
              <h3 className="text-h3 mb-2">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Live Auctions Preview */}
      <section id="live" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-h2 mb-2">Live Auctions</h2>
            <p className="text-text-muted">Bid on the most highly anticipated tokens securely.</p>
          </div>
          <a href="/dashboard" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
            View All →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
           <AuctionCard id="1" name="PhantomToken" symbol="$PHNTM" reserve="100.00" time="00:45" bids="21" isLive={true} />
           <AuctionCard id="2" name="ZeroCoin" symbol="$ZERO" reserve="50.00" time="02:15" bids="14" isLive={true} />
           <AuctionCard id="3" name="Eclipse" symbol="$ECL" reserve="500.00" time="14:00" bids="5" isLive={true} />
        </div>
      </section>
    </PageTransition>
  )
}
