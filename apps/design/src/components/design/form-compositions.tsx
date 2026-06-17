import * as React from "react";
import { CalendarIcon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2026, 5, 16),
  );

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
      <PopoverContent
        className="medusa-date-popover w-[296px] p-0"
        align="start"
      >
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

export { DatePicker, SearchInput };
