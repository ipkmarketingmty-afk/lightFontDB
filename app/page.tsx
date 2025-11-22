import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default async function HomePage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('db_session')
  
  if (sessionCookie) {
    redirect('/inventory')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-vault-navy">BlackVault</h1>
          <p className="text-gray-600">Inventory Management System</p>
        </div>
        
        <div className="card-vault">
          <h2 className="text-xl font-semibold mb-6 text-vault-navy">Conexión a Base de Datos</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
