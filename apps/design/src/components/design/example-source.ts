// Source extraction for the docs Preview/Code blocks.
//
// Each `*-examples.tsx` file exports a `<x>Previews` map of `"preview-key":
// DemoComponent`. We import those files as raw text (Vite `?raw`) and synthesize
// the source for a single demo: relevant imports, any top-level helpers/constants
// it uses, and the returned JSX for simple demos. That keeps the docs snippet
// focused on what you copy instead of registry maps or wrapper plumbing.

/* eslint-disable import/default */
import accordionSource from "@/components/design/examples/accordion-examples.tsx?raw";
import alertSource from "@/components/design/examples/alert-examples.tsx?raw";
import avatarSource from "@/components/design/examples/avatar-examples.tsx?raw";
import badgeSource from "@/components/design/examples/badge-examples.tsx?raw";
import breadcrumbSource from "@/components/design/examples/breadcrumb-examples.tsx?raw";
import buttonSource from "@/components/design/examples/button-examples.tsx?raw";
import buttonGroupSource from "@/components/design/examples/button-group-examples.tsx?raw";
import cardSource from "@/components/design/examples/card-examples.tsx?raw";
import calendarSource from "@/components/design/examples/calendar-examples.tsx?raw";
import codeSource from "@/components/design/examples/code-examples.tsx?raw";
import codeBlockSource from "@/components/design/examples/code-block-examples.tsx?raw";
import commandbarSource from "@/components/design/examples/commandbar-examples.tsx?raw";
import comboboxSource from "@/components/design/examples/combobox-examples.tsx?raw";
import dynamicIslandSource from "@/components/design/examples/dynamic-island-examples.tsx?raw";
import familyDrawerSource from "@/components/design/examples/family-drawer-examples.tsx?raw";
import hoverCardSource from "@/components/design/examples/hover-card-examples.tsx?raw";
import inputSource from "@/components/design/examples/input-examples.tsx?raw";
import labelSource from "@/components/design/examples/label-examples.tsx?raw";
import menuSource from "@/components/design/examples/menu-examples.tsx?raw";
import messageComposerSource from "@/components/design/examples/message-composer-examples.tsx?raw";
import kbdSource from "@/components/design/examples/kbd-examples.tsx?raw";
import modalSource from "@/components/design/examples/modal-examples.tsx?raw";
import popoverSource from "@/components/design/examples/popover-examples.tsx?raw";
import radioGroupSource from "@/components/design/examples/radio-group-examples.tsx?raw";
import selectSource from "@/components/design/examples/select-examples.tsx?raw";
import searchSource from "@/components/design/examples/search-examples.tsx?raw";
import separatorSource from "@/components/design/examples/separator-examples.tsx?raw";
import switchSource from "@/components/design/examples/switch-examples.tsx?raw";
import tabsSource from "@/components/design/examples/tabs-examples.tsx?raw";
import tableSource from "@/components/design/examples/table-examples.tsx?raw";
import textareaSource from "@/components/design/examples/textarea-examples.tsx?raw";
import tooltipSource from "@/components/design/examples/tooltip-examples.tsx?raw";
import toastSource from "@/components/design/examples/toast-examples.tsx?raw";
import dynamicIslandBlockSource from "@/components/design/dynamic-island.tsx?raw";
import familyDrawerBlockSource from "@/components/design/family-drawer.tsx?raw";
import messageComposerBlockSource from "@/components/design/message-composer.tsx?raw";

const rawSources = [
  accordionSource,
  alertSource,
  avatarSource,
  badgeSource,
  breadcrumbSource,
  buttonSource,
  buttonGroupSource,
  cardSource,
  calendarSource,
  codeSource,
  codeBlockSource,
  commandbarSource,
  comboboxSource,
  dynamicIslandSource,
  familyDrawerSource,
  hoverCardSource,
  inputSource,
  labelSource,
  menuSource,
  messageComposerSource,
  kbdSource,
  modalSource,
  popoverSource,
  radioGroupSource,
  selectSource,
  searchSource,
  separatorSource,
  switchSource,
  tabsSource,
  tableSource,
  textareaSource,
  tooltipSource,
  toastSource,
];

const blockSources: Record<string, string> = {
  "dynamic-island": dynamicIslandBlockSource.trim(),
  "family-drawer": familyDrawerBlockSource.trim(),
  "message-composer": messageComposerBlockSource.trim(),
};

