"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { cn } from "@/shared/utils";
import { Button } from "@/widgets/ui/button";
import { Calendar } from "@/widgets/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/widgets/ui/popover";
import { ClassNameProps } from "@/shared/types/props";

interface DatePickerRangeProps extends ClassNameProps {
  onChange?: (date: DateRange | undefined) => void;
}

export function DatePickerRange({ className, onChange }: DatePickerRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (newDate: DateRange | undefined) => {
    if (!newDate) {
      const from = date?.from ?? new Date();
      const to = from;
      setDate({ from, to });
      onChange?.({ from, to });
      return;
    }
    const { from } = newDate;
    const to = newDate.to ?? from;

    setDate({ from, to });
    onChange?.({ from, to });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-9 justify-start gap-2 border-line-strong px-3 text-left text-[13px] font-normal tabular-nums text-ink [&_svg]:text-ink-2",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "yyyy-MM-dd", { locale: ko })} ~{" "}
                  {format(date.to, "yyyy-MM-dd", { locale: ko })}
                </>
              ) : (
                format(date.from, "yyyy-MM-dd", { locale: ko })
              )
            ) : (
              <span>날짜 선택</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
              locale={ko}
              formatters={{
                formatCaption: (date) => {
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                },
              }}
            />
            <div className="border-t p-3">
              <Button className="w-full" onClick={() => setOpen(false)}>
                확인
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
