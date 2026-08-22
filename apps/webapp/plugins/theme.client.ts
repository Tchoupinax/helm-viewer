import { applyTheme, getTheme } from "../functions/theme";

export default defineNuxtPlugin(() => {
  applyTheme(getTheme());
});
