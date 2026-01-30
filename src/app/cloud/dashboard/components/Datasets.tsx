'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, FlaskConical, Plus, FileText, Download, Trash2, Database, Table, BarChart, QrCode } from 'lucide-react'

// Redefine interface to match ReferenceLibrary (could be shared)
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
    rowCount?: number
    colCount?: number
    format?: string
    description?: string
  }
}

interface DatasetsProps {
  files: CloudFile[]
  workspaceId: string
  onUpload: () => void
  onDelete: (fileId: string) => void
}

export default function Datasets({ files, workspaceId, onUpload, onDelete }: DatasetsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [scanningFile, setScanningFile] = useState<CloudFile | null>(null)

  // Filter for datasets
  const datasets = files.filter(f => f.fileType === 'dataset' || 
                                     f.name.endsWith('.csv') || 
                                     f.name.endsWith('.json') || 
                                     f.name.endsWith('.xlsx') ||
                                     f.name.endsWith('.parquet'))
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Research Datasets</h2>
          <p className="text-slate-500 text-sm">Manage data files, corpora, and experimental results</p>
        </div>
        <button 
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 hover:bg-teal-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Upload Dataset
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search datasets..." 
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Datasets Grid */}
      <div className="flex-1 overflow-y-auto">
        {datasets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => window.open(dataset.uploadthingUrl, '_blank')}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setScanningFile(dataset)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Share via QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(dataset.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg mb-2 truncate" title={dataset.name}>{dataset.name}</h3>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {dataset.name.split('.').pop()?.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart className="w-3 h-3" />
                    {formatSize(dataset.size)}
                  </span>
                  {dataset.metadata?.rowCount && (
                     <span className="flex items-center gap-1">
                        <Table className="w-3 h-3" />
                        {dataset.metadata.rowCount.toLocaleString()} rows
                     </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {dataset.uploaderEmail?.[0].toUpperCase() || 'U'}
                         </div>
                         <span className="text-xs text-slate-400">Uploaded {new Date(dataset.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
            <FlaskConical className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No datasets found</p>
            <button 
              onClick={onUpload}
              className="mt-4 px-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors"
            >
              Upload Dataset
            </button>
          </div>
        )}
      </div>

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
              <p className="text-sm text-slate-500">Scan this code with your mobile camera to download the file directly to your device.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
