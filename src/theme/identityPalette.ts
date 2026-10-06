/**
 * Identity tints for initials avatars and image-less placeholders: a stable
 * per-name hue, so «Анна Блинова» is the same plum circle on every page and a
 * list of partners or products is told apart at a glance. Soft fill + dark text,
 * every pair ≥ 5.2:1. No pure green or red — those mean money.
 */
const IDENTITY_PALETTE = [
	{ bg: "#E1EEEE", fg: "#12676B" }, // teal
	{ bg: "#FBF0DC", fg: "#8A5A0E" }, // saffron
	{ bg: "#E7F0F6", fg: "#245F82" }, // blue
	{ bg: "#ECE7F7", fg: "#6A4BB0" }, // plum
	{ bg: "#F8E6EE", fg: "#8E2F5A" }, // rose
	{ bg: "#EDF1E1", fg: "#4F5E1F" }, // olive
	{ bg: "#E9EDF2", fg: "#3E4F66" }, // slate
	{ bg: "#F5E8E0", fg: "#8A4524" }, // clay
] as const;

export type IdentityTone = (typeof IDENTITY_PALETTE)[number];

/** The tint of a name — a deterministic hash, so it never changes between renders. */
export function identityTone(name: string): IdentityTone {
	let hash = 0;
	for (const char of name.trim().toLowerCase()) {
		hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
	}
	return IDENTITY_PALETTE[hash % IDENTITY_PALETTE.length];
}
