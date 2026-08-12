import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers";
import { AuthGate } from "@/components/auth/AuthGate";
import { ToastProvider } from "@/components/ui/toast";
import { ComplaintsCacheProvider } from "@/components/complaints/ComplaintsCache";
import { ComplaintsCacheReset } from "@/components/complaints/ComplaintsCacheReset";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hinza Complaints",
  description: "File and review company complaints",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hinza",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0108B8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh font-sans">
        <AuthProvider>
          <ComplaintsCacheProvider>
            <ComplaintsCacheReset />
            <ToastProvider>
              <AuthGate>{children}</AuthGate>
            </ToastProvider>
          </ComplaintsCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
