"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useMobile } from "@/hooks/use-mobile";
import { ProjectProvider } from "@/contexts/ProjectContext";

export default function DashboardLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isMobileDevice = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeProject, setActiveProject] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("activeProjet");
    }
    return null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setActiveProject(localStorage.getItem("activeProjet"))
    }

    window.addEventListener("activeProjetChanged", handleStorageChange)
    return () => window.removeEventListener("activeProjetChanged", handleStorageChange)
  }, [])

  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth !== "true") {
      router.push("/");
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }


  if (!isAuthenticated) return null;

  return (
    <ProjectProvider>
      <div className="flex min-h-screen flex-col">
        <Header onSidebarOpen={openSidebar} />
        <div className="flex flex-1">
          <Sidebar
            onProjectChange={(newProject) => {
              localStorage.setItem("activeProjet", newProject)
              window.dispatchEvent(new Event("activeProjetChanged"))
              setActiveProject(newProject)
            }}
            sidebarOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className={`flex-1 overflow-auto ${isMobileDevice ? "p-2" : "p-6 pl-72"} bg-muted/40`}>
            <div className="">{children}</div>
          </main>
        </div>
      </div>
    </ProjectProvider>
  );
}
