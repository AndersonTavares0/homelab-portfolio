'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('atlas-theme');
    const useDark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(useDark);
    document.documentElement.dataset.theme = useDark ? 'dark' : 'light';
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    localStorage.setItem('atlas-theme', next ? 'dark' : 'light');
  }
  return <button className="theme-toggle" type="button" onClick={toggle} aria-labelledby="theme-label theme-action"><span aria-hidden="true">{dark ? <Moon size={16} /> : <Sun size={16} />}</span><span id="theme-label">{dark ? 'Dark' : 'Light'}</span><span id="theme-action" className="sr-only">Switch to {dark ? 'light' : 'dark'} theme</span></button>;
}
