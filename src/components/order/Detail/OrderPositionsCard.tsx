import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import { detailTableSx } from "components/shared/Detail/detailTableChrome";
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
		<DetailCard
			title={t("order.detail.positions")}
			icon={<Inventory2OutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
			count={order.lines.length}
			headerExtra={
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
			<Box component="table" sx={detailTableSx}>
				<thead>
					<tr>
						<th>{t("order.detail.col.product")}</th>
						<th className="r">{t("order.detail.col.qty")}</th>
						<th className="r">{t("order.detail.col.unitPrice")}</th>
						<th className="r">{t("order.detail.col.discount")}</th>
						<th className="r">{t("order.detail.col.lineTotal")}</th>
					</tr>
				</thead>
				<tbody>
					{order.lines.map((l) => {
						const disc = discountShortLabel(l);
						return (
							<tr key={l.id}>
								<td>
									<Typography component="span" sx={{ fontSize: 13.5, fontWeight: 600 }}>
										{l.productName}
									</Typography>
									<Typography
										sx={{ ...numericSx, fontSize: 12, color: "text.secondary", mt: "2px" }}
									>
										{l.sku}
									</Typography>
								</td>
								<td className="r">
									<Box component="span" sx={numericSx}>
										{l.quantity}{" "}
										<Box component="span" sx={{ color: "text.secondary", fontSize: 12 }}>
											{MEASUREMENT_SHORT[l.measurement]}
										</Box>
									</Box>
								</td>
								<td className="r">
									<Box component="span" sx={numericSx}>
										{formatCurrency(l.unitPrice)}
									</Box>
								</td>
								<td className="r">
									{disc ? (
										<Box
											component="span"
											sx={{ ...numericSx, color: designTokens.saffron700, fontWeight: 600 }}
										>
											{disc}
										</Box>
									) : (
										<Box component="span" sx={{ color: "text.disabled" }}>
											—
										</Box>
									)}
								</td>
								<td className="r">
									<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
										{formatCurrency(lineNet(l))}
									</Box>
								</td>
							</tr>
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
					borderTop: "1px solid",
					borderColor: "divider",
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
		</DetailCard>
	);
};

export default OrderPositionsCard;
