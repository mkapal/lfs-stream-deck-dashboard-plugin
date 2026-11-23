const images = import.meta.glob<string>(
  "../../com.martinkapal.lfs.dashboard.sdPlugin/imgs/actions/*.png",
  { eager: true, query: "?inline", import: "default" },
);

const byName = new Map(
  Object.entries(images).map(([path, src]) => [
    path.slice(path.lastIndexOf("/") + 1, -".png".length),
    src,
  ]),
);

/** Returns the inlined PNG data URI for `imgs/actions/<name>.png`. */
export function getIconImage(name: string): string {
  const src = byName.get(name);

  if (!src) {
    throw new Error(`Missing icon image: ${name}`);
  }

  return src;
}
