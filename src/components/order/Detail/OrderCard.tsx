import React from "react";
import { numericSx } from "theme";

import { Box } from "@mui/material";

/** Card shell (bundle `.sd-card`) with an optional titled header — local to Orders. */
export const OrderCard: React.FC<{
	title?: string;
	icon?: React.ReactNode;
	count?: number;
	action?: React.ReactNode;
	children: React.ReactNode;
}> = ({ title, icon, count, action, children }) => (
	<Box
		sx={{
			bgcolor: "background.paper",
			border: "1px solid",
			borderColor: "divider",
			borderRadius: "12px",
			boxShadow: 1,
			overflow: "hidden",
		}}
	>
		{title && (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "9px",
					p: "15px 18px",
					borderBottom: "1px solid",
					borderColor: "divider",
					fontSize: 15,
					fontWeight: 600,
				}}
			>
				{icon}
				{title}
				{count != null && (
					<Box component="span" sx={{ ...numericSx, color: "text.disabled", fontWeight: 600 }}>
						· {count}
					</Box>
				)}
				{action && (
					<>
						<Box sx={{ flexGrow: 1 }} />
						{action}
					</>
				)}
			</Box>
		)}
		{children}
	</Box>
);

export default OrderCard;
