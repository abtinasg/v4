'use client'

import { useState } from 'react'
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
  MoreHorizontal
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

export default function CloudDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  // Sidebar Menu Items
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard' },
    { icon: FolderOpen, label: 'All Files' },
    { icon: MessageSquare, label: 'Shared' },
    { icon: Star, label: 'Favorites' },
    { icon: Clock, label: 'Recent' },
    { icon: FileCheck, label: 'Request' },
    { icon: ImageIcon, label: 'Pictures' },
    { icon: Video, label: 'Videos' },
    { icon: FileText, label: 'Documents' },
    { icon: FileCheck, label: 'Signed' },
  ]

  // Chart Data
  const chartData = [
    { name: 'JAN', value: 15 },
    { name: 'FEB', value: 35 },
    { name: 'MAR', value: 45 },
    { name: 'APR', value: 60 },
    { name: 'MAY', value: 45 },
    { name: 'JUN', value: 35 },
  ]

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
              MY CLOUD
            </span>
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
                placeholder="Search Files..." 
                className="w-full h-11 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
             </button>
             <div className="h-8 w-[1px] bg-slate-200 mx-2" />
             <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
             </button>
             <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden">
                   <img src="https://ui-avatars.com/api/?name=AR+Shakir&background=0D8ABC&color=fff" alt="User" />
                </div>
                <div className="hidden lg:block text-sm">
                   <p className="font-bold text-slate-900">AR Shakir</p>
                   <p className="text-slate-400 text-xs">shakir260@gmail.com</p>
                </div>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
           {/* Top Folders */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Design', files: '17 files', size: '12 GB', color: 'bg-indigo-600', icon: 'bg-indigo-100 text-indigo-600' },
                { label: 'Documents', files: '14 files', size: '2 GB', color: 'bg-teal-400', icon: 'bg-teal-50 text-teal-400' },
                { label: 'Music', files: '1,200 files', size: '24 GB', color: 'bg-orange-400', icon: 'bg-orange-50 text-orange-400' },
                { label: 'Images', files: '270 files', size: '14 GB', color: 'bg-rose-400', icon: 'bg-rose-50 text-rose-400' },
              ].map((folder) => (
                 <div key={folder.label} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 ${folder.icon} rounded-2xl flex items-center justify-center`}>
                          <FolderOpen className="w-6 h-6" fill="currentColor" />
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

            {/* Quick Access */}
           <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Quick Access</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Image Card */}
                 <div className="bg-white p-3 pb-4 rounded-3xl shadow-sm border border-slate-50 group cursor-pointer hover:shadow-md transition-all">
                    <div className="h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                       {/* Placeholder for image */}
                       <div className="absolute inset-0 bg-indigo-50 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-indigo-200" />
                       </div>
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          JPG
                       </div>
                    </div>
                    <div className="px-2">
                       <h4 className="font-bold text-slate-800 text-sm mb-1">Building Image.jpeg</h4>
                    </div>
                 </div>

                 {/* Video Card */}
                 <div className="bg-white p-3 pb-4 rounded-3xl shadow-sm border border-slate-50 group cursor-pointer hover:shadow-md transition-all">
                    <div className="h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                       <div className="absolute inset-0 bg-rose-50 flex items-center justify-center">
                          <Video className="w-10 h-10 text-rose-200" />
                       </div>
                       <button className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                       </button>
                    </div>
                    <div className="px-2">
                       <h4 className="font-bold text-slate-800 text-sm mb-1">Product Video.mp4</h4>
                    </div>
                 </div>

                 {/* Doc Card */}
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
                       <h4 className="font-bold text-slate-800 text-sm mb-1">Customers.pdf</h4>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Recently Uploaded */}
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Recently Uploaded</h2>
                 </div>
                 <div className="space-y-4">
                    {[
                       { name: 'Marcus Family.jpg', date: '10 oct, 10:23pm', size: '12 MB', icon: ImageIcon, color: 'bg-indigo-100 text-indigo-600' },
                       { name: 'Project Specs.pdf', date: '10 oct, 10:23pm', size: '2 MB', icon: FileText, color: 'bg-rose-100 text-rose-500' },
                       { name: 'Holiday Video.mp4', date: '11 oct, 09:15pm', size: '124 MB', icon: Video, color: 'bg-teal-100 text-teal-600' },
                       { name: 'Client Meeting.mp3', date: '12 oct, 11:00am', size: '45 MB', icon: MessageSquare, color: 'bg-orange-100 text-orange-500' },
                    ].map((file, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 ${file.color} rounded-full flex items-center justify-center`}>
                                <file.icon className="w-6 h-6" />
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
                                <p className="text-xs text-slate-400 font-medium">{file.date}</p>
                             </div>
                          </div>
                          <span className="text-xs font-bold text-slate-500">{file.size}</span>
                       </div>
                    ))}
                 </div>
              </div>

               {/* File Manager Section (Folders) */}
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">File Manager</h2>
                    <button className="text-slate-400 hover:text-indigo-600">
                       <MoreHorizontal className="w-6 h-6" />
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {[
                       { name: 'My Folder', date: 'created Jun 23, 2023', color: 'bg-indigo-50 text-indigo-600' },
                       { name: 'Agreements', date: 'created Jun 23, 2023', color: 'bg-orange-50 text-orange-600' },
                       { name: 'Other Folder', date: 'created Jun 23, 2023', color: 'bg-rose-50 text-rose-600' },
                       { name: 'Blueprints', date: 'created Jun 23, 2023', color: 'bg-teal-50 text-teal-600' },
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
                    Open File Manager
                 </button>
              </div>
           </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-80 bg-white border-l border-slate-100 flex-shrink-0 flex flex-col p-8 overflow-y-auto">
         {/* Chart Section */}
         <div className="mb-10">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Usage Stats</h3>
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

         {/* Shared Folders */}
         <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Shared Folders</h3>
            <div className="space-y-4 mb-8">
               {[
                  { name: 'Sketch Files', share: 'Shared with: mike@...', icon: ImageIcon },
                  { name: 'AutoCad Drawings', share: 'Shared with: shakir@...', icon: FolderOpen },
                  { name: 'Master Spreadsheets', share: 'Shared with: john@...', icon: FileText },
                  { name: 'Design Comps', share: 'Shared with: kelvin@...', icon: ImageIcon },
                  { name: 'Final Revisions', share: 'Shared with: saim@...', icon: FileCheck },
               ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                     <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <item.icon className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                        <p className="text-xs text-slate-400">{item.share}</p>
                     </div>
                     <span className="text-[10px] font-bold text-slate-400">10 oct</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Promo */}
         <div className="mt-auto bg-[#4f46e5] rounded-3xl p-6 relative overflow-hidden text-white">
             {/* Abstract Shapes */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
             
             <h4 className="font-bold text-lg mb-2 relative z-10">Invite 2 friends and get <br/> 5 GB extra space.</h4>
             <button className="mt-4 px-6 py-3 bg-white text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors relative z-10">
                Invite Now!
             </button>
         </div>
      </aside>
    </div>
  )
}
