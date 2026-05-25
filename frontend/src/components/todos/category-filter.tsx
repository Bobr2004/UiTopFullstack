"use client";

import { Filter } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { Category } from "@/types/todo";

const ALL_CATEGORIES = "all";

export function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:w-72">
      <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
        <Filter className="h-4 w-4 stroke-[3]" />
        Filter
      </label>
      <Select value={value || ALL_CATEGORIES} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { ALL_CATEGORIES };
