'use client'

import { createContext, useContext } from 'react'

// Admin context for session
export const AdminContext = createContext<{
  session: { username: string; loggedInAt: number } | null
  logout: () => Promise<void>
}>({
  session: null,
  logout: async () => {},
})

export const useAdmin = () => useContext(AdminContext)
