/** Two fields side by side (employee | period, wallet | amount); stacked on a phone. */
export const twoColumnSx = {
	display: "grid",
	gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
	gap: "14px",
} as const;
