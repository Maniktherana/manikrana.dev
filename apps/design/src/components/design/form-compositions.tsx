import { SearchIcon, XIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

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

export { SearchInput };
