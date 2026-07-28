'use client'

import { createContext, useContext, useState } from "react"

type SidebarContextType = {
    fold: boolean;
    setFold: (fold: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider ({ children }: { children: React.ReactNode}) {
    const [ fold, setFold ] = useState(false);

    return (
        <SidebarContext.Provider value={{ fold, setFold }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within SidebarProvider");
    return context
}