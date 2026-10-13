import type { WorkItem } from "@/components/work/registry";

export type Dependencies = {
  packages: string[];
  registry: string[];
  icons: boolean;
  assets: string[];
};

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

  const shipped = new Set(files.map((file) => file.name));
  for (const specifier of specifiers) {
    const ui = specifier.match(/^@manikrana\/ui\/components\/ui\/(.+)$/);
    const own = specifier.match(/^@manikrana\/ui\/components\/([\w-]+)$/);
    if (specifier.startsWith(".") || specifier === "react" || specifier.startsWith("react/")) {
      continue;
    } else if (own && shipped.has(`${own[1]}.tsx`)) {
      continue;
    } else if (specifier === "@manikrana/ui/lib/utils") {
      packages.add("clsx");
      packages.add("tailwind-merge");
    } else if (ui) {
      registry.add(ui[1]!);
    } else if (specifier.startsWith("@/components/icons/")) {
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

export function installCommands({ packages, registry }: Dependencies) {
  return [
    ...(packages.length ? [`bun add ${packages.join(" ")}`] : []),
    ...(registry.length ? [`bunx --bun shadcn@latest add ${registry.join(" ")}`] : []),
  ];
}
