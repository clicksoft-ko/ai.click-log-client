import { DatePickerRange } from "@/widgets/date-range-picker";
import { SearchTagInput } from "@/widgets/search-tag-input";
import { Search } from "lucide-react";
import { useSearchFilter } from "../context/SearchFilterContext";

interface SearchFilterProps {
  onSearch: () => void;
  isPending: boolean;
  placeholder?: string;
}

export const SearchFilter = ({
  onSearch,
  isPending,
  placeholder = "검색어를 입력하세요",
}: SearchFilterProps) => {
  const {
    searchText,
    excludedTags: tags,
    setDateRange,
    setSearchText,
    setExcludedTags: setTags,
  } = useSearchFilter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DatePickerRange
        className="flex-shrink-0"
        onChange={(value) => setDateRange(value!)}
      />
      <label className="flex h-9 min-w-0 max-w-[420px] flex-[1_1_280px] items-center gap-2 rounded-md border border-line-strong bg-white px-3 focus-within:border-[#2E5BDB] focus-within:ring-2 focus-within:ring-[#2E5BDB]/20">
        <Search size={16} className="shrink-0 text-ink-2" aria-hidden />
        <span className="sr-only">검색어</span>
        <input
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            // 한글 IME 조합 중 Enter는 무시 (중복 조회 방지)
            if (e.key === "Enter" && !e.nativeEvent.isComposing && !isPending) {
              onSearch();
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-[13px] placeholder:text-ink-3"
        />
      </label>
      <button
        onClick={onSearch}
        disabled={isPending}
        className="h-9 rounded-md bg-navy px-4 text-[13px] font-semibold text-white hover:bg-navy-2 disabled:opacity-50"
      >
        조회
      </button>
      <SearchTagInput
        tags={tags}
        onTagChange={setTags}
        placeholder="제외할 키워드, Enter로 추가"
        aria-label="제외 키워드"
      />
    </div>
  );
};
