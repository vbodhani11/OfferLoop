"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
  JOB_CATEGORY_LABELS,
  SORT_OPTIONS,
  WORK_ARRANGEMENT_LABELS,
  WORK_ARRANGEMENTS,
} from "@/lib/constants/categories";

export interface JobFilterValues {
  category: string;
  experienceLevel: string;
  workArrangement: string;
  employmentType: string;
  sort: string;
}

interface JobFilterControlsProps {
  values: JobFilterValues;
  onChange: (patch: Partial<JobFilterValues>) => void;
  onClearAll: () => void;
}

const ANY_VALUE = "any";

export function JobFilterControls({
  values,
  onChange,
  onClearAll,
}: JobFilterControlsProps) {
  return (
    <div className="flex flex-col gap-5">
      <FilterField label="Category">
        <Select
          value={values.category || ANY_VALUE}
          onValueChange={(value) =>
            onChange({ category: value === ANY_VALUE ? "" : value })
          }
        >
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Any category</SelectItem>
            {JOB_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {JOB_CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Experience level">
        <Select
          value={values.experienceLevel || ANY_VALUE}
          onValueChange={(value) =>
            onChange({ experienceLevel: value === ANY_VALUE ? "" : value })
          }
        >
          <SelectTrigger aria-label="Filter by experience level">
            <SelectValue placeholder="Any level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Any level</SelectItem>
            {EXPERIENCE_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {EXPERIENCE_LEVEL_LABELS[level]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Work arrangement">
        <Select
          value={values.workArrangement || ANY_VALUE}
          onValueChange={(value) =>
            onChange({ workArrangement: value === ANY_VALUE ? "" : value })
          }
        >
          <SelectTrigger aria-label="Filter by work arrangement">
            <SelectValue placeholder="Any arrangement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Any arrangement</SelectItem>
            {WORK_ARRANGEMENTS.map((arrangement) => (
              <SelectItem key={arrangement} value={arrangement}>
                {WORK_ARRANGEMENT_LABELS[arrangement]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Employment type">
        <Select
          value={values.employmentType || ANY_VALUE}
          onValueChange={(value) =>
            onChange({ employmentType: value === ANY_VALUE ? "" : value })
          }
        >
          <SelectTrigger aria-label="Filter by employment type">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Any type</SelectItem>
            {EMPLOYMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Sort by">
        <Select value={values.sort} onValueChange={(value) => onChange({ sort: value })}>
          <SelectTrigger aria-label="Sort jobs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <Button type="button" variant="secondary" size="sm" onClick={onClearAll}>
        Clear all filters
      </Button>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-foreground text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
