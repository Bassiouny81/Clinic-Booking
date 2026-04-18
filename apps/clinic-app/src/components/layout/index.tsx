import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { MobileHeader } from "./mobile-header";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <MobileHeader />
        <Navbar />
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto space-y-8 pb-20"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
