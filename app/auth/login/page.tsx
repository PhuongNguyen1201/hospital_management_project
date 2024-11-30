import LoginForm from '@/components/auth/login-form'
import React from 'react'

const LoginPage = async () => {
  return (
    <main className="w-full flex h-full flex-col items-center justify-center bg-color_60">
    <div className="space-y-6">
      <div>
        <LoginForm/>
      </div>
    </div>
 </main>
  )
}

export default LoginPage
