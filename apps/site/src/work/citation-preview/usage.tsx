import { TooltipProvider } from "@manikrana/ui/components/ui/tooltip";
import { CitationChip, CitationGroupChip, type CitationSource } from "./citation-chips";

const guide: CitationSource = {
  url: "https://example.com/guides/pagination",
  title: "REST API Design Guide",
  favicon: "https://example.com/favicon.png",
  image: "https://example.com/og/pagination.png",
};

const deepDive: CitationSource = {
  url: "https://api-docs.dev/cursors",
  title: "Cursor Pagination Deep Dive",
  snippet: "Why an opaque cursor stays stable while rows are inserted.",
};

export function Example() {
  return (
    <TooltipProvider>
      <p className="max-w-xl text-base leading-relaxed">
        Cursor pagination hands back an opaque token for the next page{" "}
        <CitationChip source={guide} />, so results stay stable as rows are inserted{" "}
        <CitationGroupChip sources={[guide, deepDive]} />.
      </p>
    </TooltipProvider>
  );
}
