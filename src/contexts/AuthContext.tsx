import { createContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { authAPI } from '../utils/api'

// Tipos basados en el backend real
interface User {
  id: string
  email: string
  role: 'admin' | 'store'
  isActive: boolean
  plan: string | null
  productsUsed: number
  lastLogin: Date | null
}

// Tipo para el payload del JWT
interface JWTPayload {
  sub: string          // El backend usa 'sub' no 'userId'
  email: string
  role: string
  iat: number
  exp: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ needsStore?: boolean }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
  isAdmin: boolean
  isStore: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar la aplicación
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      // Verificar si el token no ha expirado
      try {
        const decoded = jwtDecode<JWTPayload>(token)
        const currentTime = Date.now() / 1000
        
        if (decoded.exp < currentTime) {
          // Token expirado
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setLoading(false)
          return
        }

        // Token válido, cargar datos del usuario desde localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // Si no hay datos de usuario, recrearlos desde el JWT
          const userData: User = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role as 'admin' | 'store',
            isActive: true,
            plan: null,
            productsUsed: 0,
            lastLogin: new Date()
          }
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        }
      } catch (jwtError) {
        // Token inválido
        console.error('Invalid token:', jwtError)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ needsStore?: boolean }> => {
    const response = await authAPI.login(email, password)
    
    // El backend devuelve: { access_token: string }
    const token = response.access_token
    localStorage.setItem('token', token)
    
    // Decodificar el JWT para obtener información del usuario
    const decoded = jwtDecode<JWTPayload>(token)
    
    // Crear objeto usuario con la información del JWT
    // Nota: Algunos campos como plan, productsUsed se inicializan con valores por defecto
    // hasta que implementemos un endpoint para obtener el perfil completo
    const userData: User = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role as 'admin' | 'store',
      isActive: true,
      plan: null, // Se puede actualizar después con una llamada al backend
      productsUsed: 0, // Se puede actualizar después con una llamada al backend
      lastLogin: new Date()
    }
    
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    
    // Retornar si necesita crear una tienda (solo para usuarios tipo store)
    return { needsStore: userData.role === 'store' }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.location.href = '/auth/login'
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'
  const isStore = user?.role === 'store'

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    isStore,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
