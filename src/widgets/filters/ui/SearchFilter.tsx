import { DatePickerRange } from "@/widgets/date-range-picker";
import { SearchTagInput } from "@/widgets/search-tag-input";
import { Button } from "@/widgets/ui/button";
import { Input } from "@/widgets/ui/input";
import { useSearchFilter } from "../context/SearchFilterContext";

interface SearchFilterProps {
  onSearch: () => void;
  isPending: boolean;
}

export const SearchFilter = ({ onSearch, isPending }: SearchFilterProps) => {
  const {
    searchText,
    excludedTags: tags,
    setDateRange,
    setSearchText,
    setExcludedTags: setTags,
  } = useSearchFilter();

  return (
    <div className="flex items-center gap-4">
      <DatePickerRange
        className="flex-shrink-0"
        onChange={(value) => setDateRange(value!)}
      />
      <Input
        placeholder="검색어를 입력하세요"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={(e) => {
          // 한글 IME 조합 중 Enter는 무시 (중복 조회 방지)
          if (e.key === "Enter" && !e.nativeEvent.isComposing && !isPending) {
            onSearch();
          }
        }}
        className="max-w-sm"
      />
      <Button onClick={onSearch} disabled={isPending}>
        조회
      </Button>
      <SearchTagInput
        tags={tags}
        onTagChange={setTags}
        placeholder="제외 키워드를 입력하세요."
      />
    </div>
  );
};
