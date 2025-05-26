"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

export default function Header({ onProjectChange, onSidebarOpen }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { activeProject } = useProject()
  const [activeProjectName, setActiveProjectName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    console.log("Active project changed:", activeProject);
    if (activeProject) {
      setActiveProjectName(activeProject.projectName);
    } else {
      setActiveProjectName("");
    }
  }
    , [activeProject]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("users");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={onSidebarOpen}
        aria-label="Open sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">Admin Panel</h1>
        {activeProject && (
          <p className="text-xs text-muted-foreground md:text-sm "> {activeProject.projectName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user && <span className="hidden text-sm md:inline-block">Halo, {user.name}</span>}
        <Button variant="outline" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
