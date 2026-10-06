import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import { ProductType } from "models/product";
import { ChipTokenKey } from "theme";

/** Sale = teal, Supply = saffron (the transaction-type hues), All = neutral. */
const TYPE_TOKEN: Record<ProductType, ChipTokenKey> = {
	Sale: "sale",
	Supply: "supply",
	All: "neutral",
};

interface ProductTypeChipProps {
	type: ProductType;
	/** Archived rows render the neutral chip (opacity-dimming failed contrast). */
	dimmed?: boolean;
}

export const ProductTypeChip: React.FC<ProductTypeChipProps> = ({ type, dimmed }) => {
	const { t } = useTranslation();
	return (
		<StatusPill
			token={dimmed ? "neutral" : (TYPE_TOKEN[type] ?? "neutral")}
			label={t(`product.type.${type}`)}
		/>
	);
};

export default ProductTypeChip;
