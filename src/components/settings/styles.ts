/** Settings forms keep a readable width instead of stretching across the card. */
export const settingsFormSx = {
	display: "flex",
	flexDirection: "column",
	gap: "16px",
	maxWidth: 480,
} as const;

/** One label + control pair in a settings form. */
export const settingsFieldSx = { display: "flex", flexDirection: "column", gap: "6px" } as const;
