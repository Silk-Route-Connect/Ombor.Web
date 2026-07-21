import React from "react";
import { useTranslation } from "react-i18next";
import { OrderSource } from "models/order";
import { chipTokens, designTokens } from "theme";

import LanguageIcon from "@mui/icons-material/Language";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Box } from "@mui/material";

interface OrderSourceChipProps {
	source: OrderSource;
}

/**
 * Source badge — OmborWeb = neutral (our own channel), Telegram = the info
 * family (the one blue in the tokens; Telegram's brand hue). Dormant-but-shown:
 * Telegram orders don't arrive yet, but the value is served and displayed.
 */
export const OrderSourceChip: React.FC<OrderSourceChipProps> = ({ source }) => {
	const { t } = useTranslation();

	const isWeb = source === "OmborWeb";
	const chip = isWeb
		? chipTokens.neutral
		: { bg: designTokens.infoBg, color: "info.main", border: designTokens.infoBorder };

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
				color: chip.color,
				bgcolor: chip.bg,
				borderColor: chip.border,
			}}
		>
			{isWeb ? <LanguageIcon sx={{ fontSize: 13 }} /> : <SendOutlinedIcon sx={{ fontSize: 12 }} />}
			{t(`order.source.${source}`, { defaultValue: source })}
		</Box>
	);
};

export default OrderSourceChip;
