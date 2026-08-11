// Persistent procedural history must not depend on host locale/collation.
// JavaScript's relational string comparison is defined over UTF-16 code units,
// giving us one deterministic ordering across browsers, Node, CI, and servers.
export function compareStableStrings(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
