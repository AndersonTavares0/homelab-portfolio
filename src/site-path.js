const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function sitePath(path) {
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${base}${route}`;
}
