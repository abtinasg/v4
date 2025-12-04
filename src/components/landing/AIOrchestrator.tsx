'use client'

import { BrainCircuit, Workflow, Cpu, MessageSquare, Sparkles, ArrowRight, Check } from 'lucide-react'

const stages = [
  {
    icon: MessageSquare,
    title: 'Query Analysis',
    description: 'Natural language understanding and intent extraction',
    color: '#00D4FF'
  },
  {
    icon: Workflow,
    title: 'Model Routing',
    description: 'Intelligent dispatch to specialized AI models',
    color: '#3B82F6'
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
    color: '#2DD4BF'
  }
]

const models = [
  { name: 'Deepin AI', specialty: 'Reasoning' },
  { name: 'Deepin AI', specialty: 'Analysis' },
  { name: 'Deepin AI', specialty: 'Markets' },
]

export function AIOrchestrator() {
  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/[0.05] blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#00D4FF]/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] px-4 py-1.5 text-xs font-medium text-[#8B5CF6] mb-6">
              <BrainCircuit className="h-3.5 w-3.5" />
              AI Deepin Dive
            </div>

            <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-6">
              Multi-Model{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF]">
                Orchestration
              </span>
            </h2>

            <p className="text-subhead text-lg text-gray-400 mb-8 max-w-lg">
              Our AI orchestrator routes your queries to specialized models, aggregates their insights, 
              and delivers unified analysis with institutional-grade precision.
            </p>

            {/* Model badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {models.map((model) => (
                <div key={model.name} className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                  <Check className="h-3.5 w-3.5 text-[#22C55E]" />
                  <span className="text-sm text-white font-medium">{model.name}</span>
                  <span className="text-xs text-gray-500">• {model.specialty}</span>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div className="space-y-4">
              {['Parallel model inference', 'Confidence-weighted consensus', 'Real-time market context'].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-gray-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Pipeline Visual */}
          <div
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-8 bg-gradient-to-r from-[#8B5CF6]/10 to-[#00D4FF]/10 blur-3xl rounded-full opacity-50" />

            {/* Pipeline card */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0D12]/80 backdrop-blur-xl p-8 overflow-hidden">
              {/* Glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

              <div className="relative">
                <div className="text-label text-[#8B5CF6] mb-6">ORCHESTRATION PIPELINE</div>

                {/* Stages */}
                <div className="space-y-4">
                  {stages.map((stage, i) => (
                    <div
                      key={stage.title}
                      className="group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Stage number & connector */}
                        <div className="flex flex-col items-center">
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                            style={{ 
                              background: `linear-gradient(135deg, ${stage.color}25, ${stage.color}10)`,
                              boxShadow: `0 0 20px ${stage.color}15`
                            }}
                          >
                            <stage.icon className="h-5 w-5" style={{ color: stage.color }} />
                          </div>
                          {i < stages.length - 1 && (
                            <div className="w-px h-8 bg-gradient-to-b from-white/10 to-transparent mt-2" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500">STAGE {i + 1}</span>
                            <ArrowRight className="h-3 w-3 text-gray-600" />
                          </div>
                          <h4 className="text-white font-semibold mb-1">{stage.title}</h4>
                          <p className="text-xs text-gray-500">{stage.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom status */}
                <div
                  className="mt-8 pt-6 border-t border-white/[0.05]"
                >
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
