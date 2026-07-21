import React from "react";
import { useTranslation } from "react-i18next";
import { PartnerType } from "models/partner";
import { chipTokens } from "theme";

import { Box } from "@mui/material";

/**
 * Partner type → chipTokens key (DSN-1, no inline colours): Customer = teal
 * (the «sale» hue — who we sell to), Supplier = saffron (the «supply» hue — who
 * we buy from), Both = neutral stone. This keeps Customer and Both visually
 * distinct (the old info/primary mapping read alike), per locked chip semantics.
 */
const TYPE_TOKEN: Record<PartnerType, keyof typeof chipTokens> = {
	Customer: "sale",
	Supplier: "supply",
	Both: "neutral",
};

interface PartnerTypeChipProps {
	type: PartnerType;
	dimmed?: boolean;
	/** `md` enlarges the pill for header/identity use; `sm` (default) for tables. */
	size?: "sm" | "md";
}

/**
 * Soft pill per the DSN-1 chip tokens. `Both` reads as «Клиент + Поставщик»
 * (composed from the localized type labels), never the raw enum; Customer /
 * Supplier render their single label.
 */
export const PartnerTypeChip: React.FC<PartnerTypeChipProps> = ({ type, dimmed, size = "sm" }) => {
	const { t } = useTranslation();
	const tk = chipTokens[TYPE_TOKEN[type]];
	const dims =
		size === "md"
			? { px: "11px", py: "3px", fontSize: 12.5 }
			: { px: "9px", py: "2px", fontSize: 11 };
	const label =
		type === "Both"
			? `${t("partner.typeShort.Customer")} + ${t("partner.typeShort.Supplier")}`
			: t(`partner.typeShort.${type}`);

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				...dims,
				borderRadius: "999px",
				fontWeight: 600,
				lineHeight: 1.4,
				whiteSpace: "nowrap",
				color: tk.color,
				bgcolor: tk.bg,
				border: "1px solid",
				borderColor: tk.border,
				opacity: dimmed ? 0.6 : 1,
			}}
		>
			{label}
		</Box>
	);
};

export default PartnerTypeChip;
