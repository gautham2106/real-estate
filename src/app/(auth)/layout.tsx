export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
        {children}
      </body>
    </html>
  )
}
