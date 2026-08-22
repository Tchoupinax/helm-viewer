export type Theme = "dark" | "light";

export const THEME_KEY = "helm-viewer-theme";
export const THEME_EVENT = "helm-theme-change";

export function getTheme(): Theme {
  if (typeof localStorage === "undefined") {
    return "light";
  }

  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme(): Theme {
  const theme = getTheme() === "dark" ? "light" : "dark";
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
  return theme;
}
