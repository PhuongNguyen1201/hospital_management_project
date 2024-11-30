import React, { ReactNode } from 'react'

const AuthLayout = ({children}:{children:ReactNode}) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-color_30">
      {children}
    </div>
  )
}

export default AuthLayout
