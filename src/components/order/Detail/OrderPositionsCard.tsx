import React from "react";
import { useTranslation } from "react-i18next";
import OrderCard from "components/order/Detail/OrderCard";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import {
	discountShortLabel,
	isOrderEditable,
	lineNet,
	orderDiscountTotal,
	orderSubtotal,
	orderTotal,
} from "utils/orderUtils";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box, Typography } from "@mui/material";

const headCellSx = {
	textAlign: "right",
	fontSize: 11.5,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 14px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
} as const;

const bodyCellSx = {
	textAlign: "right",
	fontSize: 13.5,
	p: "13px 14px",
	borderBottom: "1px solid",
	borderColor: "divider",
	verticalAlign: "middle",
	...numericSx,
} as const;

const FootRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box
		sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5 }}
	>
		<Box component="span" sx={{ color: "text.secondary" }}>
			{label}
		</Box>
		<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
			{children}
		</Box>
	</Box>
);

export const OrderPositionsCard: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();
	const subtotal = orderSubtotal(order.lines);
	const discount = orderDiscountTotal(order.lines);
	const total = orderTotal(order.lines);

	return (
		<OrderCard
			title={t("order.detail.positions")}
			icon={<Inventory2OutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
			count={order.lines.length}
			action={
				isOrderEditable(order.status) ? (
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							fontSize: 12,
							fontWeight: 600,
							color: "primary.main",
						}}
					>
						<EditOutlinedIcon sx={{ fontSize: 13 }} />
						{t("order.detail.editable")}
					</Box>
				) : undefined
			}
		>
			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box component="th" sx={{ ...headCellSx, textAlign: "left", pl: "18px" }}>
							{t("order.detail.col.product")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("order.detail.col.qty")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("order.detail.col.unitPrice")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("order.detail.col.discount")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, pr: "18px" }}>
							{t("order.detail.col.lineTotal")}
						</Box>
					</tr>
				</thead>
				<tbody>
					{order.lines.map((l) => {
						const disc = discountShortLabel(l);
						return (
							<Box component="tr" key={l.id}>
								<Box
									component="td"
									sx={{ ...bodyCellSx, textAlign: "left", pl: "18px", fontFamily: "inherit" }}
								>
									<Typography component="span" sx={{ fontWeight: 600 }}>
										{l.productName}
									</Typography>
									<Typography
										sx={{ ...numericSx, fontSize: 11.5, color: "text.disabled", mt: "2px" }}
									>
										{l.sku}
									</Typography>
								</Box>
								<Box component="td" sx={bodyCellSx}>
									{l.quantity}{" "}
									<Box component="span" sx={{ color: "text.disabled", fontSize: 12 }}>
										{MEASUREMENT_SHORT[l.measurement]}
									</Box>
								</Box>
								<Box component="td" sx={bodyCellSx}>
									{formatCurrency(l.unitPrice)}
								</Box>
								<Box component="td" sx={bodyCellSx}>
									{disc ? (
										<Box component="span" sx={{ color: designTokens.saffron700, fontWeight: 600 }}>
											{disc}
										</Box>
									) : (
										<Box component="span" sx={{ color: "text.disabled" }}>
											—
										</Box>
									)}
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, pr: "18px", fontWeight: 700 }}>
									{formatCurrency(lineNet(l))}
								</Box>
							</Box>
						);
					})}
				</tbody>
			</Box>

			<Box
				sx={{
					p: "14px 18px",
					display: "flex",
					flexDirection: "column",
					gap: "10px",
					bgcolor: designTokens.gray25,
				}}
			>
				<FootRow label={t("order.detail.subtotal")}>{formatCurrency(subtotal)} UZS</FootRow>
				<FootRow label={t("order.detail.discountByLines")}>
					{discount ? (
						<Box component="span" sx={{ color: designTokens.saffron700 }}>
							−{formatCurrency(discount)} UZS
						</Box>
					) : (
						<Box component="span" sx={{ color: "text.disabled" }}>
							—
						</Box>
					)}
				</FootRow>
				<Box sx={{ height: "1px", bgcolor: "divider", my: "2px" }} />
				<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
					<Box component="span" sx={{ fontSize: 15, fontWeight: 700 }}>
						{t("order.detail.total")}
					</Box>
					<Box
						component="span"
						sx={{ ...numericSx, fontSize: 22, fontWeight: 700, color: "primary.main" }}
					>
						{formatCurrency(total)}{" "}
						<Box component="span" sx={{ fontSize: 13, color: "text.disabled", fontWeight: 600 }}>
							UZS
						</Box>
					</Box>
				</Box>
			</Box>
		</OrderCard>
	);
};

export default OrderPositionsCard;
