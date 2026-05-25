import type { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Ambient grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col md:pl-64">
          <TopNav />
          <main className="flex-1 px-5 pb-12 pt-6 md:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
