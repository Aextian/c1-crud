import { View, Text } from 'react-native'
import React, { createContext, useContext } from 'react'

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}
interface AuthProps {
    authState:{
        authenticated: boolean | null,username:string|null,role:Role|null
    };
    onLogin:(username:string,password:string)=> void;
    onLogout:()=> void;
}
const AuthContext = createContext<Partial<AuthProps>>({});

export const useAuth = () => {
    return useContext(AuthContext)
}


export default AuthContext
