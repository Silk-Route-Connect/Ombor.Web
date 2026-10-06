import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import DetailTable from "components/shared/Detail/DetailTable";
import UzsUnit from "components/shared/Money/UzsUnit";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import SkuCell from "components/shared/Table/cells/SkuCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { Order, OrderLine } from "models/order";
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

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box } from "@mui/material";

const FootRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box
		sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}
	>
		<Box component="span" sx={{ color: "text.secondary" }}>
			{label}
		</Box>
		<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
			{children}
		</Box>
	</Box>
);

/**
 * The order's lines — Товар · Артикул · Кол-во · Цена · Скидка · Сумма — with
 * the subtotal / discount / total summary.
 */
export const OrderPositionsCard: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();
	const discount = orderDiscountTotal(order.lines);

	const columns = useMemo<Column<OrderLine>[]>(
		() => [
			{
				key: "product",
				headerName: t("order.detail.col.product"),
				sortValue: (l) => l.productName,
				renderCell: (l) => <ProductLink id={l.productId} name={l.productName} />,
			},
			{
				key: "sku",
				headerName: t("order.detail.col.sku"),
				sortValue: (l) => l.sku,
				renderCell: (l) => <SkuCell sku={l.sku} />,
			},
			{
				key: "quantity",
				headerName: t("order.detail.col.qty"),
				align: "right",
				sortValue: (l) => l.quantity,
				renderCell: (l) => <QuantityCell value={l.quantity} measurement={l.measurement} />,
			},
			{
				key: "unitPrice",
				headerName: t("order.detail.col.unitPrice"),
				align: "right",
				sortValue: (l) => l.unitPrice,
				renderCell: (l) => <MoneyCell value={l.unitPrice} />,
			},
			{
				key: "discount",
				headerName: t("order.detail.col.discount"),
				align: "right",
				sortValue: (l) => l.discount,
				renderCell: (l) => {
					const label = discountShortLabel(l);
					return label ? (
						<Box component="span" sx={{ color: designTokens.saffron700, fontWeight: 600 }}>
							{label}
						</Box>
					) : (
						<NoValue />
					);
				},
			},
			{
				key: "total",
				headerName: t("order.detail.col.lineTotal"),
				align: "right",
				sortValue: lineNet,
				renderCell: (l) => <MoneyCell value={lineNet(l)} main />,
			},
		],
		[t],
	);

	return (
		<DetailCard
			title={t("order.detail.positions")}
			icon={<Inventory2OutlinedIcon sx={detailCardIconSx} />}
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
			<DetailTable<OrderLine> rows={order.lines} columns={columns} />

			<Box
				sx={{
					p: "14px 18px",
					display: "flex",
					flexDirection: "column",
					gap: "10px",
					borderTop: 1,
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<FootRow label={t("order.detail.subtotal")}>
					{formatCurrency(orderSubtotal(order.lines))}
					<UzsUnit />
				</FootRow>
				<FootRow label={t("order.detail.discountByLines")}>
					{discount ? (
						<Box component="span" sx={{ color: designTokens.saffron700 }}>
							{formatCurrency(discount)}
							<UzsUnit />
						</Box>
					) : (
						<NoValue />
					)}
				</FootRow>
				<Box sx={{ height: "1px", bgcolor: "divider", my: "2px" }} />
				<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
					<Box component="span" sx={{ fontSize: 15, fontWeight: 700 }}>
						{t("order.detail.total")}
					</Box>
					<Box
						component="span"
						sx={{ ...numericSx, fontSize: 20, fontWeight: 700, color: "primary.main" }}
					>
						{formatCurrency(orderTotal(order.lines))}
						<UzsUnit />
					</Box>
				</Box>
			</Box>
		</DetailCard>
	);
};

export default OrderPositionsCard;
