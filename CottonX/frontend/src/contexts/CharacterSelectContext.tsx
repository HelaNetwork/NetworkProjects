'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

type CharacterSelectContextType = {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
}

const CharacterSelectContext = createContext<CharacterSelectContextType | undefined>(undefined)

export function CharacterSelectProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <CharacterSelectContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </CharacterSelectContext.Provider>
    )
}

export function useCharacterSelect() {
    const context = useContext(CharacterSelectContext)
    if (context === undefined) {
        throw new Error('useCharacterSelect must be used within a CharacterSelectProvider')
    }
    return context
} 