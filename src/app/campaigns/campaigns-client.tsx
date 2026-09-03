"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Tag, 
  Calendar, 
  Building2, 
  Plus, 
  Copy, 
  Check, 
  Bot, 
  ExternalLink, 
  Percent, 
  Package, 
  ChevronRight, 
  ShoppingBag,
  Send,
  MessageSquare,
  Gift,
  Search,
  Filter,
  Layers,
  X,
  Edit,
  Trash2,
  Power,
  Info,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CampaignItem {
  id: string;
  campaignId: string;
  courseId: string | null;
  productCode: string;
  name: string;
  title: string | null;
  description: string;
  imageUrl: string;
  listPrice: number;
  salePrice: number;
  discountPercent: number | null;
  stock: number;
  featured: boolean;
  orderIndex: number;
  targetAudience: string | null;
  primaryBtnLabel: string | null;
  primaryBtnMsg: string | null;
  secondaryBtnLabel: string | null;
  secondaryBtnMsg: string | null;
  course?: {
    id: string;
    name: string;
    code: string;
    fee: number | null;
  } | null;
}

interface Campaign {
  id: string;
  code: string;
  title: string;
  description: string | null;
  badge: string | null;
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
  bannerUrl: string | null;
  facilityId: string | null;
  facility?: {
    id: string;
    name: string;
  } | null;
  items: CampaignItem[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  fee: number | null;
}

interface Facility {
  id: string;
  name: string;
}

export function CampaignsClient({
  campaigns: initialCampaigns,
  courses,
  facilities,
}: {
  campaigns: Campaign[];
  courses: Course[];
  facilities: Facility[];
}) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Live Carousel Preview State (Simulating Orchexa Chat Widget)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    initialCampaigns[0]?.id || ""
  );
  const [activePreviewTab, setActivePreviewTab] = useState<"chat" | "explain">("chat");
  const [simulatedChatHistory, setSimulatedChatHistory] = useState<
    Array<{ sender: "bot" | "user"; text: string; time: string; toolCalled?: string }>
  >([
    {
      sender: "bot",
      text: "Chào anh/chị! EduCenter đang có các chương trình ưu đãi học phí rất hấp dẫn cho học viên mới và tái tục:",
      time: "Vừa xong",
    },
  ]);

  // Modal Create Campaign State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBadge, setNewBadge] = useState("GIẢM 20%");
  const [newType, setNewType] = useState("PROMOTION");
  const [newFacilityId, setNewFacilityId] = useState("all");
  const [newDesc, setNewDesc] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [newItemSalePrice, setNewItemSalePrice] = useState("");
  const [newItemStock, setNewItemStock] = useState("10");

  // Modal Edit Campaign State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [editType, setEditType] = useState("PROMOTION");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editFacilityId, setEditFacilityId] = useState("all");
  const [editDesc, setEditDesc] = useState("");
  const [editItems, setEditItems] = useState<CampaignItem[]>([]);

  // Modal Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");
  const totalProducts = campaigns.reduce((acc, c) => acc + c.items.length, 0);
  const totalStock = campaigns.reduce(
    (acc, c) => acc + c.items.reduce((sAcc, i) => sAcc + i.stock, 0),
    0
  );

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentPreviewCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  // Quick Toggle Active/Paused Status
  const handleToggleStatus = async (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    const nextStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: nextStatus } : c))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (e: React.MouseEvent, camp: Campaign) => {
    e.stopPropagation();
    setEditingCampaign(camp);
    setEditCode(camp.code);
    setEditTitle(camp.title);
    setEditBadge(camp.badge || "");
    setEditType(camp.type);
    setEditStatus(camp.status);
    setEditFacilityId(camp.facilityId || "all");
    setEditDesc(camp.description || "");
    setEditItems([...camp.items]);
    setIsEditOpen(true);
  };

  // Submit Edit Campaign
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    setIsSubmitting(true);
    try {
      const payload = {
        code: editCode,
        title: editTitle,
        badge: editBadge,
        type: editType,
        status: editStatus,
        facilityId: editFacilityId === "all" ? null : editFacilityId,
        description: editDesc,
        items: editItems.map((item, idx) => ({
          productCode: item.productCode || `${editCode}-ITM-${idx + 1}`,
          courseId: item.courseId || null,
          name: item.name,
          title: item.title || item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          listPrice: Number(item.listPrice) || 0,
          salePrice: Number(item.salePrice) || 0,
          discountPercent: item.discountPercent ? Number(item.discountPercent) : null,
          stock: Number(item.stock) || 10,
          featured: Boolean(item.featured),
          primaryBtnLabel: item.primaryBtnLabel || "Nhận voucher",
          primaryBtnMsg: item.primaryBtnMsg,
          secondaryBtnLabel: item.secondaryBtnLabel || "Xem chi tiết",
          secondaryBtnMsg: item.secondaryBtnMsg,
        })),
      };

      const res = await fetch(`/api/campaigns/${editingCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaign.id ? data.data : c))
        );
        setIsEditOpen(false);
      } else {
        alert(data.error || "Có lỗi xảy ra khi cập nhật chiến dịch");
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (e: React.MouseEvent, camp: Campaign) => {
    e.stopPropagation();
    setDeletingCampaign(camp);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingCampaign) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/campaigns/${deletingCampaign.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const nextList = campaigns.filter((c) => c.id !== deletingCampaign.id);
        setCampaigns(nextList);
        if (selectedCampaignId === deletingCampaign.id) {
          setSelectedCampaignId(nextList[0]?.id || "");
        }
        setIsDeleteOpen(false);
        setDeletingCampaign(null);
      } else {
        alert(data.error || "Không thể xóa chiến dịch");
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Simulated CTA Actions representing Orchexa's true execution loop
  const handleSimulatedCardAction = (prod: CampaignItem, actionType: "primary" | "secondary") => {
    const isOrderAction = 
      prod.primaryBtnLabel?.toLowerCase().includes("đăng ký") ||
      prod.primaryBtnMsg?.toLowerCase().includes("đăng ký");

    if (actionType === "primary") {
      const userMsg = (prod.primaryBtnMsg || `Tôi muốn nhận ưu đãi cho khóa {name}`)
        .replace("{name}", prod.name)
        .replace("{price}", prod.salePrice.toLocaleString("vi-VN") + "đ");

      if (isOrderAction) {
        // Luồng 1: Đăng ký ngay -> Agent kích hoạt tool create_order
        setSimulatedChatHistory((prev) => [
          ...prev,
          { sender: "user", text: userMsg, time: "Vừa xong" },
          {
            sender: "bot",
            text: `Dạ tuyệt vời ạ! Em đã tiếp nhận đăng ký của anh/chị cho khóa **${prod.name}** với mức giá ưu đãi **${prod.salePrice.toLocaleString("vi-VN")}đ** (đã giảm từ ${prod.listPrice.toLocaleString("vi-VN")}đ).\n\n📄 **Mã đơn hàng tạm tính:** \`ORD-${Date.now().toString().slice(-6)}\`\nBộ phận học vụ cơ sở sẽ liên hệ để xác nhận lịch học bù/lịch chính thức và gửi mã thanh toán VietQR cho anh/chị ngay nhé!`,
            time: "Vừa xong",
            toolCalled: "MCP: create_order",
          },
        ]);
      } else {
        // Luồng 2: Nhận voucher / Nhận ưu đãi % -> Agent cấp mã & giữ chỗ
        const voucherCode = `VOUCHER-${prod.productCode.split("-")[0]}-${prod.discountPercent || 20}`;
        setSimulatedChatHistory((prev) => [
          ...prev,
          { sender: "user", text: userMsg, time: "Vừa xong" },
          {
            sender: "bot",
            text: `Dạ em xin gửi anh/chị mã ưu đãi đặc biệt: 🎟️ **\`${voucherCode}\`** (Giảm ${prod.discountPercent || 20}% trực tiếp vào học phí khóa **${prod.name}**).\n\nSố lượng chỉ còn **${prod.stock} suất**. Anh/chị có muốn em chuyển thông tin giữ chỗ lớp gần nhất cho bé tại trung tâm không ạ?`,
            time: "Vừa xong",
            toolCalled: "Orchexa: voucher_redeem",
          },
        ]);
      }
    } else {
      // Luồng 3: Xem chi tiết / Lộ trình -> Agent tư vấn sâu
      const userMsg = (prod.secondaryBtnMsg || `Tư vấn thêm cho tôi về khóa {name}`)
        .replace("{name}", prod.name);

      setSimulatedChatHistory((prev) => [
        ...prev,
        { sender: "user", text: userMsg, time: "Vừa xong" },
        {
          sender: "bot",
          text: `Dạ khóa học **${prod.name}** có thời lượng chương trình chuẩn quốc tế, trang bị toàn diện kỹ năng và phương pháp phản xạ tương tác. Học viên được học với giáo viên bản ngữ kết hợp trợ giảng hỗ trợ 1 kèm 1.\n\n🔗 Anh/chị có thể xem thông tin chi tiết các lớp đang mở tại mục: [Chương trình & Khóa học](/courses) hoặc nhắn em để được xếp lịch test trình độ miễn phí nhé!`,
          time: "Vừa xong",
          toolCalled: "MCP: find_available_classes",
        },
      ]);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    setIsSubmitting(true);
    try {
      const selectedCourse = courses.find((c) => c.id === selectedCourseId);
      const listPrice = selectedCourse?.fee || 4000000;
      const salePrice = Number(newItemSalePrice) || listPrice * 0.8;
      const discountPercent = Math.round(((listPrice - salePrice) / listPrice) * 100);

      const payload = {
        code: newCode,
        title: newTitle,
        badge: newBadge,
        type: newType,
        description: newDesc,
        status: "ACTIVE",
        facilityId: newFacilityId === "all" ? null : newFacilityId,
        items: selectedCourse
          ? [
              {
                productCode: `${newCode}-${selectedCourse.code}`,
                courseId: selectedCourse.id,
                name: selectedCourse.name,
                title: selectedCourse.name,
                description: `Ưu đãi ${discountPercent}% học phí khi đăng ký chiến dịch ${newTitle}`,
                imageUrl:
                  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
                listPrice,
                salePrice,
                discountPercent,
                stock: Number(newItemStock) || 10,
                featured: true,
              },
            ]
          : [],
      };

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCampaigns([data.data, ...campaigns]);
        setSelectedCampaignId(data.data.id);
        setIsCreateOpen(false);
        setNewCode("");
        setNewTitle("");
        setNewDesc("");
        router.refresh();
      } else {
        alert(data.error || "Có lỗi xảy ra khi tạo chiến dịch");
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="clay-card border-2 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="clay-icon-tile h-10 w-10 bg-[#FFF7ED] text-[#EA580C] dark:bg-[#381F13] dark:text-[#FB923C] shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase font-heading">
                Chiến dịch Đang chạy
              </p>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-foreground">
                {activeCampaigns.length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="clay-card border-2 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="clay-icon-tile h-10 w-10 bg-[#F0FDF4] text-[#16A34A] dark:bg-[#142A1D] dark:text-[#86EFAC] shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase font-heading">
                Khóa học / Sản phẩm ưu đãi
              </p>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-foreground">
                {totalProducts}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="clay-card border-2 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="clay-icon-tile h-10 w-10 bg-[#EFF6FF] text-[#2563EB] dark:bg-[#172554] dark:text-[#93C5FD] shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase font-heading">
                Tổng suất ưu đãi (Stock)
              </p>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-foreground">
                {totalStock} suất
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="clay-card border-2 border-border/80">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="clay-icon-tile h-10 w-10 bg-[#FAF5FF] text-[#9333EA] dark:bg-[#2E1065] dark:text-[#D8B4FE] shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase font-heading">
                MCP Tool AI Agent
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-mono font-bold text-primary">get_promotions</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Quick Integration & MCP Copy Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF0E6] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2C1D14] dark:via-[#211D1A] dark:to-[#0E2630] border-2 border-[#EEDBCC] dark:border-[#3E3228] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-md">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-heading font-extrabold text-sm text-foreground">
              Tích hợp Trực tiếp với Orchexa AI Agent Rich Card
            </h4>
            <p className="text-xs text-muted-foreground font-medium">
              API và MCP Tool tự động xuất danh sách sản phẩm theo đúng cấu trúc Carousel Card (Name, Price, Discount, Image, CTA Buttons).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl text-xs font-bold gap-1.5 bg-card/80 border-2 border-border/80"
            onClick={() => copyToClipboard("/api/campaigns/products", "api")}
          >
            {copiedText === "api" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy API Carousel</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl text-xs font-bold gap-1.5 bg-card/80 border-2 border-border/80"
            onClick={() => copyToClipboard("get_promotions", "mcp")}
          >
            {copiedText === "mcp" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Tool: get_promotions</span>
          </Button>

          <Link href="/developer">
            <Button size="sm" variant="default" className="rounded-2xl text-xs font-bold gap-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white">
              <Bot className="h-3.5 w-3.5" />
              <span>Test trong Developer Hub</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Main 2-Column Layout: Campaigns List & Live Orchexa Carousel Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Campaigns Management (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm chiến dịch hoặc khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-2xl border-2 text-xs h-10"
                />
              </div>

              <div className="flex items-center gap-1">
                {["ALL", "ACTIVE", "PAUSED", "EXPIRED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-2 text-xs font-bold rounded-2xl transition-all ${
                      statusFilter === st
                        ? "bg-primary text-white shadow-xs"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "ALL" ? "Tất cả" : st === "ACTIVE" ? "Đang chạy" : st === "PAUSED" ? "Tạm dừng" : "Hết hạn"}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-2xl text-xs font-bold gap-1.5 bg-gradient-to-r from-[#F2994A] to-[#E08E58] text-white shadow-md shadow-[#E08E58]/30 h-10 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo chiến dịch mới</span>
            </Button>
          </div>

          {/* Campaign Cards List */}
          <div className="space-y-4">
            {filteredCampaigns.map((camp) => {
              const isSelected = camp.id === selectedCampaignId;
              const formattedStartDate = new Date(camp.startDate).toLocaleDateString("vi-VN");
              const formattedEndDate = new Date(camp.endDate).toLocaleDateString("vi-VN");

              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer bg-card/95 hover:shadow-lg relative group ${
                    isSelected
                      ? "border-[#EA580C] ring-2 ring-[#EA580C]/20 shadow-md"
                      : "border-border/80 hover:border-border"
                  }`}
                >
                  {/* Top Bar: Code, Badge, Dates, and Action Buttons (Edit, Delete, Power) */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-xl bg-muted text-foreground border border-border/60">
                        {camp.code}
                      </span>
                      {camp.badge && (
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#EA580C] dark:bg-[#352114] dark:text-[#FBAA78] border border-[#FCDCC8] dark:border-[#4B301E]">
                          {camp.badge}
                        </span>
                      )}
                      
                      {/* Clickable Quick Status Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(e, camp)}
                        title="Bấm để chuyển đổi trạng thái Bật / Tạm dừng"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition-all ${
                          camp.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : camp.status === "PAUSED"
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${camp.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                        <span>{camp.status === "ACTIVE" ? "Đang chạy" : camp.status === "PAUSED" ? "Tạm dừng" : "Hết hạn"}</span>
                      </button>
                    </div>

                    {/* Action Tool Buttons: Edit & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Chỉnh sửa chiến dịch"
                        onClick={(e) => handleOpenEdit(e, camp)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Xóa chiến dịch này"
                        onClick={(e) => handleOpenDelete(e, camp)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formattedStartDate} - {formattedEndDate}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-foreground mb-1">
                    {camp.title}
                  </h3>
                  {camp.description && (
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-3">
                      {camp.description}
                    </p>
                  )}

                  {/* Facility Pill */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {camp.facility ? camp.facility.name : "Áp dụng toàn bộ cơ sở"}
                    </span>
                  </div>

                  {/* Items inside campaign */}
                  <div className="pt-3 border-t border-border/70 space-y-2">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase font-heading flex items-center justify-between">
                      <span>Sản phẩm & Khóa học trong chiến dịch ({camp.items.length})</span>
                      <span className="text-primary hover:underline text-[11px]">
                        Xem trên Carousel &rarr;
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {camp.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center gap-2.5"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-12 w-12 rounded-xl object-cover shrink-0 border border-border/60"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-foreground truncate font-heading">
                              {item.name}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-bold text-red-600 dark:text-red-400">
                                {item.salePrice.toLocaleString("vi-VN")}đ
                              </span>
                              <span className="text-[10px] line-through text-muted-foreground">
                                {item.listPrice.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5 flex items-center gap-2">
                              <span>Còn {item.stock} suất</span>
                              {item.targetAudience && (
                                <span className="font-mono text-[9px] px-1 rounded bg-muted">
                                  {item.targetAudience}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Orchexa Rich Card Carousel Preview & Button Behavior Simulator (5 cols) */}
        <div className="xl:col-span-5">
          <div className="sticky top-20 rounded-3xl border-2 border-border/80 bg-card p-4 sm:p-5 shadow-xl">
            {/* Widget Simulated Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    <span>Student Success AI Agent</span>
                  </h4>
                  <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-2">
                    <span>DEPLOY:</span>
                    <span className="text-primary font-bold">Website</span>
                    <span>•</span>
                    <span>Messenger</span>
                    <span>•</span>
                    <span>Zalo</span>
                  </div>
                </div>
              </div>

              {/* View Switcher: Live Chat vs Explanation */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-muted/60 border border-border/60">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("chat")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    activePreviewTab === "chat" ? "bg-card text-primary shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Live Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("explain")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    activePreviewTab === "explain" ? "bg-card text-primary shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Luồng Thực Thi
                </button>
              </div>
            </div>

            {/* Tab 1: Live Chat Simulator */}
            {activePreviewTab === "chat" ? (
              <>
                {/* Simulated Chat Messages */}
                <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1 text-xs">
                  {simulatedChatHistory.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${
                        chat.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {chat.sender === "bot" && (
                        <div className="h-6 w-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          S
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl max-w-[88%] font-medium leading-relaxed ${
                          chat.sender === "user"
                            ? "bg-[#EA580C] text-white rounded-tr-none shadow-xs"
                            : "bg-muted/70 text-foreground rounded-tl-none border border-border/60"
                        }`}
                      >
                        {chat.toolCalled && (
                          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2 py-0.5 rounded-md w-fit">
                            <Bot className="h-3 w-3" />
                            <span>Kích hoạt: {chat.toolCalled}</span>
                          </div>
                        )}
                        <div className="whitespace-pre-line">{chat.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rich Card Carousel (Horizontal Scroll as in Orchexa Widget Screenshot) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider font-heading flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Carousel Khóa Học Ưu Đãi
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Bấm vào nút để test luồng
                    </span>
                  </div>

                  {currentPreviewCampaign?.items && currentPreviewCampaign.items.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin">
                      {currentPreviewCampaign.items.map((prod) => (
                        <div
                          key={prod.id}
                          className="min-w-[240px] max-w-[240px] rounded-2xl border-2 border-border/90 bg-card overflow-hidden shadow-md shrink-0 snap-start flex flex-col justify-between"
                        >
                          {/* Product Image */}
                          <div className="relative h-28 w-full bg-muted overflow-hidden">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="h-full w-full object-cover"
                            />
                            {prod.discountPercent && (
                              <span className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-md">
                                -{prod.discountPercent}%
                              </span>
                            )}
                            {prod.featured && (
                              <span className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-md">
                                Nổi bật
                              </span>
                            )}
                          </div>

                          {/* Product Content */}
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-heading font-extrabold text-xs text-foreground line-clamp-1 mb-1">
                                {prod.name}
                              </h4>
                              <div className="flex items-baseline gap-1.5 mb-2">
                                <span className="text-sm font-black text-red-600 dark:text-red-400 font-heading">
                                  {prod.salePrice.toLocaleString("vi-VN")}đ
                                </span>
                                <span className="text-[11px] line-through text-muted-foreground">
                                  {prod.listPrice.toLocaleString("vi-VN")}đ
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-relaxed mb-3">
                                {prod.description}
                              </p>
                            </div>

                            {/* CTA Buttons Configured as in Screenshot 2 */}
                            <div className="space-y-1.5 pt-2 border-t border-border/60">
                              <button
                                type="button"
                                onClick={() => handleSimulatedCardAction(prod, "primary")}
                                className="w-full py-1.5 px-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>{prod.primaryBtnLabel || "Nhận voucher"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSimulatedCardAction(prod, "secondary")}
                                className="w-full py-1.5 px-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition-colors border border-border/60 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>{prod.secondaryBtnLabel || "Xem chi tiết"}</span>
                              </button>

                              <div className="text-center text-[10px] text-muted-foreground font-medium pt-0.5">
                                Còn {prod.stock} suất ưu đãi
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground bg-muted/30 rounded-2xl border border-dashed">
                      Chiến dịch này chưa có sản phẩm ưu đãi nào.
                    </div>
                  )}
                </div>

                {/* Widget Input Placeholder */}
                <div className="p-2.5 bg-muted/40 rounded-2xl border border-border/80 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-medium pl-1">
                    Hỏi thêm về các khóa học hoặc ưu đãi...
                  </span>
                  <div className="h-7 w-7 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                    <Send className="h-3.5 w-3.5" />
                  </div>
                </div>
              </>
            ) : (
              /* Tab 2: Orchexa Execution Flow Explanation */
              <div className="space-y-3.5 text-xs text-muted-foreground">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Info className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Cơ chế Hành Động của Button trong Orchexa Dashboard</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Trong Orchexa widget builder (như ảnh bạn chụp), mỗi button được cấu hình một <strong>Action</strong> (Chat message hoặc Open URL) kèm <strong>Message template</strong>.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
                    <div className="font-heading font-extrabold text-xs text-foreground mb-1 flex items-center gap-1.5">
                      <Badge variant="default" className="text-[9px] px-1.5">1</Badge>
                      <span>Khi bấm: "Nhận ưu đãi 25%" / "Nhận voucher"</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                      <li><strong>Action:</strong> <code>Chat message</code></li>
                      <li><strong>Template:</strong> <code>Tôi muốn nhận ưu đãi 25% cho khóa &#123;name&#125;</code></li>
                      <li><strong>Hành vi Orchexa:</strong> AI Agent nhận diện intent muốn lấy ưu đãi &rarr; Phản hồi cấp mã voucher độc quyền &rarr; Chủ động hỏi giữ chỗ lớp học bù/lớp mới tại cơ sở gần nhất.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
                    <div className="font-heading font-extrabold text-xs text-foreground mb-1 flex items-center gap-1.5">
                      <Badge variant="default" className="text-[9px] px-1.5">2</Badge>
                      <span>Khi bấm: "Đăng ký ngay"</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                      <li><strong>Action:</strong> <code>Chat message</code></li>
                      <li><strong>Template:</strong> <code>Tôi muốn đăng ký ghi danh khóa &#123;name&#125; với giá &#123;price&#125;</code></li>
                      <li><strong>Hành vi Orchexa:</strong> AI Agent tự động gọi MCP Tool <strong><code>create_order</code></strong> &rarr; Tạo đơn đăng ký PENDING trong hệ thống SIS với giá <code>sale_price</code> &rarr; Xuất mã đơn và hướng dẫn phụ huynh thanh toán VietQR.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
                    <div className="font-heading font-extrabold text-xs text-foreground mb-1 flex items-center gap-1.5">
                      <Badge variant="default" className="text-[9px] px-1.5">3</Badge>
                      <span>Khi bấm: "Xem chi tiết / Lộ trình"</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                      <li><strong>Action:</strong> <code>Chat message</code> hoặc <code>Open URL</code></li>
                      <li><strong>Template:</strong> <code>Tư vấn thêm cho tôi về lộ trình khóa &#123;name&#125;</code></li>
                      <li><strong>Hành vi Orchexa:</strong> Tra cứu kiến thức khóa học trong Knowledge Base và gọi tool <code>find_available_classes</code> để gợi ý ngày học, phòng học, giáo viên phù hợp.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Modal Create Campaign */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-background border-2 border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <div className="clay-icon-tile h-8 w-8 bg-[#FFF7ED] text-[#EA580C]">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="font-heading font-extrabold text-base text-foreground">
                  Tạo Chiến Dịch Khuyến Mãi Mới
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Mã chiến dịch *</label>
                  <Input
                    required
                    placeholder="VD: CAMP-HE-2025"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Badge nổi bật</label>
                  <Input
                    placeholder="VD: GIẢM 20%, FLASH SALE"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Tên chiến dịch *</label>
                <Input
                  required
                  placeholder="VD: Khóa Hè Bùng Nổ - Trọn Vẹn 4 Kỹ Năng"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Mô tả chương trình</label>
                <textarea
                  rows={2}
                  placeholder="Thông tin chi tiết điều kiện áp dụng..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Cơ sở áp dụng</label>
                  <select
                    value={newFacilityId}
                    onChange={(e) => setNewFacilityId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs"
                  >
                    <option value="all">Toàn bộ cơ sở</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Loại chiến dịch</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs"
                  >
                    <option value="PROMOTION">Khuyến mãi thường</option>
                    <option value="UPSELL">Tái tục / Nâng hạng (Upsell)</option>
                    <option value="FLASH_SALE">Flash Sale ngắn hạn</option>
                  </select>
                </div>
              </div>

              {/* Add Initial Product */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                <div className="text-xs font-extrabold font-heading text-foreground">
                  Gán Khóa Học Khuyến Mãi Đầu Tiên
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Chọn khóa học
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs shadow-xs"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.fee ? `${c.fee.toLocaleString("vi-VN")}đ` : "Liên hệ"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Giá khuyến mãi (VND)
                    </label>
                    <Input
                      placeholder="VD: 3200000"
                      value={newItemSalePrice}
                      onChange={(e) => setNewItemSalePrice(e.target.value)}
                      className="rounded-xl text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Số suất giới hạn (Stock)
                    </label>
                    <Input
                      type="number"
                      value={newItemStock}
                      onChange={(e) => setNewItemStock(e.target.value)}
                      className="rounded-xl text-xs bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl text-xs font-bold bg-[#EA580C] hover:bg-[#C2410C] text-white cursor-pointer"
                >
                  {isSubmitting ? "Đang lưu..." : "Tạo & Public ngay"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Edit Campaign */}
      {isEditOpen && editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-background border-2 border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <div className="clay-icon-tile h-8 w-8 bg-[#EFF6FF] text-[#2563EB]">
                  <Edit className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-foreground">
                    Chỉnh Sửa Chiến Dịch: {editingCampaign.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Mã: {editingCampaign.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Mã chiến dịch *</label>
                  <Input
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Badge nổi bật</label>
                  <Input
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    placeholder="VD: HOT SALE 20%"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Tên chiến dịch *</label>
                <Input
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Mô tả chương trình</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Trạng thái</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (Đang chạy)</option>
                    <option value="PAUSED">PAUSED (Tạm dừng)</option>
                    <option value="EXPIRED">EXPIRED (Hết hạn)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Cơ sở áp dụng</label>
                  <select
                    value={editFacilityId}
                    onChange={(e) => setEditFacilityId(e.target.value)}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs"
                  >
                    <option value="all">Toàn bộ cơ sở</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Loại chiến dịch</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs"
                  >
                    <option value="PROMOTION">Khuyến mãi thường</option>
                    <option value="UPSELL">Tái tục / Upsell</option>
                    <option value="FLASH_SALE">Flash Sale</option>
                  </select>
                </div>
              </div>

              {/* Items Management in Edit Modal */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold font-heading text-foreground">
                    Danh Sách Khóa Học Trong Chiến Dịch ({editItems.length})
                  </label>
                </div>

                {editItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold text-xs text-foreground truncate">
                        {idx + 1}. {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.productCode}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Giá gốc (VNĐ)
                        </label>
                        <Input
                          type="number"
                          value={item.listPrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...editItems];
                            updated[idx] = { ...updated[idx], listPrice: val };
                            setEditItems(updated);
                          }}
                          className="rounded-xl text-xs h-8 bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Giá sale ưu đãi (VNĐ)
                        </label>
                        <Input
                          type="number"
                          value={item.salePrice}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...editItems];
                            const listP = updated[idx].listPrice || val;
                            const disc = Math.round(((listP - val) / listP) * 100);
                            updated[idx] = { ...updated[idx], salePrice: val, discountPercent: disc };
                            setEditItems(updated);
                          }}
                          className="rounded-xl text-xs h-8 bg-background text-red-600 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Số suất (Stock)
                        </label>
                        <Input
                          type="number"
                          value={item.stock}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...editItems];
                            updated[idx] = { ...updated[idx], stock: val };
                            setEditItems(updated);
                          }}
                          className="rounded-xl text-xs h-8 bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Label nút CTA chính (Primary)
                        </label>
                        <Input
                          value={item.primaryBtnLabel || ""}
                          onChange={(e) => {
                            const updated = [...editItems];
                            updated[idx] = { ...updated[idx], primaryBtnLabel: e.target.value };
                            setEditItems(updated);
                          }}
                          placeholder="Nhận voucher"
                          className="rounded-xl text-xs h-8 bg-background"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground">
                          Label nút phụ (Secondary)
                        </label>
                        <Input
                          value={item.secondaryBtnLabel || ""}
                          onChange={(e) => {
                            const updated = [...editItems];
                            updated[idx] = { ...updated[idx], secondaryBtnLabel: e.target.value };
                            setEditItems(updated);
                          }}
                          placeholder="Xem chi tiết"
                          className="rounded-xl text-xs h-8 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-2xl text-xs font-bold cursor-pointer"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer"
                >
                  {isSubmitting ? "Đang lưu..." : "Cập nhật chiến dịch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Confirm Delete */}
      {isDeleteOpen && deletingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-background border-2 border-border p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-foreground">
                  Xác nhận xóa chiến dịch
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 my-4 text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Chiến dịch: </span>
                <span className="font-bold text-foreground">{deletingCampaign.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mã: </span>
                <span className="font-mono font-bold text-foreground">{deletingCampaign.code}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Số sản phẩm liên kết: </span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {deletingCampaign.items.length} sản phẩm
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Các sản phẩm trong chiến dịch này sẽ lập tức bị gỡ khỏi feed API và MCP Tool của AI Agent Orchexa.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeletingCampaign(null);
                }}
                className="rounded-2xl text-xs font-bold cursor-pointer"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="rounded-2xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                {isDeleting ? "Đang xóa..." : "Xác nhận xóa vĩnh viễn"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
