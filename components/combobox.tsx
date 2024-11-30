"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Tạo kiểu ComboboxOption chung
interface ComboboxOption<T> {
  value: T;
  label: string;
}

interface ComboboxProps<T> {
  options: ComboboxOption<T>[];
  placeholder?: string;
  onSelect: (value: T | null) => void;
  defaultValue?: T | null;
}

export function Combobox<T>({
  options,
  placeholder = "Select...",
  onSelect,
  defaultValue = null,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<T | null>(defaultValue);
  const [searchText, setSearchText] = React.useState("");

  const handleSelect = (value: T | null) => {
    setSelectedValue(value);
    onSelect(value); // Gửi giá trị đã chọn về hàm onSelect
    setOpen(false);
    setSearchText(""); // Clear search text after selection
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit justify-between"
        >
          {selectedValue !== null
            ? options.find((option) => option.value === selectedValue)?.label
            : placeholder}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            className="h-9"
            value={searchText}
            onValueChange={(value) => setSearchText(value)}
          />
          <CommandList>
            <CommandGroup>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <CommandItem
                    key={String(option.value)}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    {option.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedValue === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))
              ) : (
                <CommandEmpty>No options found.</CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
