import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill, { StatusPillSize } from "components/shared/Chip/StatusPill";
import { PartnerType } from "models/partner";
import { ChipTokenKey } from "theme";

/**
 * Customer = teal (who we sell to), Supplier = saffron (who we buy from),
 * Both = neutral — so Customer and Both never read alike.
 */
const TYPE_TOKEN: Record<PartnerType, ChipTokenKey> = {
	Customer: "sale",
	Supplier: "supply",
	Both: "neutral",
};

interface PartnerTypeChipProps {
	type: PartnerType;
	/** Archived rows render the neutral chip (opacity-dimming failed contrast). */
	dimmed?: boolean;
	/** `md` for header/identity use; `sm` (default) for tables. */
	size?: StatusPillSize;
}

/** `Both` reads as «Клиент + Поставщик», never the raw enum (pattern 15). */
export const PartnerTypeChip: React.FC<PartnerTypeChipProps> = ({ type, dimmed, size = "sm" }) => {
	const { t } = useTranslation();
	const label =
		type === "Both"
			? `${t("partner.typeShort.Customer")} + ${t("partner.typeShort.Supplier")}`
			: t(`partner.typeShort.${type}`);

	return (
		<StatusPill
			token={dimmed ? "neutral" : (TYPE_TOKEN[type] ?? "neutral")}
			label={label}
			size={size}
		/>
	);
};

export default PartnerTypeChip;