type Declaration = {
  name: string;
  source: string;
  start: number;
};

type ImportDeclaration = {
  defaultName?: string;
  isTypeOnly: boolean;
  module: string;
  named: Array<{ imported: string; local: string; isType: boolean }>;
  namespaceName?: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsIdentifier(source: string, name: string) {
  return new RegExp(`\\b${escapeRegex(name)}\\b`).test(source);
}

function scanStateAt(source: string, index: number) {
  let blockComment = false;
  let depth = 0;
  let escaped = false;
  let lineComment = false;
  let quote: '"' | "'" | "`" | undefined;

  for (let i = 0; i < index; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    else if (char === "}") depth -= 1;
  }

  return { blockComment, depth, lineComment, quote };
}

function isTopLevelCodePosition(source: string, index: number) {
  const state = scanStateAt(source, index);

  return state.depth === 0 && !state.quote && !state.lineComment && !state.blockComment;
}

function findMatchingBrace(source: string, braceStart: number) {
  let blockComment = false;
  let depth = 0;
  let escaped = false;
  let lineComment = false;
  let quote: '"' | "'" | "`" | undefined;

  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;

      if (depth === 0) return index;
    }
  }

  return -1;
}

function findStatementEnd(source: string, start: number) {
  let blockComment = false;
  let braceDepth = 0;
  let bracketDepth = 0;
  let escaped = false;
  let lineComment = false;
  let parenDepth = 0;
  let quote: '"' | "'" | "`" | undefined;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") braceDepth += 1;
    else if (char === "}") braceDepth -= 1;
    else if (char === "[") bracketDepth += 1;
    else if (char === "]") bracketDepth -= 1;
    else if (char === "(") parenDepth += 1;
    else if (char === ")") parenDepth -= 1;
    else if (char === ";" && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
      return index + 1;
    }
  }

  return -1;
}

function extractFunctionSource(source: string, name: string): Declaration | undefined {
  const signature = new RegExp(`function\\s+${name}\\s*\\(`).exec(source);

  if (!signature) return undefined;
  if (!isTopLevelCodePosition(source, signature.index)) return undefined;

  const braceStart = source.indexOf("{", signature.index);

  if (braceStart === -1) return undefined;

  const braceEnd = findMatchingBrace(source, braceStart);

  if (braceEnd === -1) return undefined;

  return {
    name,
    source: source.slice(signature.index, braceEnd + 1).trim(),
    start: signature.index,
  };
}

function extractTopLevelDeclarations(source: string) {
  const declarations = new Map<string, Declaration>();

  for (const match of source.matchAll(/\bfunction\s+([A-Za-z]\w*)\s*\(/g)) {
    const [, name] = match;
    const declaration = extractFunctionSource(source, name);

    if (declaration) declarations.set(name, declaration);
  }

  for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z]\w*)\b/g)) {
    const [, name] = match;
    const start = match.index ?? 0;

    if (!isTopLevelCodePosition(source, start)) continue;

    const end = findStatementEnd(source, start);

    if (end !== -1) {
      declarations.set(name, {
        name,
        source: source.slice(start, end).trim(),
        start,
      });
    }
  }

  return declarations;
}

function parseNamedImports(source: string, isTypeOnly: boolean) {
  return source
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const isType = isTypeOnly || part.startsWith("type ");
      const specifier = part.replace(/^type\s+/, "").trim();
      const [imported, local = imported] = specifier.split(/\s+as\s+/);

      return { imported: imported.trim(), local: local.trim(), isType };
    });
}

function extractImportDeclarations(source: string) {
  const declarations: ImportDeclaration[] = [];

  for (const match of source.matchAll(/import\s+([\s\S]*?)\s+from\s+["']([^"']+)["'];/g)) {
    const statementStart = match.index ?? 0;

    if (!isTopLevelCodePosition(source, statementStart)) continue;

    let clause = match[1].trim();
    const module = match[2];
    let isTypeOnly = false;
    let defaultName: string | undefined;
    let namespaceName: string | undefined;
    let named: ImportDeclaration["named"] = [];

    if (clause.startsWith("type ")) {
      isTypeOnly = true;
      clause = clause.slice("type ".length).trim();
    }

    const namespaceMatch = /^\*\s+as\s+([A-Za-z]\w*)$/.exec(clause);

    if (namespaceMatch) {
      namespaceName = namespaceMatch[1];
    } else {
      const namedMatch = /\{([\s\S]*)\}$/.exec(clause);

      if (namedMatch) {
        named = parseNamedImports(namedMatch[1], isTypeOnly);
        defaultName = clause.slice(0, namedMatch.index).replace(/,$/, "").trim() || undefined;
      } else {
        defaultName = clause;
      }
    }

    declarations.push({ defaultName, isTypeOnly, module, named, namespaceName });
  }

  return declarations;
}

