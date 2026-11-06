import { useState, useEffect, useCallback, useMemo, type MouseEvent, type UIEvent } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandInput, CommandList } from "@/renderer/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/renderer/components/ui/popover";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";

export type OptionValue = string | number;
type OptionItem = Record<string, OptionValue>;

interface OptionPage {
  data?: OptionItem[];
  items?: OptionItem[];
  results?: OptionItem[];
}

/** Shape of an infinite-query-like result (TanStack useInfiniteQuery or a mock of it). */
export interface SearchableSelectFetchResult {
  data?: { pages: OptionPage[] };
  fetchNextPage: () => unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  refetch: () => unknown;
}

interface SearchableSelectProps {
  value?: OptionValue | null;
  onValueChange?: (value: OptionValue | null) => void;
  placeholder?: string;
  fetchFn: (params: Record<string, OptionValue>) => SearchableSelectFetchResult;
  labelKey?: string;
  valueKey?: string;
  searchParam?: string;
  pageParam?: string;
  limit?: number;
  className?: string;
  disabled?: boolean;
  emptyMessage?: string;
  onOpenChange?: (open: boolean) => void;
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder = "Select...",
  fetchFn,
  labelKey = "name",
  valueKey = "id",
  searchParam = "search",
  pageParam = "page",
  limit = 20,
  className,
  disabled = false,
  emptyMessage = "No results found.",
  onOpenChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const queryParams = useMemo(() => ({
    [searchParam]: debouncedSearch,
    [pageParam]: 1,
    limit,
  }), [debouncedSearch, searchParam, pageParam, limit]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = fetchFn(queryParams);

  const items = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.data || page.items || page.results || []);
  }, [data]);

  const selectedItem = useMemo(() => {
    if (!value || items.length === 0) return null;
    return items.find(item => item[valueKey] === value);
  }, [value, items, valueKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [open]);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const nearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = useCallback((item: OptionItem) => {
    const itemValue = item[valueKey] ?? null;
    if (value === itemValue) {
      onValueChange?.(null);
    } else {
      onValueChange?.(itemValue);
    }
    setOpen(false);
  }, [value, onValueChange, valueKey]);

  const handleClear = useCallback((e: MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    onValueChange?.(null);
  }, [onValueChange]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  }, [onOpenChange]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between truncate",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedItem ? selectedItem[labelKey] : placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {value && (
              <X
                className="h-3.5 w-3.5 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] max-w-none"
        align="start"
        sideOffset={4}
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={(e) => {
          const trigger = e.target instanceof Element ? e.target.closest("[role='combobox']") : null;
          if (trigger) {
            e.preventDefault();
          }
        }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList
            className="max-h-[300px] overflow-y-auto"
            onScroll={handleScroll}
          >
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : items.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item[valueKey]}
                    value={String(item[labelKey])}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === item[valueKey] ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{item[labelKey]}</span>
                  </CommandItem>
                ))}
                {isFetchingNextPage && (
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    Loading more...
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SearchableSelect;
