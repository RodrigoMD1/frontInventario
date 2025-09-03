import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CartItem {
  nombre: string
  precio: number
  imagen: string
  cantidad: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'cantidad'>) => void
  removeFromCart: (nombre: string) => void
  clearCart: () => void
  updateQuantity: (nombre: string, cantidad: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('leatherqueens_cart')
    if (stored) setCart(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('leatherqueens_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: Omit<CartItem, 'cantidad'>) => {
    setCart(prev => {
      const found = prev.find(p => p.nombre === item.nombre)
      if (found) {
        return prev.map(p => p.nombre === item.nombre ? { ...p, cantidad: p.cantidad + 1 } : p)
      }
      return [...prev, { ...item, cantidad: 1 }]
    })
  }

  const removeFromCart = (nombre: string) => {
    setCart(prev => prev.filter(p => p.nombre !== nombre))
  }

  const clearCart = () => setCart([])

  const updateQuantity = (nombre: string, cantidad: number) => {
    setCart(prev => prev.map(p => p.nombre === nombre ? { ...p, cantidad } : p))
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  )
}