function formatImportDeclaration(declaration: ImportDeclaration, usedNames: Set<string>) {
  const named = declaration.named.filter((item) => usedNames.has(item.local));
  const defaultName =
    declaration.defaultName && usedNames.has(declaration.defaultName)
      ? declaration.defaultName
      : undefined;
  const namespaceName =
    declaration.namespaceName && usedNames.has(declaration.namespaceName)
      ? declaration.namespaceName
      : undefined;

  if (namespaceName) {
    return `import ${declaration.isTypeOnly ? "type " : ""}* as ${namespaceName} from "${declaration.module}";`;
  }

  if (!defaultName && named.length === 0) return undefined;

  const hasRuntimeNamed = named.some((item) => !item.isType);
  const hasTypeNamed = named.some((item) => item.isType);
  const namedParts = named.map((item) => {
    const alias = item.imported === item.local ? item.imported : `${item.imported} as ${item.local}`;

    return item.isType && (hasRuntimeNamed || defaultName) ? `type ${alias}` : alias;
  });
  const namedSource = namedParts.join(", ");
  const importPrefix = `import ${declaration.isTypeOnly || (!hasRuntimeNamed && hasTypeNamed) ? "type " : ""}`;
  const singleLineNamedImport = defaultName
    ? `import ${defaultName}, { ${namedSource} } from "${declaration.module}";`
    : `${importPrefix}{ ${namedSource} } from "${declaration.module}";`;
  const shouldWrapNamedImport = namedParts.length > 2 || singleLineNamedImport.length > 100;
  const multilineNamedSource = `{\n  ${namedParts.join(",\n  ")},\n}`;

  if (defaultName && namedSource) {
    if (shouldWrapNamedImport) {
      return `import ${defaultName}, ${multilineNamedSource} from "${declaration.module}";`;
    }

    return singleLineNamedImport;
  }

  if (defaultName) {
    return `import ${declaration.isTypeOnly ? "type " : ""}${defaultName} from "${declaration.module}";`;
  }

  if (shouldWrapNamedImport) {
    return `${importPrefix}${multilineNamedSource} from "${declaration.module}";`;
  }

  return singleLineNamedImport;
}

function collectDemoDeclarations(declarations: Map<string, Declaration>, functionName: string) {
  const target = declarations.get(functionName);

  if (!target) return [];

  const collected = new Set<string>([functionName]);
  const queue = [target.source];

  for (let index = 0; index < queue.length; index += 1) {
    const currentSource = queue[index];

    for (const [name, declaration] of declarations) {
      if (collected.has(name)) continue;
      if (!containsIdentifier(currentSource, name)) continue;

      collected.add(name);
      queue.push(declaration.source);
    }
  }

  return [...collected]
    .map((name) => declarations.get(name))
    .filter((declaration): declaration is Declaration => declaration !== undefined)
    .sort((a, b) => a.start - b.start);
}

function findMatchingParen(source: string, parenStart: number) {
  let blockComment = false;
  let depth = 0;
  let escaped = false;
  let lineComment = false;
  let quote: '"' | "'" | "`" | undefined;

  for (let index = parenStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(") depth += 1;
    else if (char === ")") {
      depth -= 1;

      if (depth === 0) return index;
    }
  }

  return -1;
}

function dedentSource(source: string) {
  const lines = source.split("\n");

  while (lines.length > 0 && !lines[0].trim()) lines.shift();
  while (lines.length > 0 && !lines[lines.length - 1].trim()) lines.pop();

  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0);

  if (indents.length === 0) return "";

  const minIndent = Math.min(...indents);

  return lines
    .map((line) => (line.trim() ? line.slice(minIndent) : ""))
    .join("\n")
    .trim();
}

