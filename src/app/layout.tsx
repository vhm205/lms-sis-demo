import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Nunito } from "next/font/google";
import "./globals.css";
import { OrchexaWidget } from "@/components/OrchexaWidget";
import { ThemeProvider } from "@/components/theme-provider";
import { FacilityProvider } from "@/components/facility-provider";
import { PwaUpdatePrompt } from "@/components/pwa-update-prompt";
import NextTopLoader from "nextjs-toploader";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "EduCenter VN • Hệ thống LMS & SIS Quản trị Trung tâm",
  description: "Trung tâm quản trị đào tạo, học viên, lịch học và nền tảng AI Agent Orchexa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${plusJakarta.variable} ${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-200" suppressHydrationWarning>
        <NextTopLoader
          color="#F2994A"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #F2994A,0 0 5px #EA580C"
          zIndex={99999}
        />
        <ThemeProvider defaultTheme="light">
          <FacilityProvider>
            {children}
            <OrchexaWidget />
            <PwaUpdatePrompt />
          </FacilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
