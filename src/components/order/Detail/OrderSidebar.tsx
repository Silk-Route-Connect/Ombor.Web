import React from "react";
import { useTranslation } from "react-i18next";
import OrderSourceChip from "components/order/OrderSourceChip";
import OrderStatusChip from "components/order/OrderStatusChip";
import PartnerLink from "components/partner/Links/PartnerLink";
import DetailNote from "components/shared/Detail/DetailNote";
import { FactDivider, FactList, FactRow } from "components/shared/Detail/FactRow";
import HeroAmountCard from "components/shared/Detail/HeroAmountCard";
import { Order } from "models/order";
import { designTokens, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { isOrderEditable, ORDER_NEXT_STEP, orderSubtotal } from "utils/orderUtils";

import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box } from "@mui/material";

/**
 * Order summary rail — one card (merged from the former partner + financial
 * cards): the served order total with its status, then Подытог / Скидка and
 * Клиент / Источник. The line count and the partner's balance are intentionally
 * dropped — the served balance is the partner's *current* position, not their
 * balance at order time, so showing it against a past order misleads.
 */
export const OrderSidebar: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();
	const subtotal = orderSubtotal(order.lines);
	// The served total wins (hard rule 8): the discount is whatever separates it
	// from the undiscounted lines, so the rows always add up to the hero figure.
	const discount = subtotal - order.total;
	const step = ORDER_NEXT_STEP[order.status];

	return (
		<>
			<HeroAmountCard
				caption={t("order.detail.orderAmount")}
				value={formatCurrency(order.total)}
				status={<OrderStatusChip status={order.status} />}
			>
				<FactList divided={false} inset={false}>
					<FactRow label={t("order.detail.subtotal")} money={subtotal} />
					<FactRow
						label={t("order.detail.discountByLines")}
						money={discount}
						valueColor={designTokens.saffron700}
					/>
					<FactDivider />
					<FactRow label={t("order.detail.customer")}>
						<PartnerLink id={order.customerId} name={order.customerName} />
					</FactRow>
					<FactRow label={t("order.col.source")}>
						<OrderSourceChip source={order.source} />
					</FactRow>
				</FactList>
				{isOrderEditable(order.status) && (
					<DetailNote>{t("order.detail.untouchedHint")}</DetailNote>
				)}
			</HeroAmountCard>

			{/* promote-to-sale hint */}
			{step?.promote && (
				<Box
					sx={{
						display: "flex",
						gap: "11px",
						p: "14px 16px",
						borderRadius: `${radius.lg}px`,
						bgcolor: designTokens.primarySoft,
						border: "1px solid",
						borderColor: designTokens.primaryLine,
						color: "primary.main",
						typography: "body2",
						lineHeight: 1.5,
					}}
				>
					<ReceiptLongOutlinedIcon sx={{ fontSize: 18, flex: "0 0 auto", mt: "1px" }} />
					<Box>{t("order.detail.promoteHint")}</Box>
				</Box>
			)}
		</>
	);
};

export default OrderSidebar;
