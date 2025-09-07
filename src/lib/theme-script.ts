// Theme initialization script to prevent flash of unstyled content (FOUC)
export const themeScript = `
(function() {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      var savedTheme = localStorage.getItem('petinova-theme');
      var availableThemes = ['light', 'dark', 'monochromatic'];
      
      if (savedTheme && availableThemes.includes(savedTheme)) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else if (typeof window.matchMedia !== 'undefined') {
        var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        localStorage.setItem('petinova-theme', systemTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (error) {
    // Fallback to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;