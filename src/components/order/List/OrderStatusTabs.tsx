import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";
import { ORDER_STATUS_TABS, OrderStatusFilter } from "utils/orderUtils";

import { Box, ButtonBase } from "@mui/material";

interface OrderStatusTabsProps {
	value: OrderStatusFilter;
	counts: Record<OrderStatusFilter, number>;
	onChange: (value: OrderStatusFilter) => void;
}

const tabLabelKey = (tab: OrderStatusFilter): string =>
	tab === "all" ? "order.filter.all" : `order.status.${tab}`;

/**
 * Status filter tabs with count pills (bundle `.seg` + `.seg-cnt`). Like the
 * shared SegmentedControl but each tab carries the live count for its status.
 */
export const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({ value, counts, onChange }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "inline-flex",
				bgcolor: designTokens.gray100,
				borderRadius: "8px",
				p: "3px",
				gap: "2px",
				flexWrap: "wrap",
			}}
		>
			{ORDER_STATUS_TABS.map((tab) => {
				const selected = tab === value;
				const count = counts[tab] ?? 0;
				return (
					<ButtonBase
						key={tab}
						onClick={() => onChange(tab)}
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							px: "12px",
							py: "6px",
							fontSize: 13,
							fontWeight: selected ? 600 : 500,
							fontFamily: "inherit",
							color: selected ? "text.primary" : "text.secondary",
							borderRadius: "6px",
							bgcolor: selected ? "background.paper" : "transparent",
							boxShadow: selected ? 1 : "none",
						}}
					>
						{t(tabLabelKey(tab))}
						{count > 0 && (
							<Box
								component="span"
								sx={{
									...{ fontVariantNumeric: "tabular-nums" },
									fontSize: 11,
									fontWeight: 700,
									color: selected ? "primary.main" : "text.disabled",
								}}
							>
								{count}
							</Box>
						)}
					</ButtonBase>
				);
			})}
		</Box>
	);
};

export default OrderStatusTabs;
