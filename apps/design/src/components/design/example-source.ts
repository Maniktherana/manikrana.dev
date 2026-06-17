// Source extraction for the docs Preview/Code tabs.
//
// Each `*-examples.tsx` file exports a `<x>Previews` map of `"preview-key":
// DemoComponent`. We import those files as raw text (Vite `?raw`) and, for each
// entry, slice out the demo function's source so the Code tab can show the real
// composition next to the rendered preview.
//
// This is a deterministic heuristic (regex + brace matching), not a full
// parser: it relies on the established file shape — top-level `function Name() {
// ... }` declarations referenced from a `const ...Previews = { "key": Name }`
// map. If a demo function ever contains an unbalanced `{`/`}` inside a string
// literal it would mis-slice; none of the current demos do.

import aiAssistantSource from "@/components/design/examples/ai-assistant-examples.tsx?raw";
import badgeSource from "@/components/design/examples/badge-examples.tsx?raw";
import buttonSource from "@/components/design/examples/button-examples.tsx?raw";
import buttonGroupSource from "@/components/design/examples/button-group-examples.tsx?raw";
import codeBlockSource from "@/components/design/examples/code-block-examples.tsx?raw";
import comboboxSource from "@/components/design/examples/combobox-examples.tsx?raw";
import inputSource from "@/components/design/examples/input-examples.tsx?raw";
import modalSource from "@/components/design/examples/modal-examples.tsx?raw";
import popoverSource from "@/components/design/examples/popover-examples.tsx?raw";
import radioGroupSource from "@/components/design/examples/radio-group-examples.tsx?raw";
import selectSource from "@/components/design/examples/select-examples.tsx?raw";
import switchSource from "@/components/design/examples/switch-examples.tsx?raw";

const rawSources = [
  aiAssistantSource,
  badgeSource,
  buttonSource,
  buttonGroupSource,
  codeBlockSource,
  comboboxSource,
  inputSource,
  modalSource,
  popoverSource,
  radioGroupSource,
  selectSource,
  switchSource,
];

// Returns the source of a top-level `function name(...) { ... }` declaration,
// brace-matched from its signature to the closing brace.
function extractFunctionSource(source: string, name: string) {
  const signature = new RegExp(`function\\s+${name}\\s*\\(`).exec(source);

  if (!signature) return undefined;

  const braceStart = source.indexOf("{", signature.index);

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

  return source.slice(signature.index, end);
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
      const fnSource = extractFunctionSource(source, fnName);

      if (fnSource) {
        map[key] = fnSource.trim();
      }
    }
  }

  return map;
}

const exampleSources = buildSourceMap();

function getExampleSource(name: string): string | undefined {
  return exampleSources[name];
}

export { getExampleSource };
