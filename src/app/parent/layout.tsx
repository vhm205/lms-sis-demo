import type { Metadata, Viewport } from 'next'
import { ParentProvider } from '@/components/parent/parent-provider'
import { ParentMobileShell } from '@/components/parent/parent-mobile-shell'

export const metadata: Metadata = {
  title: 'EduCenter Parent • Sổ Liên Lạc & AI Trợ Lý Học Tập',
  description: 'Cổng thông tin phụ huynh, sổ liên lạc điện tử và trợ lý AI Orchexa chăm sóc học viên',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EduCenter Parent'
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F2994A'
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParentProvider>
      <ParentMobileShell>
        {children}
      </ParentMobileShell>
    </ParentProvider>
  )
}
