export const levelBadgeClass = (level: string) => {
  switch (level.toUpperCase()) {
    case "FATAL":
    case "CRITICAL":
      return "bg-crit text-white";
    case "ERROR":
      return "bg-[#FDECEA] text-[#B42318]";
    case "WARN":
    case "WARNING":
      return "bg-amber-100 text-amber-800";
    case "INFO":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

/** 요약 그래프 계열: 0 = ERROR 등, 1 = CRITICAL·FATAL */
export const isCriticalLevel = (level: string) =>
  ["CRITICAL", "FATAL"].includes(level.toUpperCase());
