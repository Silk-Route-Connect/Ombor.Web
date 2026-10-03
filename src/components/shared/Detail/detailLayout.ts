/**
 * Right-rail detail geometry (pattern 20g): the rail appears only from `lg`, and
 * the main column is `minmax(0, 1fr)` so a wide tab table scrolls inside its card
 * instead of pushing the grid wider than the page.
 */
export const DETAIL_RAIL_COLUMNS = { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 360px" } as const;
