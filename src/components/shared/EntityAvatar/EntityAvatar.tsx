import React from "react";
import { designTokens } from "theme";
import { getInitials } from "utils/partnerUtils";

import { Avatar } from "@mui/material";

interface EntityAvatarProps {
	/** Person or partner name — the avatar shows up to two initials. */
	name: string;
	size?: number;
	/** Archived / terminated / deactivated: neutral stone instead of the teal tint. */
	muted?: boolean;
}

/**
 * Round initials avatar for people and partners — one look on every surface
 * (partners, debts, top debtors, employees, users), so the same partner never
 * gets two different avatars.
 */
export const EntityAvatar: React.FC<EntityAvatarProps> = ({ name, size = 36, muted = false }) => (
	<Avatar
		sx={{
			width: size,
			height: size,
			flex: "0 0 auto",
			bgcolor: muted ? designTokens.gray100 : "primary.light",
			color: muted ? "text.secondary" : "primary.main",
			fontWeight: 600,
			fontSize: size >= 36 ? 14 : 13,
		}}
	>
		{getInitials(name)}
	</Avatar>
);

export default EntityAvatar;
