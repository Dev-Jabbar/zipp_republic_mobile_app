import { FilterChip } from "@/components/shop/CollectionHeader";
import { FilterState } from "@/components/shop/drawers/FilterDrawer";
import { formatNaira } from "@/utils/currency";
import { useState } from "react";

const DEFAULT_FILTERS = {
  inStockOnly: false,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  sortBy: "featured" as FilterState["sortBy"],
};

export function useCollectionFilters() {
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const applyFilters = (filters: FilterState) => {
    setAppliedFilters({
      inStockOnly: filters.inStockOnly,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy,
    });
  };

  const removeChip = (key: string) => {
    setAppliedFilters((prev) => {
      if (key === "price") {
        return { ...prev, minPrice: undefined, maxPrice: undefined };
      }
      if (key === "inStock") {
        return { ...prev, inStockOnly: false };
      }
      return prev;
    });
  };

  const clearAll = () => setAppliedFilters(DEFAULT_FILTERS);

  return { appliedFilters, applyFilters, removeChip, clearAll };
}

export function getDrawerFilters(
  appliedFilters: ReturnType<typeof useCollectionFilters>["appliedFilters"],
  priceBounds: { min: number; max: number },
): FilterState {
  return {
    inStockOnly: appliedFilters.inStockOnly,
    minPrice: appliedFilters.minPrice ?? priceBounds.min,
    maxPrice: appliedFilters.maxPrice ?? priceBounds.max,
    sortBy: appliedFilters.sortBy,
  };
}

export function getChips(
  appliedFilters: ReturnType<typeof useCollectionFilters>["appliedFilters"],
  priceBounds: { min: number; max: number },
): FilterChip[] {
  const result: FilterChip[] = [];

  const isPriceNarrowed =
    appliedFilters.minPrice !== undefined &&
    appliedFilters.maxPrice !== undefined &&
    (appliedFilters.minPrice > priceBounds.min ||
      appliedFilters.maxPrice < priceBounds.max);

  if (isPriceNarrowed) {
    result.push({
      key: "price",
      label: `${formatNaira(appliedFilters.minPrice!)} - ${formatNaira(
        appliedFilters.maxPrice!,
      )}`,
    });
  }

  if (appliedFilters.inStockOnly) {
    result.push({ key: "inStock", label: "In stock" });
  }

  return result;
}
