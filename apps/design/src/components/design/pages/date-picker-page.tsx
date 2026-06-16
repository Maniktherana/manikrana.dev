"use client";

import * as React from "react";
import { CalendarIcon, CircleSlashIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shippingStartDate = new Date(2026, 5, 16);
const blackoutDates = [new Date(2026, 5, 19), new Date(2026, 5, 20), new Date(2026, 5, 26)];

function formatDate(date: Date | undefined) {
  return date ? formatter.format(date) : "Pick a date";
}

function SingleDatePicker() {
  const [date, setDate] = React.useState<Date | undefined>();

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <CalendarIcon data-icon="inline-start" />
        {formatDate(date)}
      </PopoverTrigger>
      <PopoverContent className="medusa-date-popover w-auto p-0" align="start">
        <PopoverHeader className="px-1 pb-1">
          <PopoverTitle>Ship date</PopoverTitle>
          <PopoverDescription>Select the order's first available ship date.</PopoverDescription>
        </PopoverHeader>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={shippingStartDate}
          disabled={[{ before: shippingStartDate }, ...blackoutDates]}
        />
      </PopoverContent>
    </Popover>
  );
}

function FieldDatePicker() {
  const [date, setDate] = React.useState<Date | undefined>(shippingStartDate);

  return (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="fulfillment-date">Fulfillment date</FieldLabel>
      <Popover>
        <PopoverTrigger render={<Button id="fulfillment-date" variant="outline" />}>
          <CalendarIcon data-icon="inline-start" />
          {formatDate(date)}
        </PopoverTrigger>
        <PopoverContent className="medusa-date-popover w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={[{ before: shippingStartDate }, ...blackoutDates]}
          />
        </PopoverContent>
      </Popover>
      <FieldDescription>
        Dates before stock arrives and blackout days are unavailable.
      </FieldDescription>
    </Field>
  );
}

function DisabledDatePicker() {
  return (
    <Field data-disabled className="max-w-xs">
      <FieldLabel htmlFor="locked-billing-date">Billing date</FieldLabel>
      <Popover>
        <PopoverTrigger render={<Button id="locked-billing-date" variant="outline" disabled />}>
          <CircleSlashIcon data-icon="inline-start" />
          Managed by plan
        </PopoverTrigger>
        <PopoverContent className="medusa-date-popover w-auto p-0" align="start">
          <Calendar mode="single" defaultMonth={shippingStartDate} disabled />
        </PopoverContent>
      </Popover>
      <FieldDescription>This schedule is controlled by the active subscription.</FieldDescription>
    </Field>
  );
}

function CalendarOnlyExample() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 18));

  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel>Delivery window</FieldLabel>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={shippingStartDate}
          disabled={(day) => day.getDay() === 0 || day.getDay() === 6}
        />
        <FieldDescription>
          Weekends stay visible in the calendar but cannot be selected.
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}

function DatePickerPage() {
  return (
    <ComponentPageShell title="Date Picker">
      <ComponentDemoBand label="BASIC" className="mt-8 flex flex-wrap items-center gap-6">
        <SingleDatePicker />
      </ComponentDemoBand>

      <ComponentDemoBand label="FIELD" className="mt-8 flex flex-wrap items-start gap-8">
        <FieldDatePicker />
        <DisabledDatePicker />
      </ComponentDemoBand>

      <ComponentDemoBand label="CALENDAR" className="mt-8 flex flex-wrap items-start gap-8">
        <CalendarOnlyExample />

        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            <CalendarIcon data-icon="inline-start" />
            Review blackout dates
          </PopoverTrigger>
          <PopoverContent className="medusa-date-popover w-auto p-0" align="start">
            <PopoverHeader className="px-1 pb-1">
              <PopoverTitle>Unavailable dates</PopoverTitle>
              <PopoverDescription>
                Operations has blocked these fulfillment days.
              </PopoverDescription>
            </PopoverHeader>
            <Calendar mode="single" defaultMonth={shippingStartDate} disabled={blackoutDates} />
          </PopoverContent>
        </Popover>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { DatePickerPage };
