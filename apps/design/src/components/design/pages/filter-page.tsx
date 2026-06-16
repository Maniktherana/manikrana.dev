"use client";

import { useMemo, useState } from "react";
import { FilterIcon, SearchIcon, XIcon } from "lucide-react";

import {
  ComponentDemoBand,
  ComponentPageShell,
} from "@/components/design/pages/component-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const statusItems = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "Ready to fulfill", value: "ready" },
  { label: "Needs review", value: "review" },
  { label: "Archived", value: "archived" },
] as const;

const categoryItems = [
  { label: "All categories", value: "All categories" },
  { label: "Apparel", value: "Apparel" },
  { label: "Accessories", value: "Accessories" },
  { label: "Digital goods", value: "Digital goods" },
  { label: "Gift cards", value: "Gift cards" },
] as const;

const facetItems = [
  {
    id: "assigned",
    label: "Assigned to me",
    description: "Rows owned by the current operator.",
  },
  {
    id: "priority",
    label: "Priority queue",
    description: "Orders with SLA or customer escalation.",
  },
  {
    id: "inventory",
    label: "Inventory reserved",
    description: "Items already allocated from stock.",
  },
] as const;

type StatusValue = (typeof statusItems)[number]["value"];
type CategoryValue = (typeof categoryItems)[number]["value"];
type FacetId = (typeof facetItems)[number]["id"];

type ActiveFilter = {
  id: string;
  label: string;
  onRemove: () => void;
};

