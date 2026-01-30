'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, 
  Bell, 
  Filter, 
  LayoutGrid, 
  FileText, 
  Star, 
  Clock, 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  FileCheck, 
  Settings, 
  LogOut,
  FolderOpen,
  MoreVertical,
  Plus,
  PlayCircle,
  MoreHorizontal,
  BookOpen,    // Added for Research
  Users,       // Added for Research
  PenTool,     // Added for Research
  Library,     // Added for Research
  FlaskConical,// Added for Research
  Quote,       // Added for Research
  History,     // Added for Research
  ChevronDown, // Added for Workspace
  Share2,      // Added for Workspace
  Upload,
  Loader2,
  X
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { UserButton, useUser } from '@clerk/nextjs'
import { UploadDropzone } from '@/lib/uploadthing'

interface Workspace {
  id: string
  name: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  memberCount: number
  storageUsed: number
  description?: string
}

interface CloudFile {
  id: string
  name: string
  fileType: string
  size: number
  uploadthingUrl: string
  uploaderEmail?: string
  createdAt: string
  updatedAt: string
}

export default function CloudDashboard() {
  const { user, isLoaded: isUserLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('Research Hub')
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false)
  const [files, setFiles] = useState<CloudFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor')
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch('/api/cloud/workspaces')
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(data.workspaces)
        if (data.workspaces.length > 0 && !currentWorkspace) {
          setCurrentWorkspace(data.workspaces[0])
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    }
  }, [currentWorkspace])

  // Fetch files for current workspace
  const fetchFiles = useCallback(async () => {
    if (!currentWorkspace) return
    try {
      const res = await fetch(`/api/cloud/workspaces/${currentWorkspace.id}/files`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }, [currentWorkspace])

  useEffect(() => {
    if (isUserLoaded && user) {
      fetchWorkspaces().finally(() => setIsLoading(false))
    }
  }, [isUserLoaded, user, fetchWorkspaces])

  useEffect(() => {
    if (currentWorkspace) {
      fetchFiles()
    }
  }, [currentWorkspace, fetchFiles])

  // Create new workspace
  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    setIsCreatingWorkspace(true)
    try {
      const res = await fetch('/api/cloud/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName }),
      })
      if (res.ok) {
        const data = await res.json()
        setWorkspaces(prev => [{ ...data.workspace, role: 'owner', memberCount: 1 }, ...prev])
        setCurrentWorkspace({ ...data.workspace, role: 'owner', memberCount: 1 })
        setNewWorkspaceName('')
        setShowNewWorkspaceModal(false)
      }
    } catch (error) {
      console.error('Error creating workspace:', error)
    } finally {
      setIsCreatingWorkspace(false)
    }
  }

  // Invite member
  const inviteMember = async () => {
    if (!inviteEmail.trim() || !currentWorkspace) return
    try {
      const res = await fetch(`/api/cloud/workspaces/${currentWorkspace.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      if (res.ok) {
        setInviteEmail('')
        setShowShareModal(false)
        fetchWorkspaces()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to invite member')
      }
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  // Sidebar Menu Items - Optimized for Research Teams
  const menuItems = [
    { icon: LayoutGrid, label: 'Research Hub' },      // Renamed from Dashboard
    { icon: BookOpen, label: 'My Papers' },           // New
    { icon: Users, label: 'Team Collaboration' },     // New
    { icon: Library, label: 'Reference Library' },    // New
    { icon: FlaskConical, label: 'Datasets' },        // New
    { icon: MessageSquare, label: 'Peer Reviews' },   // Renamed from Shared
    { icon: Clock, label: 'Recent Work' },            // Update
    { icon: History, label: 'Version History' },      // New
    { icon: FileCheck, label: 'Submissions' },        // New
  ]

  // Chart Data - Citations/Impact
  const chartData = [
    { name: 'JAN', value: 12, label: 'Citations' },
    { name: 'FEB', value: 18, label: 'Citations' },
    { name: 'MAR', value: 25, label: 'Citations' },
    { name: 'APR', value: 45, label: 'Citations' },
    { name: 'MAY', value: 38, label: 'Citations' },
    { name: 'JUN', value: 52, label: 'Citations' },
  ]

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* Logo / Workspace Switcher */}
          <div className="relative mb-8">
            <button 
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                  {currentWorkspace?.name?.charAt(0) || 'R'}
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-medium">Workspace</p>
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{currentWorkspace?.name || 'Select Workspace'}</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Workspace Dropdown */}
            {showWorkspaceMenu && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 border-b border-slate-50">
                  <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">My Researches</p>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspace(ws)
                        setShowWorkspaceMenu(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentWorkspace?.id === ws.id 
                          ? 'bg-indigo-50 text-indigo-700 font-medium' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      {currentWorkspace?.id === ws.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </button>
                  ))}
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowWorkspaceMenu(false)
                      setShowNewWorkspaceModal(true)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Workspace
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.label
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {activeTab === item.label && (
                   <div className="ml-auto w-1 h-1 bg-white rounded-full opacity-50" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Storage Info */}
        <div className="mt-8 px-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-slate-900">25.32 GB used</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">79% used - 6.64 GB free</span>
          <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full w-[79%] bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" />
          </div>
          
          <button className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
            Add More Space
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-50">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Papers, Citations, Authors..." 
                className="w-full h-11 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button 
               onClick={() => setShowUploadModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:shadow-emerald-300 transition-all"
             >
                <Upload className="w-4 h-4" />
                Upload File
             </button>
             <button 
               onClick={() => setShowShareModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all"
             >
                <Share2 className="w-4 h-4" />
                Share Workspace
             </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-2" />
             <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
             </button>
             <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden">
                   {user?.imageUrl ? (
                     <img src={user.imageUrl} alt="User" />
                   ) : (
                     <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                       {user?.firstName?.[0] || 'U'}
                     </div>
                   )}
                </div>
                <div className="hidden lg:block text-sm">
                   <p className="font-bold text-slate-900">{user?.fullName || 'Researcher'}</p>
                   <p className="text-slate-400 text-xs">{user?.primaryEmailAddress?.emailAddress || 'researcher@lab.edu'}</p>
                </div>
                <UserButton />
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
           {/* Top Folders - Research Categories */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Active Drafts', files: '3 papers', size: 'In Progress', color: 'bg-indigo-600', icon: 'bg-indigo-100 text-indigo-600', iconComp: PenTool },
                { label: 'Datasets', files: '12 sets', size: '4.2 GB', color: 'bg-teal-400', icon: 'bg-teal-50 text-teal-400', iconComp: FlaskConical },
                { label: 'References', files: '1,240 items', size: 'Zotero Sync', color: 'bg-orange-400', icon: 'bg-orange-50 text-orange-400', iconComp: BookOpen },
                { label: 'Published', files: '8 papers', size: 'Archive', color: 'bg-rose-400', icon: 'bg-rose-50 text-rose-400', iconComp: Star },
              ].map((folder) => (
                 <div key={folder.label} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 ${folder.icon} rounded-2xl flex items-center justify-center`}>
                          <folder.iconComp className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
                       </div>
                       <button className="text-slate-300 hover:text-slate-600">
                          <MoreVertical className="w-5 h-5" />
                       </button>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-4">{folder.label}</h3>
                    <div className="flex items-center justify-between text-xs font-semibold">
                       <span className="text-slate-400">{folder.files}</span>
                       <span className="text-slate-900">{folder.size}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                       <div className={`h-full w-1/2 ${folder.color} rounded-full opacity-80`} />
                    </div>
                 </div>
              ))}
           </div>

            {/* Quick Access - Latest Research Work */}
           <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Continue Working</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Latex/Paper Card */}
                 <div className="bg-white p-3 pb-4 rounded-3xl shadow-sm border border-slate-50 group cursor-pointer hover:shadow-md transition-all">
                    <div className="h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                       <div className="absolute inset-0 bg-indigo-50 flex items-center justify-center flex-col p-6">
                          <div className="text-[10px] text-slate-400 font-mono w-full mb-1">main.tex</div>
                          <div className="w-full h-2 bg-indigo-200 rounded-sm mb-2" />
                          <div className="w-full h-2 bg-slate-200 rounded-sm mb-2" />
                          <div className="w-3/4 h-2 bg-slate-200 rounded-sm mb-2" />
                          <div className="w-full h-2 bg-indigo-200 rounded-sm blur-[1px]" />
                       </div>
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          LaTeX
                       </div>
                       <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-white/50 px-2 py-1 rounded-md">
                         Just now
                       </div>
                    </div>
                    <div className="px-2">
                       <h4 className="font-bold text-slate-800 text-sm mb-1">Deep Learning in Finance.tex</h4>
                       <p className="text-xs text-slate-400">IEEE Access Template</p>
                    </div>
                 </div>

                 {/* Dataset/Analysis Card */}
                 <div className="bg-white p-3 pb-4 rounded-3xl shadow-sm border border-slate-50 group cursor-pointer hover:shadow-md transition-all">
                    <div className="h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                       <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center">
                          <div className="flex gap-1 items-end h-16">
                            <div className="w-3 h-8 bg-emerald-300 rounded-sm" />
                            <div className="w-3 h-12 bg-emerald-400 rounded-sm" />
                            <div className="w-3 h-6 bg-emerald-300 rounded-sm" />
                            <div className="w-3 h-14 bg-emerald-500 rounded-sm" />
                            <div className="w-3 h-10 bg-emerald-400 rounded-sm" />
                          </div>
                       </div>
                       <button className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                       </button>
                    </div>
                    <div className="px-2">
                       <h4 className="font-bold text-slate-800 text-sm mb-1">Market_Validation_Q4.csv</h4>
                       <p className="text-xs text-slate-400">Python Analysis Ready</p>
                    </div>
                 </div>

                 {/* Grant Proposal Card */}
                 <div className="bg-white p-3 pb-4 rounded-3xl shadow-sm border border-slate-50 group cursor-pointer hover:shadow-md transition-all">
                    <div className="h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                       <div className="absolute inset-0 bg-blue-50 flex items-center justify-center flex-col gap-2 p-6">
                          <div className="w-full h-1 bg-blue-200 rounded-full" />
                          <div className="w-full h-1 bg-blue-200 rounded-full" />
                          <div className="w-3/4 h-1 bg-blue-200 rounded-full mr-auto" />
                          <div className="w-full h-1 bg-blue-200 rounded-full mt-2" />
                       </div>
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-blue-600 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          PDF
                       </div>
                    </div>
                    <div className="px-2">
                       <h4 className="font-bold text-slate-800 text-sm mb-1">NSF_Grant_Draft_Final.pdf</h4>
                       <p className="text-xs text-slate-400">Pending Review</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Recently Uploaded */}
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Recent Materials</h2>
                 </div>
                 <div className="space-y-4">
                    {files.length > 0 ? files.slice(0, 4).map((file) => {
                       const getFileIcon = (type: string) => {
                         if (type.includes('pdf')) return { icon: FileText, color: 'bg-rose-100 text-rose-600' }
                         if (type.includes('image')) return { icon: ImageIcon, color: 'bg-purple-100 text-purple-600' }
                         if (type.includes('csv') || type.includes('excel') || type.includes('spreadsheet')) return { icon: FlaskConical, color: 'bg-emerald-100 text-emerald-600' }
                         if (type.includes('word') || type.includes('document')) return { icon: FileText, color: 'bg-blue-100 text-blue-600' }
                         return { icon: FileText, color: 'bg-slate-100 text-slate-600' }
                       }
                       const { icon: FileIcon, color } = getFileIcon(file.fileType)
                       const formatSize = (bytes: number) => {
                         if (bytes < 1024) return `${bytes} B`
                         if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
                         return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
                       }
                       const formatDate = (date: string) => {
                         const d = new Date(date)
                         const now = new Date()
                         const diff = now.getTime() - d.getTime()
                         const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                         if (days === 0) return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                         if (days === 1) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                         return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                       }
                       return (
                         <div key={file.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
                                  <FileIcon className="w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{file.name}</h4>
                                  <p className="text-xs text-slate-400 font-medium">{formatDate(file.createdAt)}</p>
                               </div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{formatSize(file.size)}</span>
                         </div>
                       )
                    }) : (
                      <div className="text-center py-8 text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No files uploaded yet</p>
                        <button 
                          onClick={() => setShowUploadModal(true)}
                          className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-200 transition-colors"
                        >
                          Upload your first file
                        </button>
                      </div>
                    )}
                 </div>
              </div>

               {/* Project Folders */}
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Projects in {currentWorkspace?.name || 'Workspace'}</h2>
                    <button className="text-slate-400 hover:text-indigo-600">
                       <MoreHorizontal className="w-6 h-6" />
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                       { name: 'PhD Thesis', date: 'Updated 2h ago', color: 'bg-indigo-50 text-indigo-600' },
                       { name: 'AI Finance Paper', date: 'Updated yesterday', color: 'bg-orange-50 text-orange-600' },
                       { name: 'Lab Data 2024', date: 'Updated Oct 20', color: 'bg-emerald-50 text-emerald-600' },
                       { name: 'Grant Application', date: 'Updated Oct 15', color: 'bg-blue-50 text-blue-600' },
                    ].map((folder, i) => (
                       <div key={i} className={`p-6 ${folder.color} rounded-3xl flex flex-col justify-between h-32 cursor-pointer hover:opacity-80 transition-opacity`}>
                          <div className="flex justify-between items-start">
                             <FolderOpen className="w-8 h-8" fill="currentColor" />
                             <MoreVertical className="w-4 h-4 opacity-50" />
                          </div>
                          <div>
                             <h4 className="font-bold text-lg mb-1">{folder.name}</h4>
                             <p className="text-xs opacity-70 font-medium">{folder.date}</p>
                          </div>
                       </div>
                    ))}
                 </div>
                 <button className="w-full mt-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">
                    View All Projects
                 </button>
              </div>
           </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-80 bg-white border-l border-slate-100 flex-shrink-0 flex flex-col p-8 overflow-y-auto">
         {/* Chart Section */}
         <div className="mb-10">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Research Impact</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                     <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                        dy={10}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                     />
                     <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                           backgroundColor: '#1e1b4b', 
                           borderRadius: '8px', 
                           border: 'none',
                           color: 'white',
                           fontSize: '12px'
                        }}
                     />
                     <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={8}>
                        {chartData.map((entry, index) => (
                           <Cell 
                              key={`cell-${index}`} 
                              fill={index % 2 === 0 ? '#6366f1' : '#a5b4fc'} 
                           />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Shared Folders / Co-Authors */}
         <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Co-Authors & Reviewers</h3>
            <div className="space-y-4 mb-8">
               {[
                  { name: 'Dr. Sarah Chen', share: 'Lead Researcher', icon: Users },
                  { name: 'James Miller', share: 'PhD Candidate', icon: Users },
                  { name: 'Dr. Emily Wilson', share: 'External Reviewer', icon: MessageSquare },
                  { name: 'Review Board A', share: 'Pending Approval', icon: FileCheck },
                  { name: 'Grant Committee', share: 'NSF Proposal', icon: BookOpen },
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                     <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <item.icon className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                        <p className="text-xs text-slate-400">{item.share}</p>
                     </div>
                     <span className="text-[10px] font-bold text-slate-400">Online</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Promo / Action */}
         <div className="mt-auto bg-[#4f46e5] rounded-3xl p-6 relative overflow-hidden text-white">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
             
             <h4 className="font-bold text-lg mb-2 relative z-10">Submission Deadline <br/> Approaching</h4>
             <p className="text-indigo-200 text-xs mb-4 relative z-10">IEEE Conference submission due in 4 days.</p>
             <button className="mt-2 px-6 py-3 bg-white text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors relative z-10 w-full mb-2">
                Submit Paper
             </button>
             <button className="px-6 py-3 bg-indigo-700/50 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors relative z-10 w-full">
                Review Guidelines
             </button>
         </div>
      </aside>

      {/* Upload Modal */}
      {showUploadModal && currentWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Upload Files</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-4">
                Upload research files, datasets, or documents to <strong>{currentWorkspace.name}</strong>
              </p>
              <UploadDropzone
                endpoint="researchFileUploader"
                headers={{ 
                  'x-workspace-id': currentWorkspace.id 
                }}
                onClientUploadComplete={(res) => {
                  console.log('Upload complete:', res)
                  fetchFiles()
                  setShowUploadModal(false)
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error)
                  alert(`Upload failed: ${error.message}`)
                }}
                appearance={{
                  container: "border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-indigo-400 transition-colors",
                  label: "text-slate-600 hover:text-indigo-600",
                  allowedContent: "text-slate-400 text-xs",
                  button: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 py-2 ut-uploading:bg-indigo-400"
                }}
              />
            </div>
            <p className="text-xs text-slate-400 text-center">
              Supports PDF, DOCX, LaTeX, CSV, Excel, and more (up to 64MB)
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && currentWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Share Workspace</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Invite collaborators to <strong>{currentWorkspace.name}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@university.edu"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  <option value="editor">Editor - Can upload and edit files</option>
                  <option value="viewer">Viewer - Can only view files</option>
                </select>
              </div>
              <button
                onClick={inviteMember}
                disabled={!inviteEmail.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Workspace Modal */}
      {showNewWorkspaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Create New Workspace</h3>
              <button 
                onClick={() => setShowNewWorkspaceModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Create a new research workspace to organize your projects
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Workspace Name</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g., PhD Thesis 2024"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                onClick={createWorkspace}
                disabled={!newWorkspaceName.trim() || isCreatingWorkspace}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingWorkspace ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Workspace'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-slate-600 font-medium">Loading your research workspace...</p>
          </div>
        </div>
      )}
    </div>
  )
}
