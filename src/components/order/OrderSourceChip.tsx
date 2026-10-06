import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import { OrderSource } from "models/order";

import LanguageIcon from "@mui/icons-material/Language";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

/**
 * Source badge — OmborWeb = neutral (our own channel), Telegram = info blue.
 * Dormant-but-shown: Telegram orders don't arrive yet, but the value is served.
 */
export const OrderSourceChip: React.FC<{ source: OrderSource }> = ({ source }) => {
	const { t } = useTranslation();
	const isWeb = source === "OmborWeb";
	return (
		<StatusPill
			token={isWeb ? "neutral" : "info"}
			icon={isWeb ? LanguageIcon : SendOutlinedIcon}
			label={t(`order.source.${source}`, { defaultValue: source })}
		/>
	);
};

export default OrderSourceChip;
