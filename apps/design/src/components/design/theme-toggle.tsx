"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const themeStorageKey = "design-ui-theme";

function getStoredTheme(): ThemePreference {
  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "system";
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function getInitialThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";

  return getStoredTheme();
}

function getInitialResolvedTheme(): ResolvedTheme {
  if (typeof document === "undefined") return "light";

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function ThemeToggle() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialThemePreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getInitialResolvedTheme);

  useEffect(() => {
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const nextPreference = getStoredTheme();
      const nextResolvedTheme = resolveTheme(nextPreference);

      setThemePreference(nextPreference);
      setResolvedTheme(nextResolvedTheme);
      applyTheme(nextResolvedTheme);
    };

    syncTheme();
    systemQuery.addEventListener("change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      systemQuery.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const label = resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const tooltipLabel = themePreference === "system" ? `${label} (system default)` : label;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="text-foreground"
            aria-label={label}
            aria-pressed={resolvedTheme === "dark"}
            data-theme-preference={themePreference}
            data-theme={resolvedTheme}
            onClick={() => {
              window.localStorage.setItem(themeStorageKey, nextTheme);
              setThemePreference(nextTheme);
              setResolvedTheme(nextTheme);
              applyTheme(nextTheme);
            }}
          />
        }
      >
        <span aria-hidden="true" className="relative size-[15px]">
          <MoonIcon className="absolute inset-0 size-[15px] dark:hidden" />
          <SunIcon className="absolute inset-0 hidden size-[15px] dark:block" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltipLabel}</TooltipContent>
    </Tooltip>
  );
}

export { ThemeToggle };
