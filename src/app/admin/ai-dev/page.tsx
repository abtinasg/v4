'use client'

import { useState, useEffect } from 'react'
import { 
  Bot, 
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Play,
  Code,
  Shield,
  Sparkles,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AiPrompt {
  id: string
  name: string
  category: string
  promptTemplate: string
  variables: string[] | null
  isActive: boolean
  version: string
  isDefault?: boolean
}

interface AiAccessControl {
  id: string
  subscriptionTier: string
  feature: string
  isEnabled: boolean
  monthlyLimit: string | null
  modelAccess: string[] | null
  isDefault?: boolean
}

export default function AiDevPage() {
  const [prompts, setPrompts] = useState<AiPrompt[]>([])
  const [accessControls, setAccessControls] = useState<AiAccessControl[]>([])
  const [models, setModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'prompts' | 'access'>('prompts')
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Partial<AiPrompt> | null>(null)
  const [editingAccess, setEditingAccess] = useState<Partial<AiAccessControl> | null>(null)
  const [testPrompt, setTestPrompt] = useState<AiPrompt | null>(null)
  const [testVariables, setTestVariables] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ai-dev')
      const data = await res.json()
      setPrompts(data.prompts || [])
      setAccessControls(data.accessControls || [])
      setModels(data.models || [])
    } catch (error) {
      console.error('Failed to fetch AI data:', error)
    }
    setLoading(false)
  }

  const handleInitializePrompts = async () => {
    try {
      await fetch('/api/admin/ai-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize_prompts' }),
      })
      fetchData()
    } catch (error) {
      console.error('Failed to initialize prompts:', error)
    }
  }

  const handleInitializeAccess = async () => {
    try {
      await fetch('/api/admin/ai-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize_access' }),
      })
      fetchData()
    } catch (error) {
      console.error('Failed to initialize access:', error)
    }
  }

  const handleTogglePrompt = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/ai-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_prompt', id, isActive }),
      })
      setPrompts(prompts.map(p => p.id === id ? {...p, isActive} : p))
    } catch (error) {
      console.error('Failed to toggle prompt:', error)
    }
  }

  const handleToggleAccess = async (id: string, isEnabled: boolean) => {
    try {
      await fetch('/api/admin/ai-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_access', id, isEnabled }),
      })
      setAccessControls(accessControls.map(a => a.id === id ? {...a, isEnabled} : a))
    } catch (error) {
      console.error('Failed to toggle access:', error)
    }
  }

  const handleSavePrompt = async () => {
    if (!editingPrompt) return

    try {
      await fetch('/api/admin/ai-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingPrompt.id ? 'update_prompt' : 'create_prompt',
          ...editingPrompt,
        }),
      })
      fetchData()
      setShowPromptModal(false)
      setEditingPrompt(null)
    } catch (error) {
      console.error('Failed to save prompt:', error)
    }
  }

  const handleSaveAccess = async () => {
    if (!editingAccess) return

    try {
      await fetch('/api/admin/ai-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_access',
          ...editingAccess,
        }),
      })
      fetchData()
      setShowAccessModal(false)
      setEditingAccess(null)
    } catch (error) {
      console.error('Failed to save access:', error)
    }
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Delete this prompt template?')) return

    try {
      await fetch(`/api/admin/ai-dev?type=prompt&id=${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const handleTestPrompt = async () => {
    if (!testPrompt) return
    
    setTestLoading(true)
    try {
      const res = await fetch('/api/admin/ai-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_prompt',
          promptId: testPrompt.id,
          variables: testVariables,
        }),
      })
      const data = await res.json()
      setTestResult(data.result || 'No result')
    } catch (error) {
      setTestResult('Test failed: ' + String(error))
    }
    setTestLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Group prompts by category
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    const key = prompt.category
    if (!acc[key]) acc[key] = []
    acc[key].push(prompt)
    return acc
  }, {} as Record<string, AiPrompt[]>)

  // Group access by tier
  const groupedAccess = accessControls.reduce((acc, control) => {
    const key = control.subscriptionTier
    if (!acc[key]) acc[key] = []
    acc[key].push(control)
    return acc
  }, {} as Record<string, AiAccessControl[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Dev Tools</h1>
          <p className="text-gray-400 text-sm mt-1">Manage AI prompts and feature access controls</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('prompts')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            activeTab === 'prompts' 
              ? "bg-cyan-500/20 text-cyan-400" 
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          <Code className="w-4 h-4" />
          Prompt Templates
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            activeTab === 'access' 
              ? "bg-cyan-500/20 text-cyan-400" 
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          )}
        >
          <Shield className="w-4 h-4" />
          Access Controls
        </button>
      </div>

      {/* Prompts Tab */}
      {activeTab === 'prompts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {prompts.length} prompt templates
            </p>
            <div className="flex gap-2">
              {prompts.some(p => p.isDefault) && (
                <Button onClick={handleInitializePrompts} variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Save Defaults
                </Button>
              )}
              <Button 
                size="sm"
                onClick={() => {
                  setEditingPrompt({
                    name: '',
                    category: 'general',
                    promptTemplate: '',
                    variables: [],
                    isActive: true,
                    version: '1.0',
                  })
                  setShowPromptModal(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prompt
              </Button>
            </div>
          </div>

          {Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
            <div 
              key={category}
              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">
                  {category}
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {categoryPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={cn(
                      "p-4 transition-all",
                      !prompt.isActive && "opacity-50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-medium">{prompt.name}</h3>
                        <p className="text-xs text-gray-500">v{prompt.version}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTestPrompt(prompt)
                            setTestVariables({})
                            setTestResult(null)
                            setShowTestModal(true)
                          }}
                          className="p-1.5 hover:bg-cyan-500/20 rounded"
                          title="Test Prompt"
                        >
                          <Play className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => handleTogglePrompt(prompt.id, !prompt.isActive)}
                          className="p-1 hover:bg-white/10 rounded"
                          disabled={prompt.isDefault}
                        >
                          {prompt.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {!prompt.isDefault && (
                          <>
                            <button
                              onClick={() => {
                                setEditingPrompt(prompt)
                                setShowPromptModal(true)
                              }}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeletePrompt(prompt.id)}
                              className="p-1 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 rounded-lg bg-black/30 font-mono text-xs text-gray-400 max-h-32 overflow-auto relative group">
                      <pre className="whitespace-pre-wrap">{prompt.promptTemplate.substring(0, 300)}...</pre>
                      <button
                        onClick={() => copyToClipboard(prompt.promptTemplate)}
                        className="absolute top-2 right-2 p-1 rounded bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                      </button>
                    </div>
                    
                    {prompt.variables && prompt.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prompt.variables.map((v) => (
                          <span key={v} className="px-2 py-0.5 text-xs rounded bg-violet-500/20 text-violet-400">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Access Controls Tab */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Configure AI feature access by subscription tier
            </p>
            {accessControls.some(a => a.isDefault) && (
              <Button onClick={handleInitializeAccess} variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Save Defaults
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {['free', 'premium', 'professional', 'enterprise'].map((tier) => {
              const tierControls = groupedAccess[tier] || []
              return (
                <div 
                  key={tier}
                  className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                >
                  <div className={cn(
                    "p-4 border-b border-white/10",
                    tier === 'free' && "bg-gray-500/10",
                    tier === 'premium' && "bg-cyan-500/10",
                    tier === 'professional' && "bg-violet-500/10",
                    tier === 'enterprise' && "bg-amber-500/10",
                  )}>
                    <span className={cn(
                      "text-sm font-medium uppercase tracking-wider",
                      tier === 'free' && "text-gray-400",
                      tier === 'premium' && "text-cyan-400",
                      tier === 'professional' && "text-violet-400",
                      tier === 'enterprise' && "text-amber-400",
                    )}>
                      {tier} Tier
                    </span>
                  </div>
                  <div className="p-4">
                    {tierControls.length === 0 ? (
                      <p className="text-sm text-gray-500">No access controls configured</p>
                    ) : (
                      <div className="grid gap-3">
                        {tierControls.map((control) => (
                          <div
                            key={control.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border transition-all",
                              control.isEnabled 
                                ? "border-white/10 bg-white/[0.02]" 
                                : "border-white/5 bg-white/[0.01] opacity-50"
                            )}
                          >
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{control.feature}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                {control.monthlyLimit && (
                                  <span>Limit: {control.monthlyLimit}/mo</span>
                                )}
                                {control.modelAccess && control.modelAccess.length > 0 && (
                                  <span>Models: {control.modelAccess.join(', ')}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAccess(control.id, !control.isEnabled)}
                                className="p-1 hover:bg-white/10 rounded"
                                disabled={control.isDefault}
                              >
                                {control.isEnabled ? (
                                  <ToggleRight className="w-5 h-5 text-green-400" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                                )}
                              </button>
                              {!control.isDefault && (
                                <button
                                  onClick={() => {
                                    setEditingAccess(control)
                                    setShowAccessModal(true)
                                  }}
                                  className="p-1 hover:bg-white/10 rounded"
                                >
                                  <Edit className="w-4 h-4 text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Prompt Edit Modal */}
      {showPromptModal && editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl bg-[#0a0d12] border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingPrompt.id ? 'Edit Prompt' : 'Create Prompt'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={editingPrompt.name || ''}
                    onChange={(e) => setEditingPrompt({...editingPrompt, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Category</label>
                  <select
                    value={editingPrompt.category || ''}
                    onChange={(e) => setEditingPrompt({...editingPrompt, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="general">General</option>
                    <option value="analysis">Analysis</option>
                    <option value="recommendations">Recommendations</option>
                    <option value="chat">Chat</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Prompt Template</label>
                <textarea
                  value={editingPrompt.promptTemplate || ''}
                  onChange={(e) => setEditingPrompt({...editingPrompt, promptTemplate: e.target.value})}
                  rows={10}
                  placeholder="Enter prompt template. Use {{variable}} for variables."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Variables (comma separated)</label>
                <input
                  type="text"
                  value={(editingPrompt.variables || []).join(', ')}
                  onChange={(e) => setEditingPrompt({
                    ...editingPrompt, 
                    variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., symbol, timeframe, context"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Version</label>
                  <input
                    type="text"
                    value={editingPrompt.version || '1.0'}
                    onChange={(e) => setEditingPrompt({...editingPrompt, version: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={editingPrompt.isActive ?? true}
                      onChange={(e) => setEditingPrompt({...editingPrompt, isActive: e.target.checked})}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowPromptModal(false)
                  setEditingPrompt(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSavePrompt}
                disabled={!editingPrompt.name || !editingPrompt.promptTemplate}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Access Edit Modal */}
      {showAccessModal && editingAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-[#0a0d12] border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Edit Access Control
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Feature</label>
                <input
                  type="text"
                  value={editingAccess.feature || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Monthly Limit</label>
                <input
                  type="number"
                  value={editingAccess.monthlyLimit || ''}
                  onChange={(e) => setEditingAccess({...editingAccess, monthlyLimit: e.target.value || null})}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Model Access</label>
                <div className="space-y-2">
                  {models.map((model) => (
                    <label key={model} className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={(editingAccess.modelAccess || []).includes(model)}
                        onChange={(e) => {
                          const current = editingAccess.modelAccess || []
                          const updated = e.target.checked 
                            ? [...current, model]
                            : current.filter(m => m !== model)
                          setEditingAccess({...editingAccess, modelAccess: updated})
                        }}
                        className="rounded"
                      />
                      {model}
                    </label>
                  ))}
                </div>
              </div>
              
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={editingAccess.isEnabled ?? true}
                  onChange={(e) => setEditingAccess({...editingAccess, isEnabled: e.target.checked})}
                  className="rounded"
                />
                Enabled
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowAccessModal(false)
                  setEditingAccess(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSaveAccess}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Prompt Modal */}
      {showTestModal && testPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl bg-[#0a0d12] border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Test Prompt: {testPrompt.name}
            </h3>
            
            {testPrompt.variables && testPrompt.variables.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-400">Fill in variables:</p>
                {testPrompt.variables.map((v) => (
                  <div key={v}>
                    <label className="text-sm text-gray-400 block mb-1">{v}</label>
                    <input
                      type="text"
                      value={testVariables[v] || ''}
                      onChange={(e) => setTestVariables({...testVariables, [v]: e.target.value})}
                      placeholder={`Enter ${v}`}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="p-4 rounded-lg bg-black/30 mb-4">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {Object.entries(testVariables).reduce(
                  (text, [key, value]) => text.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`),
                  testPrompt.promptTemplate
                )}
              </pre>
            </div>
            
            {testResult && (
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-4">
                <p className="text-xs text-cyan-400 mb-2">Result:</p>
                <p className="text-sm text-white">{testResult}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowTestModal(false)
                  setTestPrompt(null)
                  setTestResult(null)
                }}
              >
                Close
              </Button>
              <Button 
                className="flex-1"
                onClick={handleTestPrompt}
                disabled={testLoading}
              >
                {testLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
