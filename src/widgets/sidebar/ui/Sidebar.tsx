import { STORAGE_KEYS } from "@/shared/constants/storage-keys";
import { paths } from "@/shared/paths";
import { cn } from "@/shared/utils";
import { BrandMark } from "@/widgets/brand";
import { AlertCircle, ChevronLeft, LogOut, Timer } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebarStore } from "../model/sidebar-store";

type NavItem = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isMain?: boolean;
};

const navItems: NavItem[] = [
  {
    to: paths.errorLogs,
    icon: <AlertCircle size={18} />,
    label: "에러 로그",
    isMain: true,
  },
  { to: paths.slowQueries, icon: <Timer size={18} />, label: "슬로우 쿼리" },
];

export const Sidebar = () => {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    window.location.href = paths.login;
  };

  const isActive = (item: NavItem) =>
    location.pathname === item.to ||
    (location.pathname === paths.root && item.isMain);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 flex h-screen flex-col gap-5 bg-navy px-3 py-[18px] text-[#C9D2E3] transition-all duration-300",
        isCollapsed ? "w-16" : "w-52",
      )}
    >
      <button
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
        className="absolute -right-3 top-6 rounded-full border border-navy-2 bg-navy p-1 text-[#C9D2E3] hover:text-white"
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isCollapsed && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "flex items-center gap-2.5 px-1.5",
          isCollapsed && "justify-center px-0",
        )}
      >
        <BrandMark />
        {!isCollapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold text-white">ClickSoft</span>
            <span className="text-[11.5px] text-[#A9B4CA]">로그 모니터</span>
          </div>
        )}
      </div>

      <nav aria-label="메뉴" className="flex flex-1 flex-col justify-between">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] hover:bg-navy-2 hover:text-white",
                    isCollapsed && "justify-center px-0",
                    active && "bg-navy-2 font-semibold text-white",
                  )}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          onClick={handleLogout}
          title={isCollapsed ? "로그아웃" : undefined}
          className={cn(
            "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] hover:bg-navy-2 hover:text-white",
            isCollapsed && "justify-center px-0",
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>로그아웃</span>}
        </button>
      </nav>
    </aside>
  );
};
