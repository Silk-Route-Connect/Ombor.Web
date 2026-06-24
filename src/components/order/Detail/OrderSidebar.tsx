import React from "react";
import { useTranslation } from "react-i18next";
import OrderCard from "components/order/Detail/OrderCard";
import OrderSourceChip from "components/order/OrderSourceChip";
import OrderStatusChip from "components/order/OrderStatusChip";
import PartnerAvatar from "components/partner/PartnerAvatar";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { isOrderEditable, ORDER_NEXT_STEP, orderTotal } from "utils/orderUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Typography } from "@mui/material";

const FinRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
		<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
			{label}
		</Box>
		{children}
	</Box>
);

export const OrderSidebar: React.FC<{ order: Order; onOpenCustomer: () => void }> = ({
	order,
	onOpenCustomer,
}) => {
	const { t } = useTranslation();
	const total = orderTotal(order.lines);
	const step = ORDER_NEXT_STEP[order.status];

	const balance = order.customerBalance;
	const balanceLabel =
		balance > 0
			? t("order.balance.owesYou", { amount: formatCurrency(Math.abs(balance)) })
			: balance < 0
				? t("order.balance.youOwe", { amount: formatCurrency(Math.abs(balance)) })
				: t("order.balance.settled");
	const balanceColor = balance > 0 ? "success.main" : balance < 0 ? "error.main" : "text.secondary";

	return (
		<>
			{/* partner mini */}
			<OrderCard>
				<Box sx={{ p: "16px 18px" }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<PartnerAvatar name={order.customerName} size={44} />
						<Box sx={{ minWidth: 0 }}>
							<Typography
								onClick={onOpenCustomer}
								sx={{
									fontSize: 15,
									fontWeight: 700,
									color: "primary.main",
									cursor: "pointer",
									"&:hover": { textDecoration: "underline" },
								}}
							>
								{order.customerName}
							</Typography>
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									mt: "4px",
									px: "8px",
									py: "1px",
									borderRadius: "999px",
									fontSize: 11,
									fontWeight: 600,
									color: "info.main",
									bgcolor: "rgba(42,111,151,0.12)",
									border: "1px solid rgba(42,111,151,0.24)",
								}}
							>
								{t(`order.partnerType.${order.customerType}`)}
							</Box>
						</Box>
					</Box>
					<Box
						sx={{
							mt: "14px",
							pt: "13px",
							borderTop: "1px solid",
							borderColor: "divider",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
							{t("order.detail.customerBalance")}
						</Typography>
						<Typography sx={{ ...numericSx, fontSize: 13.5, fontWeight: 700, color: balanceColor }}>
							{balanceLabel}
						</Typography>
					</Box>
				</Box>
			</OrderCard>

			{/* financial */}
			<OrderCard>
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
						<FinRow label={t("order.detail.positionsCount")}>
							<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
								{order.lines.length}
							</Box>
						</FinRow>
						<FinRow label={t("order.col.source")}>
							<OrderSourceChip source={order.source} />
						</FinRow>
						<FinRow label={t("order.col.status")}>
							<OrderStatusChip status={order.status} />
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
			</OrderCard>

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
