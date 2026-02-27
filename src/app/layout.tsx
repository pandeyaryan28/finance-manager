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

export const metadata: Metadata = {
  title: "Clarity | Personal Finance",
  description: "Modern personal finance manager tailored for clarity and speed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] antialiased selection:bg-blue-500/30 overflow-hidden">
        <StorageInitializer />
        <ModalProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden sm:ml-64 bg-[var(--bg-color)] transition-all">
              <Header />
              <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
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
      </body>
    </html>
  );
}
