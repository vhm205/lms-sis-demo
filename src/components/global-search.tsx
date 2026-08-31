"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserPlus, 
  Receipt, 
  CalendarDays, 
  ClipboardCheck, 
  Headphones, 
  Bot, 
  LayoutDashboard,
  ArrowRight,
  Loader2,
  Sparkles,
  CornerDownLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLeadStatusLabel, getOrderStatusLabel, ORDER_STATUS_MAP, getStudentStatusLabel } from "@/lib/constants";

interface SearchResults {
  students: Array<{
    id: string;
    name: string;
    code: string;
    phone?: string;
    parentName?: string;
    parentPhone?: string;
    facilityName?: string;
    status: string;
    classes: string[];
  }>;
  classes: Array<{
    id: string;
    name: string;
    code: string;
    courseName?: string;
    teacherName?: string;
    facilityName?: string;
    capacity: number;
    studentCount: number;
  }>;
  courses: Array<{
    id: string;
    name: string;
    code: string;
    type?: string;
    duration?: number;
    fee?: number;
  }>;
  leads: Array<{
    id: string;
    name: string;
    phone: string;
    courseName?: string;
    facilityName?: string;
    status: string;
  }>;
  orders: Array<{
    id: string;
    code: string;
    parentName: string;
    parentPhone: string;
    courseName?: string;
    facilityName?: string;
    amount: number;
    status: string;
  }>;
}

const QUICK_LINKS = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard, category: "Hệ thống" },
  { name: "Học viên", href: "/students", icon: Users, category: "Học vụ" },
  { name: "Lớp học", href: "/classes", icon: GraduationCap, category: "Học vụ" },
  { name: "Khóa học", href: "/courses", icon: BookOpen, category: "Học vụ" },
  { name: "Lịch học & Điểm danh", href: "/schedule", icon: CalendarDays, category: "Học vụ" },
  { name: "Kết quả học tập", href: "/assignments", icon: ClipboardCheck, category: "Học vụ" },
  { name: "Khách tiềm năng", href: "/leads", icon: UserPlus, category: "CRM" },
  { name: "Đơn đăng ký", href: "/orders", icon: Receipt, category: "Vận hành" },
  { name: "Yêu cầu hỗ trợ", href: "/requests", icon: Headphones, category: "Dịch vụ" },
  { name: "Điều hành AI Orchexa", href: "/developer", icon: Bot, category: "AI Agent" },
];

