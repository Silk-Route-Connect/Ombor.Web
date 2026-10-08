import React from "react";
import { useTranslation } from "react-i18next";
import { sidewaysFadeMask, useSidewaysScroll } from "hooks/shared/useSidewaysScroll";
import { chipTokens, controlSize, designTokens, numericSx, radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { ORDER_STATUS_META, ORDER_STATUS_TABS, OrderStatusFilter } from "utils/orderUtils";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase } from "@mui/material";

interface OrderStatusTabsProps {
	value: OrderStatusFilter;
	counts: Record<OrderStatusFilter, number>;
	onChange: (value: OrderStatusFilter) => void;
}

const tabLabelKey = (tab: OrderStatusFilter): string =>
	tab === "all" ? "order.filter.all" : `order.status.${tab}`;

/** Count colour follows the tab's status chip text («Все» keeps the primary hue). */
const countColor = (tab: OrderStatusFilter): string =>
	tab === "all" ? "primary.main" : chipTokens[ORDER_STATUS_META[tab].token].color;

/**
 * Status filter tabs with count pills (bundle `.seg` + `.seg-cnt`). Like the
 * shared SegmentedControl — same gray track, md control height so it aligns
 * with the sibling header controls — but each tab carries the live count for
 * its status, coloured with that status's chip accent. When the toolbar is too
 * narrow for all eight tabs they scroll sideways (wheel, swipe, Tab or the edge
 * arrow) with a fade at the edge that hides tabs — never a scrollbar inside the
 * 38px track. The arrows skip the Tab order: Tab itself reaches every tab.
 */
export const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({ value, counts, onChange }) => {
	const { t } = useTranslation();
	const strip = useSidewaysScroll<HTMLDivElement>();
	const mask = sidewaysFadeMask(strip.moreBefore, strip.moreAfter);

	return (
		<Box
			sx={{
				position: "relative",
				display: "inline-flex",
				maxWidth: "100%",
				minWidth: 0,
				height: controlSize.md.height,
				bgcolor: designTokens.gray100,
				boxShadow: `inset 0 0 0 1px ${designTokens.border}`,
				borderRadius: `${radius.md}px`,
			}}
		>
			<Box
				ref={strip.ref}
				sx={{
					display: "flex",
					alignItems: "stretch",
					minWidth: 0,
					p: "3px",
					gap: "2px",
					overflowX: "auto",
					overflowY: "hidden",
					scrollbarWidth: "none",
					"&::-webkit-scrollbar": { display: "none" },
					maskImage: mask,
					WebkitMaskImage: mask,
				}}
			>
				{ORDER_STATUS_TABS.map((tab) => {
					const selected = tab === value;
					const count = counts[tab] ?? 0;
					return (
						<ButtonBase
							key={tab}
							onClick={(event) => {
								event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
								onChange(tab);
							}}
							aria-pressed={selected}
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								px: "13px",
								flex: "0 0 auto",
								whiteSpace: "nowrap",
								fontSize: 13,
								fontWeight: selected ? 600 : 500,
								fontFamily: "inherit",
								color: selected ? "text.primary" : "text.secondary",
								borderRadius: `${radius.sm}px`,
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
									}}
								>
									{formatQuantity(count)}
								</Box>
							)}
						</ButtonBase>
					);
				})}
			</Box>
			{([-1, 1] as const).map((direction) =>
				(direction < 0 ? strip.moreBefore : strip.moreAfter) ? (
					<ButtonBase
						key={direction}
						tabIndex={-1}
						aria-hidden
						onClick={() => strip.step(direction)}
						sx={{
							position: "absolute",
							top: 3,
							bottom: 3,
							[direction < 0 ? "left" : "right"]: 3,
							width: 22,
							borderRadius: `${radius.sm}px`,
							bgcolor: designTokens.gray100,
							color: "text.secondary",
						}}
					>
						{direction < 0 ? (
							<ChevronLeftIcon sx={{ fontSize: 18 }} />
						) : (
							<ChevronRightIcon sx={{ fontSize: 18 }} />
						)}
					</ButtonBase>
				) : null,
			)}
		</Box>
	);
};

export default OrderStatusTabs;
