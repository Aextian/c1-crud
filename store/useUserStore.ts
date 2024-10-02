import { create } from 'zustand'

// Define the shape of your user data

interface UserStore {
  user: any // The user can be of type `User` or `null`
  setUser: (userData: any) => void // Function to set user data
  clearUser: () => void // Function to clear user data
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (userData: any) => set({ user: userData }),
  clearUser: () => set({ user: null }),
}))
