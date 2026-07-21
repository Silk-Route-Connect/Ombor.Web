import React from "react";
import { useTranslation } from "react-i18next";
import OrderSourceChip from "components/order/OrderSourceChip";
import OrderStatusChip from "components/order/OrderStatusChip";
import DetailCard from "components/shared/Detail/DetailCard";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { isOrderEditable, ORDER_NEXT_STEP, orderSubtotal, orderTotal } from "utils/orderUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Typography } from "@mui/material";

const FinRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
		<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
			{label}
		</Box>
		{children}
	</Box>
);

/**
 * Order summary rail — a single card (merged from the former partner + financial
 * cards): the order amount hero, then Партнёр / Скидка / Статус / Источник rows.
 * The line count and the partner's balance are intentionally dropped — the served
 * balance is the partner's *current* position, not their balance at order time, so
 * showing it against a past order misleads.
 */
export const OrderSidebar: React.FC<{ order: Order; onOpenCustomer: () => void }> = ({
	order,
	onOpenCustomer,
}) => {
	const { t } = useTranslation();
	const total = orderTotal(order.lines);
	const discount = orderSubtotal(order.lines) - total;
	const step = ORDER_NEXT_STEP[order.status];

	return (
		<>
			<DetailCard>
				<Box sx={{ p: "18px" }}>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
						{t("order.detail.orderAmount")}
					</Typography>
					<Typography
						sx={{
							...numericSx,
							fontSize: 34,
							fontWeight: 700,
							letterSpacing: "-0.025em",
							lineHeight: 1,
							color: "primary.main",
							mt: "6px",
						}}
					>
						{formatCurrency(total)}
						<Box
							component="span"
							sx={{ fontSize: 14, fontWeight: 600, color: "text.disabled", ml: "7px" }}
						>
							UZS
						</Box>
					</Typography>

					<Box
						sx={{
							mt: "18px",
							pt: "16px",
							borderTop: "1px solid",
							borderColor: "divider",
							display: "flex",
							flexDirection: "column",
							gap: "13px",
						}}
					>
						<FinRow label={t("order.detail.customer")}>
							<Box
								component="span"
								onClick={onOpenCustomer}
								sx={{
									fontWeight: 700,
									color: "primary.main",
									cursor: "pointer",
									textAlign: "right",
									"&:hover": { textDecoration: "underline" },
								}}
							>
								{order.customerName}
							</Box>
						</FinRow>
						<FinRow label={t("order.detail.discount")}>
							<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
								{formatCurrency(discount)}
							</Box>
						</FinRow>
						<FinRow label={t("order.col.status")}>
							<OrderStatusChip status={order.status} />
						</FinRow>
						<FinRow label={t("order.col.source")}>
							<OrderSourceChip source={order.source} />
						</FinRow>
					</Box>

					{isOrderEditable(order.status) && (
						<Box
							sx={{
								display: "flex",
								alignItems: "flex-start",
								gap: "8px",
								mt: "16px",
								p: "10px 12px",
								bgcolor: designTokens.gray25,
								border: "1px solid",
								borderColor: "divider",
								borderRadius: "8px",
								fontSize: 12,
								color: "text.secondary",
								lineHeight: 1.45,
							}}
						>
							<InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", mt: "1px" }} />
							{t("order.detail.untouchedHint")}
						</Box>
					)}
				</Box>
			</DetailCard>

			{/* promote-to-sale hint */}
			{step?.promote && (
				<Box
					sx={{
						display: "flex",
						gap: "11px",
						p: "14px 16px",
						borderRadius: "12px",
						bgcolor: designTokens.primarySoft,
						border: "1px solid",
						borderColor: designTokens.primaryLine,
						color: "primary.main",
						fontSize: 13,
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
