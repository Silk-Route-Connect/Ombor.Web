import React from "react";
import { designTokens, identityTone } from "theme";
import { getInitials } from "utils/partnerUtils";

import { Avatar } from "@mui/material";

interface EntityAvatarProps {
	/** Person or partner name — the avatar shows up to two initials. */
	name: string;
	size?: number;
	/** Archived / terminated / deactivated: neutral stone instead of the identity tint. */
	muted?: boolean;
}

/**
 * Round initials avatar for people and partners — one look on every surface
 * (partners, debts, top debtors, employees, users): the tint comes from the
 * name, so the same partner always gets the same avatar.
 */
export const EntityAvatar: React.FC<EntityAvatarProps> = ({ name, size = 36, muted = false }) => {
	const tone = identityTone(name);
	return (
		<Avatar
			sx={{
				width: size,
				height: size,
				flex: "0 0 auto",
				bgcolor: muted ? designTokens.gray100 : tone.bg,
				color: muted ? "text.secondary" : tone.fg,
				fontWeight: 600,
				fontSize: size >= 36 ? 14 : size >= 28 ? 13 : 10,
			}}
		>
			{getInitials(name)}
		</Avatar>
	);
};

export default EntityAvatar;
