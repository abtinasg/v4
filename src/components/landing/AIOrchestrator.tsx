'use client'

import { BrainCircuit, Workflow, Cpu, MessageSquare, Sparkles, ArrowRight, Check } from 'lucide-react'

const stages = [
  {
    icon: MessageSquare,
    title: 'Query Analysis',
    description: 'Natural language understanding and intent extraction',
    color: '#5B7CFF'
  },
  {
    icon: Workflow,
    title: 'Model Routing',
    description: 'Intelligent dispatch to specialized AI models',
    color: '#00C9E4'
  },
  {
    icon: Cpu,
    title: 'Parallel Processing',
    description: 'Multi-model inference with consensus building',
    color: '#8B5CF6'
  },
  {
    icon: Sparkles,
    title: 'Response Synthesis',
    description: 'Unified insights with confidence scoring',
    color: '#22C55E'
  }
]

const models = [
  { name: 'Reasoning Model', specialty: 'Logical analysis', color: '#5B7CFF' },
  { name: 'Analysis Model', specialty: 'Data processing', color: '#00C9E4' },
  { name: 'Markets Model', specialty: 'Market insights', color: '#8B5CF6' },
]

export function AIOrchestrator() {
  return (
    <section className="relative py-32 md:py-48 bg-[#030508] overflow-hidden">
      {/* 1. Ambient Background - Calm & Premium */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        {/* Soft, large blurs for atmosphere */}
        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#8B5CF6]/[0.03] blur-[180px]" />
        <div className="absolute top-1/3 right-[5%] w-[600px] h-[600px] rounded-full bg-[#00C9E4]/[0.02] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-center">
          
          {/* 2. Left: Content Hierarchy */}
          <div className="space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
              <BrainCircuit className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">AI Deep Dive</span>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1]">
                Multi-Model <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#00C9E4] to-[#5B7CFF]">
                  AI Orchestration
                </span>
              </h2>

              <p className="text-xl text-gray-400 font-light leading-relaxed max-w-lg">
                Our AI orchestrator routes your queries to specialized models, aggregates their insights,
                and delivers unified analysis with institutional-grade precision.
              </p>
            </div>

            {/* Model Badges */}
            <div className="flex flex-wrap gap-3">
              {models.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 backdrop-blur-sm transition-colors hover:bg-white/[0.04]"
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: model.color }} />
                  <span className="text-sm font-medium text-white">{model.name}</span>
                  <span className="text-xs text-gray-500 font-light border-l border-white/[0.1] pl-3">{model.specialty}</span>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="space-y-5 pt-4">
              {['Parallel model inference', 'Confidence-weighted consensus', 'Real-time market context', 'Continuous learning'].map((feature) => (
                <div key={feature} className="flex items-center gap-4 text-gray-400 group">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-600 group-hover:bg-[#8B5CF6] transition-colors" />
                  <span className="text-base font-light group-hover:text-gray-300 transition-colors">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Right: Premium Pipeline Visual */}
          <div className="relative perspective-[2000px]">
            {/* Glow behind card */}
            <div className="absolute -inset-12 bg-gradient-to-r from-[#8B5CF6]/10 via-[#00C9E4]/5 to-[#5B7CFF]/10 blur-3xl rounded-full opacity-60" />

            {/* Pipeline Card */}
            <div className="relative rounded-3xl border border-white/[0.08] bg-[#0A0F18]/80 backdrop-blur-xl p-10 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] transform rotate-y-[-2deg] transition-transform duration-700 hover:rotate-y-0">
              {/* Glass effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between mb-10">
                  <div className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500">
                    Orchestration Pipeline
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                  </div>
                </div>

                {/* Stages */}
                <div className="space-y-8">
                  {stages.map((stage, i) => (
                    <div key={stage.title} className="group relative">
                      <div className="flex items-start gap-6">
                        {/* Stage number & connector */}
                        <div className="flex flex-col items-center">
                          <div
                            className="h-14 w-14 rounded-2xl flex items-center justify-center border border-white/[0.08] bg-white/[0.02] transition-all duration-500 group-hover:scale-110 group-hover:border-white/[0.15]"
                            style={{
                              boxShadow: `0 0 30px ${stage.color}05`
                            }}
                          >
                            <stage.icon className="h-6 w-6 transition-colors duration-300" style={{ color: stage.color }} />
                          </div>
                          {i < stages.length - 1 && (
                            <div
                              className="w-px h-12 mt-4 bg-gradient-to-b from-white/[0.1] to-transparent"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest border border-white/[0.08] px-2 py-0.5 rounded-full">Stage 0{i + 1}</span>
                          </div>
                          <h4 className="text-xl font-medium text-white mb-1.5 tracking-tight">{stage.title}</h4>
                          <p className="text-sm text-gray-500 font-light leading-relaxed">{stage.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Status */}
                <div className="mt-10 pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                      <span className="text-xs font-medium text-[#22C55E]">System Active</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">Latency: <span className="text-white">1.2s</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
