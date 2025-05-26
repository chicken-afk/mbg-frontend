"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, PlusCircle, UserPlus2Icon, List } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useMobile } from "@/hooks/use-mobile";
import axios from "axios";
import { useProject } from "@/contexts/ProjectContext";

const baseMenuItems = [
];


export default function Sidebar({ className, sidebarOpen, onClose = () => { }, onProjectChange = () => { }, ...props }) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState(baseMenuItems);
  const isMobileDevice = useMobile();
  const [isLoadingNavigation, setIsLoadingNavigation] = useState(false);
  const [projectList, setProjectList] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { updateProject } = useProject()
  const { activeProject } = useProject()

  const fetchProjects = async () => {
    setIsLoadingNavigation(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/warehouses?pagination=false`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Projects fetched response:", response);
      const projects = response.data.data;
      const formattedProjects = projects.map((project) => ({
        "id": project.id,
        "projectName": project.name ? project.name.toUpperCase() : "",
      }));
      console.log("Projects fetched formatted project:", formattedProjects);
      setProjectList(formattedProjects);
      console.log("Projects fetched from project list:", projectList);
      //Set default active project to the first project if available
      if (formattedProjects.length > 0) {
        updateProject(formattedProjects[0]);
      } else {
        updateProject(null);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userRole");
        localStorage.removeItem("activeProjet");
        window.dispatchEvent(new Event("activeProjetChanged"));
        window.location.href = "/?forceLogout=true";
      }
      console.error("Error fetching projects:", error);
    }
    setIsLoadingNavigation(false);
  };

  const handleProjectClick = (project) => {
    updateProject(project);
    onProjectChange(project); // ✅ Notify parent
    if (isMobileDevice) {
      onClose(); // Close sidebar on mobile
    }
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
    if (userRole !== 3 || userRole !== "3") {
      fetchProjects();
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if ((role === "1" || role === 1) && !menuItems.some((item) => item.href === "/dashboard/users")) {
      setMenuItems([
        ...baseMenuItems,
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Transaksi", href: "/dashboard/transactions", icon: FileText },
        { title: "Manajemen User", href: "/dashboard/users", icon: Users },
        { title: "Buat Form Baru", href: "/dashboard/form-builder", icon: PlusCircle }
      ]);
    }
    if ((role === "2" || role === 2) && !menuItems.some((item) => item.href === "/dashboard/clients")) {
      setMenuItems([
        ...baseMenuItems,
        { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { title: "Transaksi", href: "/dashboard/transactions", icon: FileText },
      ]);
    }
    if ((role === "3" || role === 3) && !menuItems.some((item) => item.href === "/dashboard/clients")) {
      setMenuItems([
        ...baseMenuItems,
        { title: "Manajemen User", href: "/dashboard/users", icon: Users },
        { title: "Projects", href: "/dashboard/clients", icon: List },
      ]);
    }
  }, []);

  if (isMobileDevice) {
    // Hanya render saat terbuka
    if (!sidebarOpen) return null;

    return (
      <div
        className={cn(
          "fixed top-0 left-0 w-full h-screen bg-white z-50 p-0 overflow-y-auto",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h1 className="text-lg font-bold">Menu</h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close sidebar"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <nav className="grid items-start px-4 py-2 text-sm font-medium">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onClose} // ✅ Tutup saat klik menu
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

      </div>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn("fixed left-0 w-64 h-screen bg-white border-r overflow-y-auto p-4", className)}
      {...props}
    >
      <nav className="grid items-start px-2 text-sm font-medium">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}

        {
          userRole !== 3 && userRole !== "3" && (
            <>
              <h2 className="font-semibold mt-2 text-base">Project List</h2>
              {isLoadingNavigation ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Loading projects...</p>
                </div>
              ) : (
                projectList && projectList.length > 0 && (
                  <div className="px-4 py-2">
                    <ul className="space-y-2">
                      {projectList.map((project) => (
                        <div
                          onClick={() => handleProjectClick(project)}
                          className={"block text-sm text-muted-foreground text-center p-2 rounded-lg hover:text-primary hover:bg-blue-300 hover:cursor-pointer" + (project.id === activeProject.id ? " bg-blue-500 text-white font-semibold shadow-sm" : "")}
                        >
                          {project.projectName}
                        </div>
                      ))}
                    </ul>
                  </div>
                )
              )
              }
              {
                !isLoadingNavigation && projectList && projectList.length === 0 && (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No projects found.</p>
                  </div>
                )
              }
            </>
          )
        }

      </nav >
    </div >
  );
}
