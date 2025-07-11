import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Swal from 'sweetalert2'
import { NavLink, useNavigate } from 'react-router-dom'
import { authAPI, storeAPI } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'

// Esquema simplificado según tu backend
const registerSchema = z.object({
  email: z.string().email('Ingresa un email válido').min(1, 'El email es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
  role: z.enum(['store', 'admin']),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login: authLogin } = useAuth() // Usar el hook de autenticación

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'store'
    }
  })

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setIsLoading(true)
    
    try {
      // 1. Registrar usuario
      console.log('Registrando usuario con rol:', data.role)
      const registerResponse = await authAPI.register(data.email, data.password, data.role)
      console.log('Respuesta de registro:', registerResponse)
      
      // 2. Iniciar sesión automáticamente
      console.log('Iniciando sesión automáticamente')
      const loginResponse = await authAPI.login(data.email, data.password)
      console.log('Respuesta de login:', loginResponse)
      
      // Guardar token en localStorage
      localStorage.setItem('token', loginResponse.access_token || loginResponse.token)
      
      // Autenticar en el contexto
      if (authLogin) {
        await authLogin(data.email, data.password)
      }
      
      // 3. Si es rol "store", crear una tienda automáticamente
      if (data.role === 'store') {
        try {
          console.log('Creando tienda para el usuario')
          const storeName = `Tienda de ${data.email.split('@')[0]}` // Nombre automático basado en el email
          await storeAPI.createStore(storeName)
          console.log('Tienda creada exitosamente')
        } catch (storeError) {
          console.error('Error al crear tienda:', storeError)
          // Continuamos a pesar del error, solo lo reportamos
        }
      }
      
      await Swal.fire({
        title: '¡Registro exitoso!',
        text: data.role === 'store' 
          ? 'Tu cuenta y tienda han sido creadas. Ahora puedes agregar productos.' 
          : 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        icon: 'success',
        confirmButtonColor: '#3B82F6'
      })

      // Redirigir según el rol
      if (data.role === 'store') {
        navigate('/dashboard') // Ir directamente al dashboard si ya tenemos tienda
      } else {
        navigate('/auth/login') // Ir al login en otros casos
      }
      
    } catch (error) {
      console.error('Register error:', error)
      await Swal.fire({
        title: 'Error en el registro',
        text: error instanceof Error ? error.message : 'Error al crear la cuenta',
        icon: 'error',
        confirmButtonColor: '#3B82F6'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Botón volver al inicio */}
        <div className="flex justify-start">
          <NavLink 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </NavLink>
        </div>

        <div>
          <div className="mx-auto h-12 w-auto flex justify-center">
            <h2 className="text-3xl font-extrabold text-gray-900">GlobalOffice</h2>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crea tu cuenta en GlobalOffice
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Comienza a gestionar tu inventario de forma profesional
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="tu@empresa.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Tipo de cuenta
              </label>
              <select
                {...register('role')}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                <option value="store">Tienda (Gestionar mi inventario)</option>
                <option value="admin">Administrador (Gestionar múltiples tiendas)</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                Acepto los{' '}
                <NavLink to="/terms" className="text-blue-600 hover:text-blue-500">
                  términos y condiciones
                </NavLink>{' '}
                y la{' '}
                <NavLink to="/privacy" className="text-blue-600 hover:text-blue-500">
                  política de privacidad
                </NavLink>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <NavLink to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Inicia sesión
              </NavLink>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
