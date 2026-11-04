import { loadContent } from '../../scripts/content.mjs';

export function load() {
  const { profile } = loadContent();
  return {
    profile: { data: profile.data, content: profile.content.trim() }
  };
}