const POPULAR_SEARCHES = ["HV0001", "IELTS", "Tiếng Anh", "Cầu Giấy", "Bình Thạnh", "0901234567"];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = useCallback((href: string) => {
    setIsOpen(false);
    router.push(href);
  }, [router]);

  // Flattened list of navigable items for keyboard arrow navigation
  const navigableItems = useMemo(() => {
    if (!query.trim() || !results) {
      return QUICK_LINKS.map(link => ({ type: "link", href: link.href, label: link.name }));
    }
    const items: Array<{ type: string; href: string; label: string }> = [];
    results.students.forEach(s => items.push({ type: "student", href: "/students", label: `${s.name} (${s.code})` }));
    results.classes.forEach(c => items.push({ type: "class", href: "/classes", label: `${c.name} (${c.code})` }));
    results.courses.forEach(co => items.push({ type: "course", href: "/courses", label: `${co.name} (${co.code})` }));
    results.leads.forEach(l => items.push({ type: "lead", href: "/leads", label: `${l.name} (${l.phone})` }));
    results.orders.forEach(o => items.push({ type: "order", href: "/orders", label: `${o.parentName} (${o.code})` }));
    return items;
  }, [query, results]);

  // Close when clicking outside of modal container or on focus loss
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  // Handle Cmd+K / Ctrl+K keyboard shortcut and Arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      } else if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(1, navigableItems.length));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + navigableItems.length) % Math.max(1, navigableItems.length));
        } else if (e.key === "Enter" && navigableItems[selectedIndex]) {
          e.preventDefault();
          handleNavigate(navigableItems[selectedIndex].href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, navigableItems, selectedIndex, handleNavigate]);

  // Reset index and focus input when modal state changes
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      setSelectedIndex(0);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const formatVND = (amount?: number) => {
    if (!amount) return "";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const hasResults =
    results &&
    (results.students.length > 0 ||
      results.classes.length > 0 ||
      results.courses.length > 0 ||
      results.leads.length > 0 ||
      results.orders.length > 0);

  return (
    <>
      {/* Top Header Trigger Button */}
      <div className="flex-1 min-w-0 max-w-2xl mx-2 sm:mx-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between h-10 px-3.5 text-xs font-semibold bg-card hover:bg-muted/50 focus:bg-background border-2 border-border/80 hover:border-primary/50 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0 text-muted-foreground group-hover:text-foreground">
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            <span className="truncate">Tìm nhanh học viên, lớp học, đơn hàng...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-lg bg-muted border border-border text-muted-foreground group-hover:border-primary/40 shadow-2xs shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Global Search Dialog Modal Portal */}
      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4">
          {/* Subtle Dim Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            ref={modalRef}
            className="relative w-full max-w-xl bg-card dark:bg-[#1E1915] border-2 border-border/90 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.25)] overflow-hidden z-10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b-2 border-border/70 bg-muted/30">
              <div className="clay-icon-tile h-9 w-9 bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78] shrink-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm học viên, lớp học, khóa học, đơn hàng..."
                className="flex-1 bg-transparent text-sm sm:text-base font-bold text-foreground placeholder:text-muted-foreground/70 outline-none border-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-mono font-bold px-2 py-1 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Results / Suggestions Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* If no query: show compact suggestions & quick links */}
              {!query.trim() && (
                <div className="space-y-4">
                  {/* Popular Searches */}
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2 font-heading flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-500" /> Gợi ý tìm nhanh
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SEARCHES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setQuery(item)}
                          className="text-xs font-bold px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-[#FFF0E6] hover:text-[#D97736] dark:hover:bg-[#352114] border border-border/70 transition-colors cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2 font-heading">
                      Điều hướng nhanh
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_LINKS.map((item, idx) => {
                        const Icon = item.icon;
                        const isSelected = selectedIndex === idx;
                        return (
                          <button
                            key={item.href}
                            type="button"
                            onClick={() => handleNavigate(item.href)}
                            className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left group cursor-pointer ${
                              isSelected
                                ? "bg-[#FFF0E6] dark:bg-[#352114] border-[#FCDCC8] dark:border-[#523824] text-[#D97736]"
                                : "hover:bg-[#FAF6F0] dark:hover:bg-[#28221D] border-transparent hover:border-border/70"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`clay-icon-tile h-7 w-7 shrink-0 ${isSelected ? "bg-white dark:bg-card text-primary" : "bg-muted text-primary"}`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-foreground truncate font-heading">{item.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{item.category}</div>
                              </div>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Searching / Results */}
              {query.trim() && (
                <>
                  {isLoading && !results && (
                    <div className="py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs font-semibold">Đang tìm kiếm...</span>
                    </div>
                  )}

                  {!isLoading && !hasResults && (
                    <div className="py-10 text-center space-y-2">
                      <div className="clay-icon-tile h-10 w-10 mx-auto bg-muted text-muted-foreground">
                        <Search className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-bold text-foreground">Không tìm thấy kết quả</div>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto font-medium">
                        Không có dữ liệu khớp với &ldquo;{query}&rdquo;. Thử tìm mã HV, tên lớp hoặc SĐT.
                      </p>
                    </div>
                  )}

                  {/* 1. Students */}
                  {results && results.students.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-heading">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-sky-500" /> Học viên ({results.students.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNavigate("/students")}
                          className="text-[#D97736] hover:underline lowercase font-bold"
                        >
                          xem tất cả →
                        </button>
                      </div>
                      <div className="space-y-1">
                        {results.students.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => handleNavigate("/students")}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FAF6F0] dark:hover:bg-[#28221D] border border-border/60 hover:border-primary/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="clay-icon-tile h-8 w-8 bg-[#E6F8FB] text-[#0284C7] font-mono font-black text-xs shrink-0">
                                {s.code.slice(-3)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-foreground font-heading">{s.name}</span>
                                  <Badge variant="secondary" className="text-[9px] h-4.5 px-1.5 font-mono">{s.code}</Badge>
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-2 font-medium">
                                  {s.phone && <span>{s.phone}</span>}
                                  {s.parentName && <span>• PH: {s.parentName}</span>}
                                  {s.facilityName && <span>• {s.facilityName}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={s.status === "ACTIVE" ? "green" : "outline"} className="text-[10px]">
                                {getStudentStatusLabel(s.status)}
                              </Badge>
                              <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Classes */}
                  {results && results.classes.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-heading">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-amber-500" /> Lớp học ({results.classes.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNavigate("/classes")}
                          className="text-[#D97736] hover:underline lowercase font-bold"
                        >
                          xem tất cả →
                        </button>
                      </div>
                      <div className="space-y-1">
                        {results.classes.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleNavigate("/classes")}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FAF6F0] dark:hover:bg-[#28221D] border border-border/60 hover:border-primary/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="clay-icon-tile h-8 w-8 bg-[#FFF0E6] text-[#D97736] font-bold text-xs shrink-0">
                                <GraduationCap className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-foreground font-heading">{c.name}</span>
                                  <Badge variant="orange" className="text-[9px] h-4.5 px-1.5 font-mono">{c.code}</Badge>
                                </div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-2 font-medium">
                                  <span>{c.courseName}</span>
                                  {c.facilityName && <span>• {c.facilityName}</span>}
                                  {c.teacherName && <span>• GV: {c.teacherName}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold font-mono text-primary">
                                {c.studentCount}/{c.capacity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Courses */}
                  {results && results.courses.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-heading">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> Khóa học ({results.courses.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNavigate("/courses")}
                          className="text-[#D97736] hover:underline lowercase font-bold"
                        >
                          xem tất cả →
                        </button>
                      </div>
                      <div className="space-y-1">
                        {results.courses.map((co) => (
                          <div
                            key={co.id}
                            onClick={() => handleNavigate("/courses")}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FAF6F0] dark:hover:bg-[#28221D] border border-border/60 hover:border-primary/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="clay-icon-tile h-8 w-8 bg-[#F0FDF4] text-[#16A34A] font-bold text-xs shrink-0">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-foreground font-heading">{co.name}</span>
                                  <Badge variant="green" className="text-[9px] h-4.5 px-1.5 font-mono">{co.code}</Badge>
                                </div>
                                <div className="text-[11px] text-muted-foreground font-medium">
                                  {co.type} {co.duration ? `• ${co.duration} buổi` : ""}
                                </div>
                              </div>
                            </div>
                            {co.fee && (
                              <div className="text-xs font-black font-mono text-[#D97736] shrink-0">
                                {formatVND(co.fee)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Leads */}
                  {results && results.leads.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-heading">
                        <span className="flex items-center gap-1.5">
                          <UserPlus className="h-3.5 w-3.5 text-amber-500" /> Khách tiềm năng ({results.leads.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNavigate("/leads")}
                          className="text-[#D97736] hover:underline lowercase font-bold"
                        >
                          xem tất cả →
                        </button>
                      </div>
                      <div className="space-y-1">
                        {results.leads.map((l) => (
                          <div
                            key={l.id}
                            onClick={() => handleNavigate("/leads")}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FAF6F0] dark:hover:bg-[#28221D] border border-border/60 hover:border-primary/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="clay-icon-tile h-8 w-8 bg-[#FFFBEB] text-[#D97706] font-bold text-xs shrink-0">
                                <UserPlus className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-extrabold text-foreground font-heading">{l.name}</div>
                                <div className="text-[11px] text-muted-foreground font-medium">
                                  {l.phone} {l.courseName ? `• ${l.courseName}` : ""}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0 font-bold">
                              {getLeadStatusLabel(l.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Orders */}
                  {results && results.orders.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-heading">
                        <span className="flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5 text-pink-500" /> Đơn hàng ({results.orders.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNavigate("/orders")}
                          className="text-[#D97736] hover:underline lowercase font-bold"
                        >
                          xem tất cả →
                        </button>
                      </div>
                      <div className="space-y-1">
                        {results.orders.map((o) => (
                          <div
                            key={o.id}
                            onClick={() => handleNavigate("/orders")}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FAF6F0] dark:hover:bg-[#28221D] border border-border/60 hover:border-primary/40 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="clay-icon-tile h-8 w-8 bg-[#FDF2F8] text-[#DB2777] font-bold text-xs shrink-0">
                                <Receipt className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-foreground font-heading">{o.parentName}</span>
                                  <Badge variant="pink" className="text-[9px] h-4.5 px-1.5 font-mono">{o.code}</Badge>
                                </div>
                                <div className="text-[11px] text-muted-foreground font-medium">
                                  {o.parentPhone} {o.courseName ? `• ${o.courseName}` : ""}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs font-black font-mono text-foreground">{formatVND(o.amount)}</div>
                              <Badge variant={ORDER_STATUS_MAP[o.status]?.badgeVariant || 'amber'} className="text-[9px] mt-0.5">
                                {getOrderStatusLabel(o.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <div className="flex items-center gap-2.5">
                <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono font-bold">↑↓</kbd> chuyển</span>
                <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono font-bold">↵</kbd> chọn</span>
                <span><kbd className="px-1 py-0.5 rounded bg-muted font-mono font-bold">ESC</kbd> đóng</span>
              </div>
              <span className="font-heading font-bold text-primary text-[10px]">EduCenter LMS Search</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
