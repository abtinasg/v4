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
    <section className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-1/2 left-[20%] -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/[0.06] blur-[160px]" />
        <div className="absolute top-1/3 right-[10%] w-[400px] h-[400px] rounded-full bg-[#00C9E4]/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: Content */}
          <div className="space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] px-5 py-2 text-sm font-medium text-[#8B5CF6]">
              <BrainCircuit className="h-4 w-4" />
              AI Deep Dive
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.1]">
                Multi-Model{' '}
                <span className="bg-gradient-to-r from-[#8B5CF6] via-[#00C9E4] to-[#5B7CFF] bg-clip-text text-transparent">
                  AI Orchestration
                </span>
              </h2>

              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                Our AI orchestrator routes your queries to specialized models, aggregates their insights,
                and delivers unified analysis with institutional-grade precision.
              </p>
            </div>

            {/* Model Badges */}
            <div className="flex flex-wrap gap-3">
              {models.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm"
                >
                  <Check className="h-4 w-4" style={{ color: model.color }} />
                  <span className="text-sm font-medium text-white">{model.name}</span>
                  <span className="text-xs text-gray-500">• {model.specialty}</span>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {['Parallel model inference', 'Confidence-weighted consensus', 'Real-time market context', 'Continuous learning'].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-[#8B5CF6]" style={{ boxShadow: '0 0 8px #8B5CF6' }} />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Pipeline Visual */}
          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute -inset-8 bg-gradient-to-r from-[#8B5CF6]/15 via-[#00C9E4]/10 to-[#5B7CFF]/15 blur-3xl rounded-full opacity-50" />

            {/* Pipeline Card */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0A0F18]/95 to-[#0A0F18]/80 backdrop-blur-xl p-8 overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              {/* Glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

              <div className="relative">
                <div className="text-xs font-medium uppercase tracking-[0.1em] text-[#8B5CF6] mb-8">
                  Orchestration Pipeline
                </div>

                {/* Stages */}
                <div className="space-y-5">
                  {stages.map((stage, i) => (
                    <div key={stage.title} className="group">
                      <div className="flex items-start gap-5">
                        {/* Stage number & connector */}
                        <div className="flex flex-col items-center">
                          <div
                            className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: `linear-gradient(135deg, ${stage.color}30, ${stage.color}10)`,
                              boxShadow: `0 0 25px ${stage.color}20`
                            }}
                          >
                            <stage.icon className="h-5 w-5" style={{ color: stage.color }} />
                          </div>
                          {i < stages.length - 1 && (
                            <div
                              className="w-px h-10 mt-2"
                              style={{ background: `linear-gradient(to bottom, ${stage.color}40, transparent)` }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stage {i + 1}</span>
                            <ArrowRight className="h-3 w-3 text-gray-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-1">{stage.title}</h4>
                          <p className="text-sm text-gray-500">{stage.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Status */}
                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                      <span className="text-xs text-gray-500">Pipeline Active</span>
                    </div>
                    <div className="text-xs text-gray-600">Avg. latency: 1.2s</div>
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
