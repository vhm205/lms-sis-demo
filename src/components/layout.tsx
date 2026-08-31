"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  GraduationCap, 
  CalendarDays, 
  ClipboardCheck, 
  BookOpen, 
  UserPlus, 
  Receipt, 
  LayoutDashboard, 
  Menu, 
  Bot, 
  Sun, 
  Moon, 
  Headphones, 
  Plus, 
  Building2, 
  ChevronDown, 
  X, 
  Check, 
  MapPin, 
  Smartphone,
  type LucideIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { useFacility } from "@/components/facility-provider";
import { GlobalSearch } from "@/components/global-search";
import { RefreshButton } from "@/components/refresh-button";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  count?: string;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const facilityDropdownRef = useRef<HTMLDivElement>(null);
  const { setTheme, isDark } = useTheme();
  const { selectedFacilityId, selectedFacility, facilities, setSelectedFacilityId } = useFacility();

  // Close facility dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (facilityDropdownRef.current && !facilityDropdownRef.current.contains(event.target as Node)) {
        setIsFacilityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate counts dynamically from facilities data
  const totalStudentsCount = selectedFacilityId === "all"
    ? facilities.reduce((sum, f) => sum + (f._count?.students || 0), 0)
    : selectedFacility?._count?.students ?? 0;

  const totalClassesCount = selectedFacilityId === "all"
    ? facilities.reduce((sum, f) => sum + (f._count?.classes || 0), 0)
    : selectedFacility?._count?.classes ?? 0;

  const navGroups: NavGroup[] = [
    {
      title: "HỌC VỤ & ĐÀO TẠO",
      items: [
        { name: "Tổng quan", href: "/", icon: LayoutDashboard },
        { name: "Học viên", href: "/students", icon: Users, count: String(totalStudentsCount) },
        { name: "Khóa học", href: "/courses", icon: BookOpen },
        { name: "Lớp học", href: "/classes", icon: GraduationCap, count: String(totalClassesCount) },
        { name: "Lịch học & Điểm danh", href: "/schedule", icon: CalendarDays },
        { name: "Kết quả học tập", href: "/assignments", icon: ClipboardCheck },
      ]
    },
    {
      title: "TUYỂN SINH & VẬN HÀNH",
      items: [
        { name: "Khách hàng tiềm năng", href: "/leads", icon: UserPlus, badge: "CRM", badgeColor: "clay-badge-amber" },
        { name: "Đơn đăng ký", href: "/orders", icon: Receipt },
        { name: "Yêu cầu hỗ trợ", href: "/requests", icon: Headphones, badge: "1 mới", badgeColor: "clay-badge-pink" },
      ]
    },
    {
      title: "HỆ THỐNG & AI AGENT",
      items: [
        { name: "Điều hành AI / MCP", href: "/developer", icon: Bot, badge: "Orchexa", badgeColor: "clay-badge-aqua" },
      ]
    },
    {
      title: "ỨNG DỤNG DI ĐỘNG (PWA)",
      items: [
        { name: "Cổng Phụ huynh (PWA)", href: "/parent", icon: Smartphone, badge: "Mobile", badgeColor: "clay-badge-amber" },
      ]
    }
  ];

  // Helper for Breadcrumb title
  const getBreadcrumbTitle = () => {
    for (const group of navGroups) {
      const match = group.items.find(i => i.href === pathname);
      if (match) return match.name;
    }
    return "Tổng quan";
  };

  const currentFacilityName = selectedFacility ? selectedFacility.name : "Tất cả cơ sở";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 lg:w-72 flex-col border-r-2 border-border/80 bg-card/95 backdrop-blur-md md:flex fixed inset-y-0 z-30 shadow-[4px_0_24px_rgba(215,160,120,0.05)]">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b-2 border-border/70 px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#F2994A] via-[#E08E58] to-[#EA580C] flex items-center justify-center text-white shadow-md shadow-[#E08E58]/30 group-hover:scale-105 transition-transform duration-200 border border-white/40">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-base tracking-tight leading-none text-foreground">EduCenter VN</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#D97736] border border-[#FCDCC8] dark:bg-[#352114] dark:text-[#FBAA78]">PRO</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold mt-0.5">LMS & SIS Smart Hub</span>
            </div>
          </Link>
        </div>

        {/* Facility Selector Pill & Dropdown */}
        <div className="px-4 pt-3 pb-1 relative" ref={facilityDropdownRef}>
          <button 
            type="button"
            onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-[#FAF6F0] dark:bg-[#25201C] hover:bg-[#F3EAE0] dark:hover:bg-[#2F2720] rounded-2xl border-2 border-border/70 transition-all shadow-xs group cursor-pointer"
            title="Nhấn để chuyển đổi cơ sở hoạt động"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate font-bold text-foreground/90">
                {currentFacilityName}
              </span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ${isFacilityDropdownOpen ? "rotate-180 text-primary" : ""}`} />
          </button>

          {/* Facility Dropdown Menu */}
          {isFacilityDropdownOpen && (
            <div className="absolute left-4 right-4 top-full mt-2 rounded-3xl border-2 border-border/80 bg-popover p-2 text-popover-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80 font-heading">
                Cơ sở đào tạo
              </div>

              {/* All Facilities Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedFacilityId("all");
                  setIsFacilityDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-left ${
                  selectedFacilityId === "all"
                    ? "bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78]"
                    : "hover:bg-muted/60 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="clay-icon-tile h-7 w-7 bg-muted text-primary shrink-0">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-heading">Tất cả cơ sở</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Toàn bộ hệ thống trung tâm</div>
                  </div>
                </div>
                {selectedFacilityId === "all" && <Check className="h-4 w-4 text-[#D97736] shrink-0" />}
              </button>

              {/* Specific Facilities */}
              {facilities.map((facility) => {
                const isSelected = selectedFacilityId === facility.id;
                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => {
                      setSelectedFacilityId(facility.id);
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78]"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="clay-icon-tile h-7 w-7 bg-muted text-primary shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-heading">{facility.name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal truncate">{facility.address}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#D97736] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-5">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-muted-foreground/80 uppercase font-heading">
                {group.title}
              </div>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150 relative ${
                        isActive
                          ? "bg-gradient-to-r from-[#F2994A] to-[#E08E58] text-white shadow-md shadow-[#E08E58]/35 border border-white/20"
                          : "text-muted-foreground hover:bg-[#F5EBE1]/70 dark:hover:bg-[#28221D] hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"}`} />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                          isActive 
                            ? "bg-white/25 text-white border-transparent" 
                            : (item.badgeColor || "bg-muted text-foreground")
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {!item.badge && item.count && !isActive && (
                        <span className="text-[11px] text-muted-foreground/90 font-mono font-bold px-2 py-0.5 rounded-full bg-muted/80 border border-border/50">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* AI Agent Status Pill in Sidebar */}
        <div className="p-3.5 mx-3.5 mb-3.5 rounded-3xl bg-gradient-to-br from-[#FFF0E6] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2C1D14] dark:via-[#211D1A] dark:to-[#0E2630] border-2 border-[#EEDBCC] dark:border-[#3E3228] shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-foreground font-heading">Orchexa AI Voice</span>
            </div>
            <Badge variant="aqua" className="text-[9px] h-4.5 px-1.5">Active</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-tight">
            Agent ID: <span className="font-mono font-bold text-primary">911aa67c</span> sẵn sàng kết nối.
          </p>
        </div>

        {/* Footer Profile & Theme Toggle */}
        <div className="border-t-2 border-border/70 p-3.5 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-[#F2994A] to-[#E08E58] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-white/30">
                AD
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground truncate font-heading">Ban Quản Trị</span>
                <span className="text-[10px] text-muted-foreground truncate font-medium">admin@educenter.vn</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[#F3EAE0] dark:hover:bg-[#2F2720]"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title="Chuyển đổi giao diện Sáng / Tối"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex flex-1 flex-col md:pl-64 lg:pl-72 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 sm:gap-4 border-b-2 border-border/80 bg-background/90 px-4 sm:px-6 backdrop-blur-md">
          {/* Breadcrumb / Section title & Mobile Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Menu Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 md:hidden rounded-2xl border-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">Toggle navigation</span>
            </Button>

            {/* Breadcrumb / Section title */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-heading">
              <Link href="/" className="hover:text-foreground transition-colors font-bold">Hệ thống</Link>
              <span className="text-muted-foreground/40 font-normal">/</span>
              <span className="font-extrabold text-foreground">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          {/* Global Search Bar (Live & Functional Cmd+K) */}
          <GlobalSearch />

          {/* Header Action Items */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Parent PWA Switcher Button */}
            <Link
              href="/parent"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78] border-1.5 border-[#FCDCC8] dark:border-[#4B301E] hover:scale-105 transition-all shadow-2xs"
              title="Mở cổng ứng dụng PWA dành cho Phụ huynh / Học sinh"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cổng Phụ Huynh</span>
            </Link>

            {/* AI Agent Status Pill */}
            <Link 
              href="/developer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E6F8FB] text-[#0284C7] dark:bg-[#0E2E3B] dark:text-[#38BDF8] border-1.5 border-[#BAE6FD] dark:border-[#164E63] hover:scale-105 transition-transform shadow-2xs"
            >
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span>AI Agent Online</span>
            </Link>

            {/* Refresh Data Button */}
            <RefreshButton 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 bg-card hover:bg-muted/80 shadow-2xs" 
            />

            {/* Quick Add Dropdown */}
            <div className="relative">
              <Button 
                size="default" 
                className="h-10 gap-1.5 rounded-2xl bg-gradient-to-b from-[#F2994A] to-[#E08E58] text-white shadow-md shadow-[#E08E58]/30 font-bold text-xs px-4"
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tạo mới</span>
              </Button>

              {isQuickAddOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 rounded-3xl border-2 border-border/80 bg-popover p-2 text-popover-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsQuickAddOpen(false)}
                >
                  <Link href="/students" className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs hover:bg-[#FFF0E6] hover:text-[#D97736] font-bold transition-colors">
                    <Users className="h-4 w-4 text-primary" /> Thêm học viên
                  </Link>
                  <Link href="/classes" className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs hover:bg-[#FFF0E6] hover:text-[#D97736] font-bold transition-colors">
                    <GraduationCap className="h-4 w-4 text-primary" /> Mở lớp học
                  </Link>
                  <Link href="/orders" className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs hover:bg-[#FFF0E6] hover:text-[#D97736] font-bold transition-colors">
                    <Receipt className="h-4 w-4 text-primary" /> Tạo đơn đăng ký
                  </Link>
                  <Link href="/leads" className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs hover:bg-[#FFF0E6] hover:text-[#D97736] font-bold transition-colors">
                    <UserPlus className="h-4 w-4 text-primary" /> Thêm khách tiềm năng
                  </Link>
                  <Link href="/schedule" className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs hover:bg-[#FFF0E6] hover:text-[#D97736] font-bold transition-colors">
                    <CalendarDays className="h-4 w-4 text-primary" /> Xếp lịch học
                  </Link>
                </div>
              )}
            </div>

            {/* Theme Toggle (Header mobile/desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-2xl md:hidden text-muted-foreground hover:text-foreground border-2 border-border/70"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b-2 border-border bg-card/95 backdrop-blur-md p-4 space-y-4 shadow-xl rounded-b-3xl animate-in slide-in-from-top-4 duration-200">
            {/* Mobile Facility Selector */}
            <div className="p-3 bg-muted/40 rounded-2xl border border-border/70 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Cơ sở đang chọn
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedFacilityId("all")}
                  className={`text-left p-2 rounded-xl text-xs font-bold border transition-colors ${
                    selectedFacilityId === "all"
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-foreground border-border/80 hover:bg-muted/50"
                  }`}
                >
                  Tất cả cơ sở
                </button>
                {facilities.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFacilityId(f.id)}
                    className={`text-left p-2 rounded-xl text-xs font-bold border truncate transition-colors ${
                      selectedFacilityId === f.id
                        ? "bg-primary text-white border-primary"
                        : "bg-card text-foreground border-border/80 hover:bg-muted/50"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80 font-heading">{group.title}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                          isActive 
                            ? "bg-gradient-to-r from-[#F2994A] to-[#E08E58] text-white shadow-sm" 
                            : "text-muted-foreground hover:bg-[#F3EAE0] hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
