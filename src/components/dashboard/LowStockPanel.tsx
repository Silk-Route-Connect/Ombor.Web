import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import StockLevelPill from "components/product/StockLevelPill";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isReady, Loadable } from "helpers/Loading";
import { Product } from "models/product";
import { radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";
import { stockAlerts } from "utils/stockAlerts";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase, Paper, Typography } from "@mui/material";

/** Enough to act on at a glance; «Все» opens the full filtered list. */
const SHOWN = 6;

interface LowStockPanelProps {
	products: Loadable<Product[]>;
	onRetry: () => void;
	/** Products filtered by «Остаток: Заканчивается». */
	onAll: () => void;
}

/**
 * «Заканчивается» — products at or below their «Минимальный остаток» or out of
 * stock, the emptiest first: the same set as Products «Остаток: Заканчивается»,
 * which «Все» opens. Each name opens the product.
 */
const LowStockPanel: React.FC<LowStockPanelProps> = ({ products, onRetry, onAll }) => {
	const { t } = useTranslation();
	const alerts = useMemo(() => (isReady(products) ? stockAlerts(products) : []), [products]);
	const outCount = alerts.filter((a) => a.level === "out").length;

	const unitQty = (value: number, product: Product) =>
		`${formatQuantity(value)} ${measurementShort(t, product.measurement)}`.trim();

	return (
		<Paper
			elevation={1}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
				overflow: "hidden",
				mt: "16px",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "6px 14px",
					p: "16px 20px",
				}}
			>
				<Typography sx={{ fontSize: 15, fontWeight: 600 }}>
					{t("dashboard.lowStock.title")}
				</Typography>
				{alerts.length > 0 && (
					<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
						{t("dashboard.lowStock.summary", { out: outCount, low: alerts.length - outCount })}
					</Typography>
				)}
				<ButtonBase
					onClick={onAll}
					sx={{
						ml: "auto",
						gap: "4px",
						px: "6px",
						borderRadius: `${radius.sm}px`,
						fontFamily: "inherit",
						fontSize: 13,
						fontWeight: 600,
						color: "primary.main",
						"&:hover": { color: "primary.dark" },
					}}
				>
					{t("dashboard.lowStock.all")}
					<ChevronRightIcon sx={{ fontSize: 16 }} />
				</ButtonBase>
			</Box>

			{!isReady(products) ? (
				<LoadStateView
					state={products}
					size="section"
					onRetry={onRetry}
					errorTitle={t("product.error.getAll")}
				/>
			) : alerts.length === 0 ? (
				<Typography sx={{ p: "0 20px 18px", fontSize: 13, color: "text.secondary" }}>
					{t("dashboard.lowStock.empty")}
				</Typography>
			) : (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
						borderTop: 1,
						borderColor: "divider",
					}}
				>
					{alerts.slice(0, SHOWN).map(({ product, level }) => (
						<Box
							key={product.id}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
								p: "12px 20px",
								minWidth: 0,
								borderBottom: 1,
								borderColor: "divider",
							}}
						>
							<Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
								<Box sx={{ overflow: "hidden", textOverflow: "ellipsis", fontSize: 14 }}>
									<ProductLink id={product.id} name={product.name} />
								</Box>
								<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
									{(product.lowStockThreshold ?? 0) > 0
										? t("dashboard.lowStock.leftOfMin", {
												qty: unitQty(product.totalStock, product),
												min: unitQty(product.lowStockThreshold ?? 0, product),
											})
										: t("dashboard.lowStock.left", { qty: unitQty(product.totalStock, product) })}
								</Typography>
							</Box>
							<StockLevelPill level={level} />
						</Box>
					))}
				</Box>
			)}
		</Paper>
	);
};

export default LowStockPanel;
