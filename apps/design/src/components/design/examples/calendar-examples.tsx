import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon, Clock2Icon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const calendarPreviewTitles: Record<string, string> = {
  "calendar-demo": "Calendar",
  "calendar-single": "Calendar Single",
  "calendar-multiple": "Calendar Multiple",
  "calendar-range": "Calendar Range",
  "calendar-week-numbers": "Calendar Week Numbers",
  "calendar-booked": "Calendar Booked Dates",
  "calendar-time": "Calendar With Time",
  "calendar-presets": "Calendar With Presets",
  "calendar-custom-days": "Calendar Custom Days",
  "calendar-popover": "Calendar In Popover",
  "calendar-input": "Calendar With Input",
  "calendar-timezone": "Calendar With Time Zone",
};

function formatDate(date: Date | undefined) {
  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  return Boolean(date && !Number.isNaN(date.getTime()));
}

function CalendarFrame({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-fit p-0">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 16));

  return (
    <CalendarFrame>
      <Calendar mode="single" selected={date} onSelect={setDate} />
    </CalendarFrame>
  );
}

function CalendarSingle() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 16));

  return (
    <CalendarFrame>
      <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" />
    </CalendarFrame>
  );
}

function CalendarMultiple() {
  const [dates, setDates] = React.useState<Date[] | undefined>([
    new Date(2026, 5, 12),
    new Date(2026, 5, 16),
  ]);

  return (
    <CalendarFrame>
      <Calendar mode="multiple" selected={dates} onSelect={setDates} />
    </CalendarFrame>
  );
}

function CalendarRange() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 0, 12),
    to: addDays(new Date(2026, 0, 12), 12),
  });

  return (
    <CalendarFrame>
      <Calendar
        mode="range"
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={setDateRange}
        disabled={(date) => date > new Date(2026, 11, 31)}
      />
    </CalendarFrame>
  );
}

function CalendarWeekNumbers() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 1, 3));

  return (
    <CalendarFrame>
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={setDate}
        showWeekNumber
      />
    </CalendarFrame>
  );
}

function CalendarBooked() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 1, 3));
  const bookedDates = Array.from({ length: 10 }, (_, index) => new Date(2026, 1, 12 + index));

  return (
    <CalendarFrame>
      <Calendar
        mode="single"
        defaultMonth={date}
        selected={date}
        onSelect={setDate}
        disabled={bookedDates}
        modifiers={{
          booked: bookedDates,
        }}
        modifiersClassNames={{
          booked: "[&>button]:line-through opacity-100",
        }}
      />
    </CalendarFrame>
  );
}

function CalendarTime() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 16));

  return (
    <Card size="sm" className="w-fit p-0">
      <CardContent className="p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t bg-muted p-3">
        <Field>
          <FieldLabel htmlFor="calendar-time-from">Start time</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="calendar-time-from"
              type="time"
              step="1"
              defaultValue="10:30:00"
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <InputGroupAddon>
              <Clock2Icon />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="calendar-time-to">End time</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="calendar-time-to"
              type="time"
              step="1"
              defaultValue="12:30:00"
              className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <InputGroupAddon>
              <Clock2Icon />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </CardFooter>
    </Card>
  );
}

function CalendarPresets() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 1, 12));
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date(2026, 5, 1));

  return (
    <Card size="sm" className="w-fit max-w-[300px] p-0">
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          fixedWeeks
          className="[--cell-size:30px]"
        />
      </CardContent>
      <CardFooter className="flex flex-nowrap justify-start gap-2 overflow-x-auto border-t bg-muted p-3">
        {[
          { label: "Today", value: 0 },
          { label: "Tomorrow", value: 1 },
          { label: "In 3 days", value: 3 },
          { label: "In a week", value: 7 },
        ].map((preset) => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              const nextDate = addDays(new Date(2026, 5, 16), preset.value);
              setDate(nextDate);
              setCurrentMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
            }}
          >
            {preset.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}

function CalendarCustomDays() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 11, 8),
    to: addDays(new Date(2026, 11, 8), 10),
  });

  return (
    <CalendarFrame>
      <Calendar
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={setRange}
        numberOfMonths={1}
        captionLayout="dropdown"
        className="[--cell-size:40px]"
        components={{
          DayButton: ({ children, modifiers, day, ...props }) => {
            const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;

            return (
              <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                {children}
                {!modifiers.outside && <span>{isWeekend ? "$120" : "$100"}</span>}
              </CalendarDayButton>
            );
          },
        }}
      />
    </CalendarFrame>
  );
}

function CalendarPopover() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 16));

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" className="w-44 justify-start px-2.5 font-normal" />}
      >
        <CalendarIcon data-icon="inline-start" />
        {date ? format(date, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden bg-popover p-0 text-popover-foreground shadow-[var(--shadow-flyout)]"
        align="start"
      >
        <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={date} />
      </PopoverContent>
    </Popover>
  );
}

function CalendarInput() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 1));
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(formatDate(date));

  return (
    <Field className="w-52">
      <FieldLabel htmlFor="calendar-input">Subscription date</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="calendar-input"
          value={value}
          placeholder="June 01, 2026"
          onChange={(event) => {
            const nextDate = new Date(event.target.value);

            setValue(event.target.value);

            if (isValidDate(nextDate)) {
              setDate(nextDate);
              setMonth(nextDate);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id="calendar-input-button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                />
              }
            >
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden bg-popover p-0 text-popover-foreground shadow-[var(--shadow-flyout)]"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(nextDate) => {
                  setDate(nextDate);
                  setValue(formatDate(nextDate));
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

function CalendarTimezone() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 16));
  const [timeZone, setTimeZone] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return (
    <Field className="w-fit">
      <FieldLabel>Selected date with timezone</FieldLabel>
      <CalendarFrame>
        <Calendar mode="single" selected={date} onSelect={setDate} timeZone={timeZone} />
      </CalendarFrame>
    </Field>
  );
}

const calendarPreviews: Record<string, React.ComponentType> = {
  "calendar-demo": CalendarDemo,
  "calendar-single": CalendarSingle,
  "calendar-multiple": CalendarMultiple,
  "calendar-range": CalendarRange,
  "calendar-week-numbers": CalendarWeekNumbers,
  "calendar-booked": CalendarBooked,
  "calendar-time": CalendarTime,
  "calendar-presets": CalendarPresets,
  "calendar-custom-days": CalendarCustomDays,
  "calendar-popover": CalendarPopover,
  "calendar-input": CalendarInput,
  "calendar-timezone": CalendarTimezone,
};

function renderCalendarPreview(name: string) {
  const Preview = calendarPreviews[name];

  return Preview ? <Preview /> : null;
}

export { calendarPreviewTitles, renderCalendarPreview };
