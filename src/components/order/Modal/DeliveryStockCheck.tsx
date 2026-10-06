import React from "react";
import { useTranslation } from "react-i18next";
import { OrderLine } from "models/order";
import { designTokens, numericSx, radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box } from "@mui/material";

export interface DeliveryLineCheck {
	line: OrderLine;
	/** Served stock of the product in the chosen warehouse. */
	have: number;
	ok: boolean;
}

interface DeliveryStockCheckProps {
	checks: DeliveryLineCheck[];
	shortCount: number;
}

/**
 * «Проверка остатков» for the chosen warehouse: each order line against its
 * stock, short lines tinted with have / need — delivery is blocked below zero
 * (rule 20), so the shortfall is shown before the commit.
 */
const DeliveryStockCheck: React.FC<DeliveryStockCheckProps> = ({ checks, shortCount }) => {
	const { t } = useTranslation();
	const allOk = shortCount === 0;

	return (
		<Box
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: `${radius.md}px`,
				overflow: "hidden",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					p: "10px 13px",
					bgcolor: designTokens.gray25,
					borderBottom: "1px solid",
					borderColor: "divider",
					fontSize: 13,
					fontWeight: 700,
					color: designTokens.gray700,
				}}
			>
				<span>{t("order.deliver.stockCheck")}</span>
				{allOk ? (
					<Box
						component="span"
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "5px",
							color: "success.main",
						}}
					>
						<CheckIcon sx={{ fontSize: 13 }} />
						{t("order.deliver.enough")}
					</Box>
				) : (
					<Box
						component="span"
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "5px",
							color: "error.main",
						}}
					>
						<ErrorOutlineIcon sx={{ fontSize: 13 }} />
						{t("order.deliver.short", { count: shortCount })}
					</Box>
				)}
			</Box>
			{checks.map(({ line, have, ok }) => {
				const unit = measurementShort(t, line.measurement);
				return (
					<Box
						key={line.id}
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: "4px",
							p: "9px 13px",
							borderBottom: "1px solid",
							borderColor: designTokens.gray25,
							"&:last-of-type": { borderBottom: "none" },
							...(ok ? null : { bgcolor: designTokens.errorBg }),
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
							<Box component="span" sx={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0 }}>
								{line.productName}
							</Box>
							<Box
								component="span"
								sx={{
									...numericSx,
									display: "inline-flex",
									alignItems: "center",
									gap: "5px",
									fontWeight: 600,
									whiteSpace: "nowrap",
									color: ok ? "success.main" : "error.main",
								}}
							>
								{ok ? (
									<CheckIcon sx={{ fontSize: 14 }} />
								) : (
									<ErrorOutlineIcon sx={{ fontSize: 13 }} />
								)}
								{t("order.deliver.inStock", { qty: formatQuantity(have), unit })}
							</Box>
						</Box>
						{ok ? (
							<Box component="span" sx={{ ...numericSx, fontSize: 12, color: "text.secondary" }}>
								{t("order.deliver.inOrder", { qty: formatQuantity(line.quantity), unit })}
							</Box>
						) : (
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									fontSize: 12,
									fontWeight: 600,
									color: "error.main",
								}}
							>
								<ErrorOutlineIcon sx={{ fontSize: 13 }} />
								{t("order.deliver.shortLine", {
									have: formatQuantity(have),
									need: formatQuantity(line.quantity),
									unit,
								})}
							</Box>
						)}
					</Box>
				);
			})}
		</Box>
	);
};

export default DeliveryStockCheck;
