/**
 * Helper to retrieve active theme colors dynamically from CSS variables.
 * This ensures charts and dynamic JS elements match the active theme.
 */
export function getThemeChartColors() {
  if (typeof window !== 'undefined') {
    try {
      const rootStyle = getComputedStyle(document.documentElement);
      const c1 = rootStyle.getPropertyValue('--theme-chart-1').trim();
      const c2 = rootStyle.getPropertyValue('--theme-chart-2').trim();
      if (c1 && c2) {
        return { primary: c1, secondary: c2 };
      }
    } catch (e) {
      console.warn("Could not read CSS theme variables:", e);
    }
  }

  // Fallback to Jefara Violet colors if not rendered yet
  return { primary: '#7c3aed', secondary: '#c084fc' };
}
