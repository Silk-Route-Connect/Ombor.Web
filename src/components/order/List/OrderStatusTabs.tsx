import React from "react";
import { useTranslation } from "react-i18next";
import { controlSize, designTokens, numericSx } from "theme";
import { ORDER_STATUS_META, ORDER_STATUS_TABS, OrderStatusFilter } from "utils/orderUtils";

import { Box, ButtonBase } from "@mui/material";

interface OrderStatusTabsProps {
	value: OrderStatusFilter;
	counts: Record<OrderStatusFilter, number>;
	onChange: (value: OrderStatusFilter) => void;
}

const tabLabelKey = (tab: OrderStatusFilter): string =>
	tab === "all" ? "order.filter.all" : `order.status.${tab}`;

/** Count colour follows the tab's status chip accent («Все» keeps the primary hue). */
const countColor = (tab: OrderStatusFilter): string =>
	tab === "all" ? "primary.main" : ORDER_STATUS_META[tab].chip.color;

/**
 * Status filter tabs with count pills (bundle `.seg` + `.seg-cnt`). Like the
 * shared SegmentedControl — same gray track, md control height so it aligns
 * with the sibling header controls — but each tab carries the live count for
 * its status, coloured with that status's chip accent.
 */
export const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({ value, counts, onChange }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "inline-flex",
				alignItems: "stretch",
				height: controlSize.md.height,
				bgcolor: designTokens.gray100,
				borderRadius: "8px",
				p: "3px",
				gap: "2px",
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
							px: "13px",
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
									...numericSx,
									fontSize: 11,
									fontWeight: 700,
									color: countColor(tab),
									opacity: selected ? 1 : 0.75,
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
