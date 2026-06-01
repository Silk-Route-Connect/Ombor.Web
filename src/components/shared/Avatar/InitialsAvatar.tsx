import React from "react";

import { Avatar, SxProps, Theme } from "@mui/material";

interface InitialsAvatarProps {
	name: string;
	size?: number;
	sx?: SxProps<Theme>;
}

/** First letters of up to the first two words, uppercased. */
function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return "?";
	}
	const first = parts[0]?.[0] ?? "";
	const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
	return (first + second).toUpperCase();
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, size = 34, sx }) => (
	<Avatar
		sx={{
			width: size,
			height: size,
			fontSize: size * 0.4,
			fontWeight: 600,
			bgcolor: "primary.light",
			color: "primary.main",
			...sx,
		}}
	>
		{getInitials(name)}
	</Avatar>
);

export default InitialsAvatar;
