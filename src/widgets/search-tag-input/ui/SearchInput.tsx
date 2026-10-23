import { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onAdd: (value: string) => void;
}

export const SearchInput = ({ onAdd, ...props }: SearchInputProps) => {
  return (
    <input
      type="text"
      onKeyDown={(e) => {
        // 한글 IME 조합 중 Enter는 무시 (마지막 글자가 태그로 중복 추가되는 문제 방지)
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
          const value = e.currentTarget.value;
          onAdd(value);
          e.currentTarget.value = "";
        }
      }}
      {...props}
    />
  );
};
