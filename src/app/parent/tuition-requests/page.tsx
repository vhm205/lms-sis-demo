'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { useParent } from '@/components/parent/parent-provider'
import { useSearchParams } from 'next/navigation'
import {
  Receipt,
  Headphones,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Send,
  Loader2,
  X,
  CreditCard,
  Building2,
  MessageSquare
} from 'lucide-react'

export default function ParentTuitionAndRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xs font-bold font-heading">Đang tải học phí và yêu cầu...</span>
        </div>
      }
    >
      <ParentTuitionAndRequestsContent />
    </Suspense>
  )
}

function ParentTuitionAndRequestsContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') || 'LEAVE'
  const { parent, selectedStudent, isLoading } = useParent()
  const [data, setData] = useState<any>(null)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [activeTab, setActiveTab] = useState<'TUITION' | 'REQUESTS'>('TUITION')

  // Request form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestType, setRequestType] = useState<string>(initialType)
  const [requestContent, setRequestContent] = useState<string>('')
  const [requestPriority, setRequestPriority] = useState<string>('NORMAL')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchData = () => {
    if (!selectedStudent?.id) return
    setIsFetchingData(true)
    fetch(`/api/parent/data?studentId=${selectedStudent.id}`, {
      credentials: 'include'
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setData(res.data)
        }
      })
      .catch((e) => console.error('Failed to fetch data:', e))
      .finally(() => setIsFetchingData(false))
  }

  useEffect(() => {
    fetchData()
  }, [selectedStudent?.id])

  useEffect(() => {
    if (searchParams.get('type')) {
      setActiveTab('REQUESTS')
      setIsModalOpen(true)
    }
  }, [searchParams])

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent?.id || !requestContent.trim()) {
      setSubmitError('Vui lòng nhập nội dung yêu cầu')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/parent/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          type: requestType,
          content: requestContent,
          priority: requestPriority
        }),
        credentials: 'include'
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Gửi yêu cầu thất bại')
      }

      setSubmitSuccess('Đã gửi yêu cầu thành công!')
      setRequestContent('')
      setTimeout(() => {
        setIsModalOpen(false)
        setSubmitSuccess(null)
        fetchData()
      }, 1200)
    } catch (err: any) {
      setSubmitError(err.message || 'Lỗi gửi yêu cầu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isFetchingData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-bold font-heading">Đang tải học phí và yêu cầu...</span>
      </div>
    )
  }

  const orders = data?.orders || []
  const supportRequests = data?.supportRequests || []

  return (
    <div className="space-y-4">
      {/* Top Controls: Tabs & New Request Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="p-1 rounded-2xl bg-muted/60 border border-border/70 grid grid-cols-2 gap-1 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('TUITION')}
            className={`py-2 px-2.5 rounded-xl text-xs font-extrabold font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'TUITION'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Receipt className="h-3.5 w-3.5 text-primary" />
            <span>Học phí ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REQUESTS')}
            className={`py-2 px-2.5 rounded-xl text-xs font-extrabold font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'REQUESTS'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Headphones className="h-3.5 w-3.5 text-[#0284C7]" />
            <span>Yêu cầu ({supportRequests.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-3 rounded-2xl bg-gradient-to-tr from-[#F2994A] to-[#EA580C] text-white font-extrabold text-xs shadow-md shadow-[#F2994A]/30 flex items-center gap-1.5 shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Gửi yêu cầu</span>
        </button>
      </div>

      {/* Tab 4.1: Tuition Orders */}
      {activeTab === 'TUITION' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-3xl border border-border/70 text-muted-foreground space-y-2">
              <Receipt className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-medium">Chưa có thông tin đơn hàng hoặc phiếu thu học phí.</p>
            </div>
          ) : (
            orders.map((ord: any) => {
              const isPaid = ord.status === 'PAID'
              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-3xl bg-card border-1.5 border-border/80 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-primary">{ord.code}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {isPaid ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-foreground font-heading truncate">
                        {ord.course?.name || 'Khóa học'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black font-mono text-foreground">
                        {Number(ord.amount).toLocaleString('vi-VN')} đ
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{ord.facility?.name || 'Cơ sở đào tạo'}</span>
                    </div>
                    <span>Người thanh toán: <strong>{ord.parentName}</strong></span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab 4.2: Support Requests */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-3">
          {supportRequests.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-3xl border border-border/70 text-muted-foreground space-y-2">
              <Headphones className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-medium">Chưa có yêu cầu hỗ trợ hoặc đơn xin nghỉ nào.</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Tạo yêu cầu đầu tiên
              </button>
            </div>
          ) : (
            supportRequests.map((req: any) => {
              const typeLabels: Record<string, { label: string; color: string }> = {
                LEAVE: { label: 'Xin nghỉ học', color: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200' },
                INFO: { label: 'Hỏi thông tin', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200' },
                SUPPORT: { label: 'Hỗ trợ kỹ thuật / học vụ', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' },
                COMPLAINT: { label: 'Góp ý / Khiếu nại', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' },
                CALL_BACK: { label: 'Yêu cầu gọi lại', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' }
              }

              const statusLabels: Record<string, { label: string; color: string }> = {
                NEW: { label: 'Tiếp nhận', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200' },
                IN_PROGRESS: { label: 'Đang xử lý', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
                RESOLVED: { label: 'Đã xử lý', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
                CLOSED: { label: 'Hoàn tất', color: 'bg-muted text-muted-foreground' }
              }

              const typeInfo = typeLabels[req.type] || { label: req.type, color: 'bg-muted text-foreground' }
              const statusInfo = statusLabels[req.status] || { label: req.status, color: 'bg-muted text-foreground' }

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-3xl bg-card border-1.5 border-border/80 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    {req.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                    <span>{new Date(req.createdAt).toLocaleString('vi-VN')}</span>
                    {req.assignee && (
                      <span>Phụ trách: <strong>{req.assignee.name}</strong></span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Modal Create Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-card border-2 border-border/80 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#F2994A] to-[#EA580C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Headphones className="h-4 w-4" />
                </div>
                <h3 className="font-heading font-black text-sm text-foreground">Gửi yêu cầu tới Trung tâm</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300 text-xs font-semibold">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-3">
              {/* Type Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground font-heading">
                  Loại yêu cầu
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground focus:border-primary focus:outline-hidden"
                >
                  <option value="LEAVE">Xin nghỉ học / Báo vắng</option>
                  <option value="SUPPORT">Xin học bù / Chuyển ca</option>
                  <option value="INFO">Hỏi thông tin học phí & khóa học</option>
                  <option value="COMPLAINT">Góp ý chất lượng đào tạo</option>
                  <option value="CALL_BACK">Yêu cầu giáo viên / CSKH gọi lại</option>
                </select>
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground font-heading">
                  Nội dung chi tiết
                </label>
                <textarea
                  value={requestContent}
                  onChange={(e) => setRequestContent(e.target.value)}
                  placeholder="Ví dụ: Xin phép cho bé Minh Khang nghỉ buổi học thứ 7 ngày 15/09 do gia đình có việc..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-background border border-border/80 text-xs text-foreground focus:border-primary focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#F2994A] to-[#E08E58] text-white font-extrabold text-xs shadow-md shadow-[#F2994A]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Gửi ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
