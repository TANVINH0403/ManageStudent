const THEMES = {
  dark: {
    '--bg-main':      '#0f172a',
    '--sidebar-bg':   '#1e293b',
    '--text-main':    '#f8fafc',
    '--text-light':   '#94a3b8',
    '--border-color': '#334155',
    '--glass-bg':     'rgba(30, 41, 59, 0.9)',
    '--shadow':       '0 4px 20px rgba(0,0,0,0.5)',
    '--primary':      '#4f8aff',
  },
  light: {
    '--bg-main':      '#f0f4f9',
    '--sidebar-bg':   '#ffffff',
    '--text-main':    '#1e293b',
    '--text-light':   '#64748b',
    '--border-color': '#e2e8f0',
    '--glass-bg':     'rgba(255,255,255,0.8)',
    '--shadow':       '0 4px 20px rgba(0,0,0,0.05)',
    '--primary':      '#7c3aed',
  },
};

export const applyPreferences = (preferences) => {
  if (!preferences?.appearance) return;
  const { theme } = preferences.appearance;
  applyThemeVars(theme);
};

export const applyThemeVars = (theme) => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const vars = isDark ? THEMES.dark : THEMES.light;

  // Gán trực tiếp vào inline style của <html> — luôn thắng mọi CSS selector
  Object.entries(vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  // Cũng gán data-theme để hỗ trợ các selector bên ngoài nếu cần
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
};
