import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/sidebar";
import { useSidebarStore } from "@/widgets/sidebar/model/sidebar-store";
import { cn } from "@/shared/utils";

export const Layout = () => {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex min-h-screen bg-ground">
      <Sidebar />
      <main
        className={cn(
          "min-w-0 flex-1 overflow-auto transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-52",
        )}
      >
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
