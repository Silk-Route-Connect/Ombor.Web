import React from "react";
import { useTranslation } from "react-i18next";
import { OrderSource } from "models/order";

import LanguageIcon from "@mui/icons-material/Language";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Box } from "@mui/material";

interface OrderSourceChipProps {
	source: OrderSource;
}

/** Source badge: OmborWeb (info) / Telegram (blue). */
export const OrderSourceChip: React.FC<OrderSourceChipProps> = ({ source }) => {
	const { t } = useTranslation();

	const isWeb = source === "OmborWeb";
	const sx = isWeb
		? { color: "info.main", bgcolor: "rgba(42,111,151,0.10)", borderColor: "rgba(42,111,151,0.28)" }
		: { color: "#1E6FA8", bgcolor: "#E6F1FA", borderColor: "#BFDEF2" };

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
				px: "9px",
				py: "2px",
				borderRadius: "999px",
				fontSize: 12,
				fontWeight: 600,
				whiteSpace: "nowrap",
				border: "1px solid",
				...sx,
			}}
		>
			{isWeb ? <LanguageIcon sx={{ fontSize: 13 }} /> : <SendOutlinedIcon sx={{ fontSize: 12 }} />}
			{t(`order.source.${source}`)}
		</Box>
	);
};

export default OrderSourceChip;
