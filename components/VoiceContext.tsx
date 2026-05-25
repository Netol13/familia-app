'use client'

import { createContext, useContext } from 'react'

type VoiceContextValue = {
  mascotas: Array<{ id: string; nombre: string }>
  personas: Array<{ id: string; nombre: string }>
}

const VoiceContext = createContext<VoiceContextValue>({ mascotas: [], personas: [] })

export function VoiceProvider({
  children,
  mascotas,
  personas,
}: VoiceContextValue & { children: React.ReactNode }) {
  return (
    <VoiceContext.Provider value={{ mascotas, personas }}>
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoiceContext() {
  return useContext(VoiceContext)
}
