// Theme initialization script to prevent flash of unstyled content (FOUC)
export const themeScript = `
(function() {
  try {
    var savedTheme = localStorage.getItem('petinova-theme');
    var availableThemes = ['light', 'dark', 'monochromatic'];
    
    if (savedTheme && availableThemes.includes(savedTheme)) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
      localStorage.setItem('petinova-theme', systemTheme);
    }
  } catch (error) {
    // Fallback to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;