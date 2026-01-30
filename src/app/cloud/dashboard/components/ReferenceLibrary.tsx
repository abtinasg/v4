'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Plus, FileText, BookOpen, Quote, Download, Trash2, Edit3, ExternalLink, QrCode } from 'lucide-react'

interface CloudFile {
  id: string
  name: string
  fileType: string
  size: number
  uploadthingUrl: string
  uploaderEmail?: string
  createdAt: string
  updatedAt: string
  metadata?: {
    authors?: string[]
    doi?: string
    journal?: string
    year?: number
    keywords?: string[]
    abstract?: string
    citations?: number
  }
}

interface ReferenceLibraryProps {
  files: CloudFile[]
  workspaceId: string
  onUpload: () => void
  onDelete: (fileId: string) => void
}

export default function ReferenceLibrary({ files, workspaceId, onUpload, onDelete }: ReferenceLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [scanningFile, setScanningFile] = useState<CloudFile | null>(null)
  const [selectedRef, setSelectedRef] = useState<CloudFile | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRef, setNewRef] = useState({
    title: '',
    authors: '',
    year: new Date().getFullYear(),
    journal: '',
    doi: ''
  })

  // Filter for references only
  const references = files.filter(f => f.fileType === 'reference' || f.fileType === 'paper')
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 f.metadata?.authors?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                 f.metadata?.journal?.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleAddReference = async () => {
    // This would ideally call an API to create a reference-only file entry (metadata only)
    // For now, we'll alert as this requires backend implementation for metadata-only files
    alert("Metadata-only reference creation to be implemented. Please upload a PDF/BibTeX file for now.")
    setShowAddModal(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reference Library</h2>
          <p className="text-slate-500 text-sm">Manage citations, papers, and bibliography</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Reference
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, DOI..." 
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <select className="h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
          <option>Sort by: Newest</option>
          <option>Sort by: Title</option>
          <option>Sort by: Year</option>
          <option>Sort by: Highly Cited</option>
        </select>
      </div>

      {/* Reference List */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        {references.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {references.map((ref) => (
              <div key={ref.id} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedRef(ref)}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                        {ref.metadata?.journal || 'Journal Paper'}
                      </span>
                      {ref.metadata?.year && (
                        <span className="text-xs text-slate-400 font-medium">{ref.metadata.year}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-base leading-snug mb-1">{ref.name}</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      {ref.metadata?.authors?.join(', ') || 'Unknown Authors'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {ref.metadata?.citations !== undefined && (
                        <span className="flex items-center gap-1">
                          <Quote className="w-3 h-3" />
                          {ref.metadata.citations} Citations
                        </span>
                      )}
                      {ref.metadata?.doi && (
                        <span className="flex items-center gap-1 hover:text-indigo-600 hover:underline" onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://doi.org/${ref.metadata?.doi}`, '_blank');
                        }}>
                          <ExternalLink className="w-3 h-3" />
                          {ref.metadata.doi}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={(e) => { e.stopPropagation(); window.open(ref.uploadthingUrl, '_blank') }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setScanningFile(ref) }}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                        title="Share via QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(ref.id) }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <BookOpen className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No references found</p>
            <p className="text-xs text-slate-400 mt-1">Add papers or citations to build your library</p>
            <button 
              onClick={onUpload}
              className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              Upload Papers
            </button>
          </div>
        )}
      </div>

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add Reference Manually</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Paper title"
                  value={newRef.title}
                  onChange={e => setNewRef({...newRef, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Authors</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Comma separated"
                  value={newRef.authors}
                  onChange={e => setNewRef({...newRef, authors: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Journal/Conference</label>
                    <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Nature"
                    value={newRef.journal}
                    onChange={e => setNewRef({...newRef, journal: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                    <input 
                    type="number" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="2024"
                    value={newRef.year}
                    onChange={e => setNewRef({...newRef, year: parseInt(e.target.value)})}
                    />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddReference}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Save Reference
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={!!scanningFile} onOpenChange={() => setScanningFile(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan to Download</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              {scanningFile && (
                <QRCodeSVG 
                  value={scanningFile.uploadthingUrl} 
                  size={200}
                  level="H"
                  includeMargin
                />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-slate-900">{scanningFile?.name}</p>
              <p className="text-sm text-slate-500">Scan this code with your mobile camera to download the file.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
