import { create } from 'zustand'

interface ToggleState {
  isOpen: boolean
  toggleOpen: () => void
  setOpen: (open: boolean) => void
}

export const useToggleStore = create<ToggleState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (value: boolean) => set({ isOpen: value }),
}))
