import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ModalProvider } from "@/lib/ModalContext";
import { TransactionModal } from "@/components/ui/TransactionModal";
import { CategoryModal } from "@/components/ui/CategoryModal";
import { AccountModal } from "@/components/ui/AccountModal";
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
          <TransactionModal />
          <CategoryModal />
          <AccountModal />
        </ModalProvider>
      </body>
    </html>
  );
}
