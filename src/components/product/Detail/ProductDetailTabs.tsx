import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens, numericSx } from "theme";

import { Box, ButtonBase } from "@mui/material";

export type ProductDetailTab = "overview" | "transactions" | "movements";

interface ProductDetailTabsProps {
	value: ProductDetailTab;
	transactionCount: number | null;
	onChange: (tab: ProductDetailTab) => void;
}

const TABS: ProductDetailTab[] = ["overview", "transactions", "movements"];

/**
 * Underline tabs per the bundle's `.prod-tabs`/`.tab`: 2px primary underline
 * on the active tab, with a count pill on «Транзакции».
 */
export const ProductDetailTabs: React.FC<ProductDetailTabsProps> = ({
	value,
	transactionCount,
	onChange,
}) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ display: "flex", gap: "4px", borderBottom: 1, borderColor: "divider" }}>
			{TABS.map((tab) => {
				const selected = tab === value;
				return (
					<ButtonBase
						key={tab}
						onClick={() => onChange(tab)}
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							p: "11px 14px",
							mb: "-1px",
							fontSize: 14,
							fontFamily: "inherit",
							fontWeight: selected ? 600 : 500,
							color: selected ? "primary.main" : "text.secondary",
							borderBottom: "2px solid",
							borderColor: selected ? "primary.main" : "transparent",
							"&:hover": { color: selected ? "primary.main" : "text.primary" },
						}}
					>
						{t(`product.detail.tabs.${tab}`)}
						{tab === "transactions" && transactionCount != null && (
							<Box
								component="span"
								sx={{
									...numericSx,
									fontSize: 11,
									fontWeight: 700,
									borderRadius: "999px",
									px: "7px",
									py: "1px",
									color: selected ? "primary.main" : "text.secondary",
									bgcolor: selected ? designTokens.primarySoft : designTokens.gray100,
								}}
							>
								{transactionCount}
							</Box>
						)}
					</ButtonBase>
				);
			})}
		</Box>
	);
};

export default ProductDetailTabs;
