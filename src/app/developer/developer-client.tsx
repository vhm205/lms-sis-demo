"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck,
  Cpu,
  Sparkles,
  Bot
} from "lucide-react";

export function DeveloperClient() {
  const [activeTab, setActiveTab] = useState<"orchexa" | "api" | "mcp" | "auth">("orchexa");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [bootstrapResult, setBootstrapResult] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const apis = [
    { method: "GET", path: "/api/students/search?query=...", desc: "Tìm kiếm học viên theo họ tên, mã HV hoặc SĐT phụ huynh." },
    { method: "GET", path: "/api/students/:id", desc: "Lấy chi tiết hồ sơ, điểm danh và kết quả bài tập của học viên." },
    { method: "GET", path: "/api/parent/my-children", desc: "API tự phục vụ (Self-Service) dành cho phụ huynh đang đăng nhập." },
    { method: "POST", path: "/api/requests/makeup", desc: "Đăng ký học bù có kiểm tra tự động trạng thái vắng mặt." },
    { method: "POST", path: "/api/requests/support", desc: "Tạo ticket hỗ trợ (xin nghỉ phép, bảo lưu, giải đáp thắc mắc)." },
    { method: "POST", path: "/api/orders", desc: "Tạo đơn đăng ký khóa học mới từ AI Agent hoặc CRM." }
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-primary border-primary">Orchexa Embedded AI & API Hub</Badge>
          <Badge variant="secondary">Production Ready</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Trung tâm Tích hợp & Điều hành AI Agent</h1>
        <p className="text-muted-foreground mt-1">
          Tài liệu tích hợp Orchexa Embedded AI, BFF HMAC-SHA256 Token Signer, Context Injection và REST APIs.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button 
          variant={activeTab === "orchexa" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("orchexa")}
          className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
        >
          <Bot className="h-4 w-4" /> Orchexa Embedded AI
        </Button>
        <Button 
          variant={activeTab === "api" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("api")}
          className="gap-2"
        >
          <Globe className="h-4 w-4" /> REST APIs
        </Button>
        <Button 
          variant={activeTab === "mcp" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("mcp")}
          className="gap-2"
        >
          <Cpu className="h-4 w-4" /> Model Context Protocol (MCP)
        </Button>
        <Button 
          variant={activeTab === "auth" ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab("auth")}
          className="gap-2"
        >
          <ShieldCheck className="h-4 w-4" /> Security & Auth
        </Button>
      </div>

      {activeTab === "orchexa" && (
        <div className="flex flex-col gap-8">
          <Card className="border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Orchexa Embedded AI Platform</CardTitle>
                    <CardDescription className="text-sm">
                      Tích hợp AI Agent (Agent ID: <code className="font-mono font-semibold text-primary">911aa67c-1a89-4418-ac9e-f451c51a0629</code>) qua kiến trúc BFF bảo mật tuyệt đối.
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hệ thống BFF (Backend-for-Frontend) thực hiện ký HMAC SHA-256 đối với mọi yêu cầu khởi tạo phiên làm việc (Session Token), tiêm toàn bộ hồ sơ CRM của phụ huynh vào ngữ cảnh đầu tiên (Context Injection).
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Kiểm thử trực tiếp Endpoint `/api/ai/bootstrap`
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Gửi request POST tới BFF để kiểm tra HMAC Signature và lấy Session Token từ Orchexa API.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  disabled={isBootstrapping}
                  onClick={async () => {
                    setIsBootstrapping(true);
                    setBootstrapResult(null);
                    try {
                      const res = await fetch("/api/ai/bootstrap", { method: "POST" });
                      const json = await res.json();
                      setBootstrapResult(JSON.stringify(json, null, 2));
                    } catch (err: any) {
                      setBootstrapResult(JSON.stringify({ error: err.message }, null, 2));
                    } finally {
                      setIsBootstrapping(false);
                    }
                  }}
                  className="gap-2 text-xs"
                >
                  {isBootstrapping ? "Đang kết nối..." : "Gửi Bootstrap Request"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bootstrapResult ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Kết quả trả về từ `/api/ai/bootstrap`:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => copyToClipboard(bootstrapResult, "bootstrap-res")}
                    >
                      {copiedKey === "bootstrap-res" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copy Response
                    </Button>
                  </div>
                  <pre className="p-3.5 rounded-md bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto border max-h-60">
                    {bootstrapResult}
                  </pre>
                </div>
              ) : (
                <div className="p-4 rounded-md border border-dashed text-center text-xs text-muted-foreground">
                  Nhấn nút &ldquo;Gửi Bootstrap Request&rdquo; để kiểm tra luồng tạo session token thực tế với Orchexa API.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1 font-bold text-xs">1</div>
                <CardTitle className="text-sm">BFF HMAC-SHA256</CardTitle>
                <CardDescription className="text-xs">Bảo mật khóa bí mật ở Server</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Chuỗi canonical POST /api/v1/embedded/sessions được ký bằng <code>ORCHEXA_CLIENT_SECRET</code>.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="h-7 w-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1 font-bold text-xs">2</div>
                <CardTitle className="text-sm">Rich Context Injection</CardTitle>
                <CardDescription className="text-xs">Tiêm hồ sơ phụ huynh & học sinh</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Dữ liệu học viên, lớp học, điểm danh gần nhất, bài tập, đơn hàng được đính kèm vào <code>initial_context.customer</code>.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="h-7 w-7 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-1 font-bold text-xs">3</div>
                <CardTitle className="text-sm">Native VoiceAgent SDK</CardTitle>
                <CardDescription className="text-xs">Quản lý phiên & lịch sử hội thoại</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                SDK tự động quản lý chuyển cuộc trò chuyện, xem lịch sử gần đây, auto-restore và auto-refresh token mỗi 5 phút.
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "api" && (
        <div className="flex flex-col gap-4">
          {apis.map((api, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Badge variant={api.method === "GET" ? "secondary" : "default"}>{api.method}</Badge>
                  <code className="font-mono text-sm font-semibold">{api.path}</code>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{api.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "mcp" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Giao thức Model Context Protocol (MCP)</CardTitle>
              <CardDescription className="text-xs">
                EduCenter VN hỗ trợ bộ công cụ MCP JSON-RPC qua stdio (<code>npm run mcp</code>) cho Claude Desktop, Cursor và AI Agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-md bg-muted text-xs font-mono text-foreground">
                npx tsx src/mcp.ts
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "auth" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mô hình Phân quyền & RBAC</CardTitle>
              <CardDescription className="text-xs">
                Cơ chế xác thực hỗ trợ cả Per-User Bearer Token và Signed Actor Context.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tất cả request từ phụ huynh tự phục vụ hoặc AI Agent đều được kiểm tra danh tính và giới hạn dữ liệu chỉ trong phạm vi các con của phụ huynh đó.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
