import type { WorkItem } from "@/work/registry";

export type Dependencies = {
  // npm packages, in the order the files first import them.
  packages: string[];
  // shadcn registry components.
  registry: string[];
  // Whether the files use the site's icon set, which a project swaps for its own.
  icons: boolean;
  // Images the files load from the site's public folder.
  assets: string[];
};

// What an item's files need besides React, read from their imports on the
// server (see source.ts), so the page only receives the result. The site's own
// modules map to what another project would install in their place: `cn` is
// shadcn's helper, built on clsx and tailwind-merge, and
// "@manikrana/ui/components/ui/*" are shadcn components. The usage example is
// left out, since it is not saved.
export function dependencies(
  item: WorkItem,
  files: readonly { name: string; code: string }[],
): Dependencies {
  const packages = new Set<string>();
  const registry = new Set<string>();
  let icons = false;

  const specifiers = files
    .filter((file) => file.name !== item.usage)
    .flatMap((file) => [...file.code.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]!));

  for (const specifier of specifiers) {
    const ui = specifier.match(/^@manikrana\/ui\/components\/ui\/(.+)$/);
    if (specifier.startsWith(".") || specifier === "react" || specifier.startsWith("react/")) {
      continue;
    } else if (specifier === "@manikrana/ui/lib/utils") {
      packages.add("clsx");
      packages.add("tailwind-merge");
    } else if (ui) {
      registry.add(ui[1]!);
    } else if (specifier === "@/components/icons") {
      icons = true;
    } else if (!specifier.startsWith("@/")) {
      const parts = specifier.split("/");
      packages.add(specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!);
    }
  }

  const assets = files
    .filter((file) => file.name !== item.usage)
    .flatMap((file) => [...file.code.matchAll(/"(\/work\/[\w/.-]+\.(?:webp|png|jpg|svg))"/g)])
    .map((match) => match[1]!);

  return {
    packages: [...packages],
    registry: [...registry],
    icons,
    assets: [...new Set(assets)],
  };
}

// The install steps as text to copy. Nothing runs them; the page shows them and
// the prompt passes them on.
export function installCommands({ packages, registry }: Dependencies) {
  return [
    ...(packages.length ? [`bun add ${packages.join(" ")}`] : []),
    ...(registry.length ? [`bunx --bun shadcn@latest add ${registry.join(" ")}`] : []),
  ];
}
