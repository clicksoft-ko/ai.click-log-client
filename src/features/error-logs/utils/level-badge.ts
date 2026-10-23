export const levelBadgeClass = (level: string) => {
  switch (level.toUpperCase()) {
    case "FATAL":
    case "CRITICAL":
      return "bg-red-900 text-white";
    case "ERROR":
      return "bg-red-100 text-red-800";
    case "WARN":
    case "WARNING":
      return "bg-amber-100 text-amber-800";
    case "INFO":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};
