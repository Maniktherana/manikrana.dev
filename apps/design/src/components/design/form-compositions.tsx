import * as React from "react";
import { CalendarIcon, FilterIcon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const filterRows = [
  { label: "Ready", count: 12, checked: true },
  { label: "Packing", count: 6, checked: false },
  { label: "Draft", count: 18, checked: false },
  { label: "Archived", count: 3, checked: false },
];

function SearchInput() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search products, orders, customers" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="ghost" size="icon-xs">
          <XIcon />
          <span className="sr-only">Clear</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

function DatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 16));

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <CalendarIcon data-icon="inline-start" />
        {date
          ? date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Pick a date"}
      </PopoverTrigger>
      <PopoverContent className="medusa-date-popover w-[296px] p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} />
        <div className="medusa-date-inputs">
          <InputGroup className="h-7 flex-1">
            <InputGroupInput
              readOnly
              value={
                date
                  ? date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""
              }
            />
          </InputGroup>
          <InputGroup className="h-7 flex-1">
            <InputGroupInput readOnly value="00:00" />
          </InputGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterPanel() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <FilterIcon data-icon="inline-start" />
        Filter
      </PopoverTrigger>
      <PopoverContent align="start" className="medusa-filter-menu w-[280px] p-1">
        <PopoverHeader>
          <PopoverTitle>Filter orders</PopoverTitle>
          <PopoverDescription>Status, date, and assignment filters.</PopoverDescription>
        </PopoverHeader>
        <div className="medusa-filter-search">
          <SearchInput />
        </div>
        <div className="medusa-filter-section">
          <p className="medusa-filter-section-title">Status</p>
          {filterRows.map((row) => (
            <div key={row.label} className="medusa-filter-row">
              <Checkbox defaultChecked={row.checked} aria-label={`Toggle ${row.label}`} />
              <span>{row.label}</span>
              <span className="medusa-filter-count">{row.count}</span>
            </div>
          ))}
        </div>
        <div className="medusa-filter-divider" />
        <div className="medusa-filter-section">
          <p className="medusa-filter-section-title">Sort</p>
          <div className="medusa-filter-row">
            <Checkbox defaultChecked aria-label="Sort ascending" />
            <span>Ascending</span>
            <span className="medusa-filter-count">1 -&gt; 30</span>
          </div>
          <div className="medusa-filter-row">
            <Checkbox aria-label="Sort descending" />
            <span>Descending</span>
            <span className="medusa-filter-count">30 -&gt; 1</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, FilterPanel, SearchInput };
