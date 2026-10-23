import { X } from "lucide-react";

interface SearchTagProps {
  search: string;
  onRemove: () => void;
}

export const SearchTag = ({ search, onRemove }: SearchTagProps) => {
  return (
    <div className="flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded bg-ground pl-2 pr-1 text-xs text-ink">
      <span>{search}</span>
      <button
        onClick={onRemove}
        aria-label={`${search} 제외 해제`}
        className="rounded p-0.5 text-ink-3 hover:bg-line hover:text-ink"
      >
        <X size={12} />
      </button>
    </div>
  );
};