function FilterPage() {
  const [query, setQuery] = useState("hoodie");
  const [status, setStatus] = useState<StatusValue>("open");
  const [category, setCategory] = useState<CategoryValue>("Apparel");
  const [facets, setFacets] = useState<Record<FacetId, boolean>>({
    assigned: true,
    priority: false,
    inventory: true,
  });

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      filters.push({
        id: "query",
        label: `Search: ${trimmedQuery}`,
        onRemove: () => setQuery(""),
      });
    }

    if (status !== "all") {
      filters.push({
        id: "status",
        label: statusItems.find((item) => item.value === status)?.label ?? status,
        onRemove: () => setStatus("all"),
      });
    }

    if (category !== "All categories") {
      filters.push({
        id: "category",
        label: category,
        onRemove: () => setCategory("All categories"),
      });
    }

    facetItems.forEach((facet) => {
      if (facets[facet.id]) {
        filters.push({
          id: facet.id,
          label: facet.label,
          onRemove: () =>
            setFacets((current) => ({
              ...current,
              [facet.id]: false,
            })),
        });
      }
    });

    return filters;
  }, [category, facets, query, status]);

  function setFacet(facetId: FacetId, checked: boolean) {
    setFacets((current) => ({
      ...current,
      [facetId]: checked,
    }));
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setCategory("All categories");
    setFacets({
      assigned: false,
      priority: false,
      inventory: false,
    });
  }

  return (
    <ComponentPageShell title="Filter">
      <ComponentDemoBand label="FILTER PRIMITIVES" className="mt-8 w-full max-w-4xl">
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="filter-search">Search query</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="filter-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search orders, products, customers"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search query"
                  disabled={!query}
                  onClick={() => setQuery("")}
                >
                  <XIcon aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>Controlled input composed with InputGroup.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-status">Status</FieldLabel>
            <Select
              name="status"
              items={statusItems}
              value={status}
              onValueChange={(value) => setStatus(value as StatusValue)}
            >
              <SelectTrigger id="filter-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  {statusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>Base UI selection behavior stays intact.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-category">Category</FieldLabel>
            <Combobox
              items={categoryItems}
              value={category}
              onValueChange={(value) => setCategory((value ?? "All categories") as CategoryValue)}
            >
              <ComboboxInput id="filter-category" placeholder="Choose a category" showClear />
              <ComboboxContent align="start">
                <ComboboxList>
                  <ComboboxEmpty>No categories found.</ComboboxEmpty>
                  <ComboboxGroup>
                    <ComboboxLabel>Categories</ComboboxLabel>
                    {categoryItems.map((item) => (
                      <ComboboxItem key={item.value} value={item.value}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <FieldDescription>
              Searchable filter value using the installed Combobox.
            </FieldDescription>
          </Field>

          <FieldSet>
            <div>
              <FieldLegend>Facets</FieldLegend>
              <FieldDescription>Checkbox filters for table-side refinement.</FieldDescription>
            </div>
            <FieldGroup data-slot="checkbox-group">
              {facetItems.map((facet) => (
                <Field key={facet.id} orientation="horizontal">
                  <Checkbox
                    id={`filter-${facet.id}`}
                    checked={facets[facet.id]}
                    onCheckedChange={(checked) => setFacet(facet.id, checked)}
                  />
                  <FieldContent>
                    <Label htmlFor={`filter-${facet.id}`}>{facet.label}</Label>
                    <FieldDescription>{facet.description}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </ComponentDemoBand>

      <ComponentDemoBand
        label="ACTIVE FILTER CHIPS"
        className="mt-8 flex max-w-4xl flex-wrap gap-2"
      >
        {activeFilters.length > 0 ? (
          activeFilters.map((filter) => (
            <span key={filter.id} className="inline-flex items-center gap-1">
              <Badge variant="secondary">{filter.label}</Badge>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={`Remove ${filter.label}`}
                onClick={filter.onRemove}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </span>
          ))
        ) : (
          <Badge variant="outline">No active filters</Badge>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={clearFilters}
          disabled={activeFilters.length === 0}
        >
          Clear all
        </Button>
      </ComponentDemoBand>

      <ComponentDemoBand label="COMPACT TOOLBAR" className="mt-8 w-full max-w-5xl">
        <div className="medusa-raised flex w-full flex-col gap-3 p-3 md:flex-row md:items-center">
          <InputGroup className="md:max-w-xs">
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search toolbar rows"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rows"
            />
          </InputGroup>

          <Select
            name="toolbar-status"
            items={statusItems}
            value={status}
            onValueChange={(value) => setStatus(value as StatusValue)}
          >
            <SelectTrigger size="sm" className="w-full md:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {statusItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>
              <FilterIcon data-icon="inline-start" aria-hidden="true" />
              Filters
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <PopoverHeader>
                <PopoverTitle>Filter orders</PopoverTitle>
                <PopoverDescription>
                  Combine category and facets without a custom primitive.
                </PopoverDescription>
              </PopoverHeader>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="toolbar-category">Category</FieldLabel>
                  <Combobox
                    items={categoryItems}
                    value={category}
                    onValueChange={(value) =>
                      setCategory((value ?? "All categories") as CategoryValue)
                    }
                  >
                    <ComboboxInput
                      id="toolbar-category"
                      placeholder="Choose a category"
                      showClear
                    />
                    <ComboboxContent align="start">
                      <ComboboxList>
                        <ComboboxEmpty>No categories found.</ComboboxEmpty>
                        <ComboboxGroup>
                          <ComboboxLabel>Categories</ComboboxLabel>
                          {categoryItems.map((item) => (
                            <ComboboxItem key={item.value} value={item.value}>
                              {item.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </Field>

                {facetItems.map((facet) => (
                  <Field key={facet.id} orientation="horizontal">
                    <Checkbox
                      id={`toolbar-${facet.id}`}
                      checked={facets[facet.id]}
                      onCheckedChange={(checked) => setFacet(facet.id, checked)}
                    />
                    <FieldContent>
                      <Label htmlFor={`toolbar-${facet.id}`}>{facet.label}</Label>
                      <FieldDescription>{facet.description}</FieldDescription>
                    </FieldContent>
                  </Field>
                ))}
              </FieldGroup>
            </PopoverContent>
          </Popover>

          <div className="flex flex-wrap gap-2 md:ml-auto">
            {activeFilters.slice(0, 3).map((filter) => (
              <Badge key={filter.id} variant="outline">
                {filter.label}
              </Badge>
            ))}
            {activeFilters.length > 3 ? (
              <Badge variant="secondary">+{activeFilters.length - 3}</Badge>
            ) : null}
          </div>
        </div>
      </ComponentDemoBand>
    </ComponentPageShell>
  );
}

export { FilterPage };
