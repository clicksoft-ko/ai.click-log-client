import { Ban } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";
import { SearchInput } from "./SearchInput";
import { SearchTag } from "./SearchTag";

interface SearchTagInputProps extends InputHTMLAttributes<HTMLInputElement> {
  tags: string[];
  onTagChange: (value: string[]) => void;
}

export const SearchTagInput = ({
  tags,
  onTagChange,
  ...props
}: SearchTagInputProps) => {
  const [searchs, setSearchs] = useState<string[]>(tags);

  const handleAddSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setSearchs((prev) => {
      if (prev.includes(trimmedValue)) return prev;
      const newSearchs = [...prev, trimmedValue];
      onTagChange(newSearchs);
      return newSearchs;
    });
  };

  const handleRemoveSearch = (index: number) => {
    const newSearchs = [...searchs];
    newSearchs.splice(index, 1);
    setSearchs(newSearchs);
    onTagChange(newSearchs);
  };

  return (
    <div className="flex h-9 min-w-0 max-w-[420px] flex-[0_1_280px] items-center gap-1.5 overflow-x-auto rounded-md border border-dashed border-line-strong bg-white px-2.5 focus-within:border-solid focus-within:border-[#2E5BDB]">
      <Ban size={15} className="shrink-0 text-ink-2" aria-hidden />
      {searchs.map((search, index) => (
        <SearchTag
          key={index}
          search={search}
          onRemove={() => handleRemoveSearch(index)}
        />
      ))}
      <SearchInput
        onAdd={handleAddSearch}
        className="min-w-24 flex-1 bg-transparent text-[13px] placeholder:text-ink-3"
        {...props}
      />
    </div>
  );
};