function stripWrappingParens(source: string) {
  const trimmed = source.trim();

  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) {
    return dedentSource(trimmed);
  }

  const parenEnd = findMatchingParen(trimmed, 0);

  return parenEnd === trimmed.length - 1
    ? dedentSource(trimmed.slice(1, -1))
    : dedentSource(trimmed);
}

function extractSimpleReturnExpression(functionSource: string) {
  const signature = /^function\s+[A-Za-z]\w*\s*\(([\s\S]*?)\)\s*\{/.exec(functionSource);

  if (!signature || signature[1].trim()) return undefined;

  const braceStart = functionSource.indexOf("{");
  const braceEnd = functionSource.lastIndexOf("}");

  if (braceStart === -1 || braceEnd === -1 || braceEnd <= braceStart) return undefined;

  const body = functionSource.slice(braceStart + 1, braceEnd).trim();

  if (!body.startsWith("return")) return undefined;

  const statementEnd = findStatementEnd(body, 0);

  if (statementEnd === -1 || body.slice(statementEnd).trim()) return undefined;

  const returnStatement = body.slice(0, statementEnd).trim();
  const expression = returnStatement
    .replace(/^return\b/, "")
    .replace(/;$/, "")
    .trim();

  return expression ? stripWrappingParens(expression) : undefined;
}

function collectReferencedDeclarations(
  declarations: Map<string, Declaration>,
  seedSource: string,
  excludedNames: Set<string> = new Set(),
) {
  const collected = new Set<string>();
  const queue = [seedSource];

  for (let index = 0; index < queue.length; index += 1) {
    const currentSource = queue[index];

    for (const [name, declaration] of declarations) {
      if (collected.has(name) || excludedNames.has(name)) continue;
      if (!containsIdentifier(currentSource, name)) continue;

      collected.add(name);
      queue.push(declaration.source);
    }
  }

  return [...collected]
    .map((name) => declarations.get(name))
    .filter((declaration): declaration is Declaration => declaration !== undefined)
    .sort((a, b) => a.start - b.start);
}

function buildDemoSource(source: string, functionName: string) {
  const declarations = extractTopLevelDeclarations(source);
  const target = declarations.get(functionName);

  if (!target) return undefined;

  const simpleReturnExpression = extractSimpleReturnExpression(target.source);
  const demoDeclarations = simpleReturnExpression
    ? collectReferencedDeclarations(declarations, simpleReturnExpression, new Set([functionName]))
    : collectDemoDeclarations(declarations, functionName);
  const declarationSource = simpleReturnExpression
    ? [...demoDeclarations.map((declaration) => declaration.source), simpleReturnExpression]
        .filter(Boolean)
        .join("\n\n")
    : demoDeclarations.map((declaration) => declaration.source).join("\n\n");
  const usedSource = declarationSource;
  const usedNames = new Set(usedSource.match(/\b[A-Za-z]\w*\b/g) ?? []);
  const imports = extractImportDeclarations(source)
    .map((declaration) => formatImportDeclaration(declaration, usedNames))
    .filter((declaration): declaration is string => declaration !== undefined);

  return [...imports, declarationSource].filter(Boolean).join("\n\n").trim();
}

// Returns the body of the `const ...Previews = { ... }` object literal.
function extractPreviewsBlock(source: string) {
  const declaration = /const\s+\w*Previews\b/.exec(source);

  if (!declaration) return undefined;

  const braceStart = source.indexOf("{", declaration.index);

  if (braceStart === -1) return undefined;

  let depth = 0;
  let end = braceStart;

  for (; end < source.length; end += 1) {
    const char = source[end];

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return source.slice(braceStart, end);
}

function buildSourceMap() {
  const map: Record<string, string> = {};

  for (const source of rawSources) {
    const block = extractPreviewsBlock(source);

    if (!block) continue;

    // Entries are `"preview-key": DemoComponent,` — an identifier value (the
    // titles map uses string values, so it is skipped by the `[A-Za-z]` anchor).
    const entries = block.matchAll(/"([\w-]+)":\s*([A-Za-z]\w*)/g);

    for (const [, key, fnName] of entries) {
      const fnSource = buildDemoSource(source, fnName);

      if (fnSource) {
        map[key] = fnSource.trim();
      }
    }
  }

  return map;
}

const exampleSources = buildSourceMap();

function getExampleSource(name: string): string | undefined {
  if (blockSources[name]) return blockSources[name];

  return exampleSources[name];
}

export { getExampleSource };
