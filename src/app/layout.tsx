import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { FeedbackButton } from "@/components/FeedbackButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Трансформер",
  description: "Платформа для обучения ИИ-инструментам",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  minimumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              })();
            `,
          }}
        />
        <AuthProvider>
          {children}
          <FeedbackButton />
        </AuthProvider>
      </body>
    </html>
  )
}
