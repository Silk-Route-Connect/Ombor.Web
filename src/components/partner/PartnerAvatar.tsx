import React from "react";
import { getInitials } from "utils/partnerUtils";

import { Avatar } from "@mui/material";

interface PartnerAvatarProps {
	name: string;
	size?: number;
	/** Dim the avatar for archived partners. */
	dimmed?: boolean;
}

/** Round initials avatar per the bundle's `.avatar-primary` (primary-soft tint). */
export const PartnerAvatar: React.FC<PartnerAvatarProps> = ({ name, size = 36, dimmed }) => (
	<Avatar
		sx={{
			width: size,
			height: size,
			bgcolor: "primary.light",
			color: "primary.main",
			fontWeight: 600,
			fontSize: size * 0.38,
			opacity: dimmed ? 0.55 : 1,
		}}
	>
		{getInitials(name)}
	</Avatar>
);

export default PartnerAvatar;
