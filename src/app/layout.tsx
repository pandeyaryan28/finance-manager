import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ModalProvider } from "@/lib/ModalContext";
import { TransactionModals, CreditSpendModal } from "@/components/ui/TransactionModals";
import { CategoryModal } from "@/components/ui/CategoryModal";
import { AccountModal } from "@/components/ui/AccountModal";
import { CreditCardModal } from "@/components/ui/CreditCardModal";
import CreditCardPaymentModal from "@/components/ui/CreditCardPaymentModal";
import { LendingModal } from "@/components/ui/LendingModal";
import { StorageInitializer } from "@/components/StorageInitializer";
import MotionProvider from "@/components/motion/MotionProvider";
import GradientMesh from "@/components/visuals/GradientMesh";
import HeroVisual from "@/components/visuals/HeroVisual";

export const metadata: Metadata = {
  title: "Clarity | Cinematic Finance",
  description: "Experience financial management in a spatial, cinematic environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen bg-[#050505] text-white antialiased hide-scrollbar">
        <StorageInitializer />
        <MotionProvider>
          <ModalProvider>
            <GradientMesh />
            <div className="flex relative z-10">
              <Sidebar />
              <div className="flex-1 w-full sm:ml-64">
                <Header />
                <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
                  {children}
                </main>
              </div>
            </div>
            <TransactionModals />
            <CreditSpendModal />
            <CategoryModal />
            <AccountModal />
            <CreditCardModal />
            <CreditCardPaymentModal />
            <LendingModal />
          </ModalProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

