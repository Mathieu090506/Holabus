'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SearchContextType {
    isSearching: boolean;
    setIsSearching: (value: boolean) => void;
}

const SearchContext = createContext<SearchContextType>({
    isSearching: false,
    setIsSearching: () => { },
})

export const useSearch = () => useContext(SearchContext)

export function SearchProvider({ children }: { children: ReactNode }) {
    const [isSearching, setIsSearching] = useState(false)

    return (
        <SearchContext.Provider value={{ isSearching, setIsSearching }}>
            {children}
        </SearchContext.Provider>
    )
}
