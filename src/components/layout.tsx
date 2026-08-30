"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, GraduationCap, CalendarDays, ClipboardList, BookOpen, UserPlus, FileText, Bell, LayoutDashboard, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
    { name: 'Học viên', href: '/students', icon: Users },
    { name: 'Khóa học', href: '/courses', icon: BookOpen },
    { name: 'Lớp học', href: '/classes', icon: Users },
    { name: 'Lịch học & Điểm danh', href: '/schedule', icon: CalendarDays },
    { name: 'Kết quả học tập', href: '/assignments', icon: ClipboardList },
    { name: 'Khách hàng tiềm năng', href: '/leads', icon: UserPlus },
    { name: 'Đơn đăng ký', href: '/orders', icon: FileText },
    { name: 'Yêu cầu hỗ trợ', href: '/requests', icon: FileText },
    { name: 'Điều hành API/MCP', href: '/developer', icon: Menu },
  ]

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg">EduCenter VN</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary ${
                      isActive 
                        ? "bg-muted text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8 rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
            AD
          </div>
        </header>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b bg-muted/40">
            <nav className="grid gap-2 p-4 text-sm font-medium">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}

        <main className="flex-1 bg-muted/10 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
