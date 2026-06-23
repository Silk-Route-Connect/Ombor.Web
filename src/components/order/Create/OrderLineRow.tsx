import React from "react";
import { useTranslation } from "react-i18next";
import { CartItem, stockAt } from "hooks/transactions/useTransactionEntry";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, ButtonBase, IconButton, InputBase, Typography } from "@mui/material";

interface OrderLineRowProps {
	item: CartItem;
	warehouseId: number | null;
	lineTotal: number;
	lineDiscount: number;
	onChange: (patch: Partial<CartItem>) => void;
	onRemove: () => void;
}

const parseNum = (s: string): number => {
	const n = parseInt(s.replace(/[^\d]/g, ""), 10);
	return Number.isNaN(n) ? 0 : n;
};

const fieldLabelSx = {
	fontSize: 10.5,
	fontWeight: 600,
	letterSpacing: "0.04em",
	textTransform: "uppercase",
	color: "text.disabled",
} as const;

const boxedInputSx = {
	height: 36,
	border: "1px solid",
	borderColor: designTokens.gray300,
	borderRadius: "6px",
	bgcolor: "background.paper",
	display: "inline-flex",
	alignItems: "center",
	px: "10px",
	gap: "6px",
	"&:focus-within": { borderColor: "primary.main" },
} as const;

const numInputSx = {
	...numericSx,
	fontWeight: 600,
	fontSize: 14,
	textAlign: "right",
	"& input": { textAlign: "right", p: 0 },
} as const;

/**
 * One editable order line: quantity stepper, editable unit price, line discount
 * (% or fixed currency), and live line total + discount amount. Unlike the
 * sale/supply cart line, stock is shown only as GUIDANCE — an order is a pending
 * intent, so an over-stock quantity is flagged but never blocks creation (the
 * real stock check happens at delivery).
 */
export const OrderLineRow: React.FC<OrderLineRowProps> = ({
	item,
	warehouseId,
	lineTotal,
	lineDiscount,
	onChange,
	onRemove,
}) => {
	const { t } = useTranslation();
	const unit = MEASUREMENT_SHORT[item.product.measurement];
	const stock = stockAt(item.product, warehouseId);
	const over = warehouseId != null && item.quantity > stock;

	const setQty = (next: number) => onChange({ quantity: Math.max(1, next) });

	return (
		<Box
			sx={{
				p: "14px 18px",
				borderBottom: "1px solid",
				borderColor: "divider",
				"&:last-of-type": { borderBottom: "none" },
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", gap: "18px" }}>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.product.name}</Typography>
					<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled", mt: "2px" }}>
						{item.product.sku}
					</Typography>
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "5px",
							mt: "5px",
							fontSize: 11.5,
							fontWeight: 600,
							color: over ? "warning.main" : "text.secondary",
						}}
					>
						<Inventory2OutlinedIcon sx={{ fontSize: 12 }} />
						{warehouseId == null
							? t("order.new.line.noWarehouse")
							: t("order.new.line.inStock", { count: stock, unit })}
						{over && (
							<Box component="span" sx={{ fontWeight: 600 }}>
								{t("order.new.line.overStock")}
							</Box>
						)}
					</Box>
				</Box>
				<Box sx={{ textAlign: "right", flex: "0 0 auto" }}>
					<Typography sx={{ ...numericSx, fontSize: 15, fontWeight: 700 }}>
						{formatCurrency(lineTotal)}
					</Typography>
					{lineDiscount > 0 && (
						<Typography sx={{ ...numericSx, fontSize: 11.5, fontWeight: 600, color: "error.main" }}>
							−{formatCurrency(lineDiscount)}
						</Typography>
					)}
				</Box>
			</Box>

			<Box
				sx={{ display: "flex", alignItems: "flex-end", gap: "14px", flexWrap: "wrap", mt: "10px" }}
			>
				{/* quantity stepper */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<Typography sx={fieldLabelSx}>{t("order.new.line.qty", { unit })}</Typography>
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							height: 36,
							border: "1px solid",
							borderColor: designTokens.gray300,
							borderRadius: "6px",
							overflow: "hidden",
						}}
					>
						<IconButton
							size="small"
							disabled={item.quantity <= 1}
							onClick={() => setQty(item.quantity - 1)}
							sx={{ borderRadius: 0, width: 32, height: 36, color: designTokens.gray600 }}
						>
							<RemoveIcon sx={{ fontSize: 16 }} />
						</IconButton>
						<InputBase
							value={item.quantity}
							onChange={(e) => setQty(parseNum(e.target.value))}
							sx={{
								width: 44,
								height: 36,
								borderLeft: "1px solid",
								borderRight: "1px solid",
								borderColor: "divider",
								"& input": {
									textAlign: "center",
									...numericSx,
									fontWeight: 600,
									fontSize: 14,
									p: 0,
								},
							}}
						/>
						<IconButton
							size="small"
							onClick={() => setQty(item.quantity + 1)}
							sx={{ borderRadius: 0, width: 32, height: 36, color: designTokens.gray600 }}
						>
							<AddIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Box>
				</Box>

				{/* unit price */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<Typography sx={fieldLabelSx}>{t("order.new.line.price", { unit })}</Typography>
					<Box sx={boxedInputSx}>
						<Box component="span" sx={{ color: "text.disabled", fontSize: 13 }}>
							×
						</Box>
						<InputBase
							value={item.unitPrice}
							onChange={(e) => onChange({ unitPrice: parseNum(e.target.value) })}
							sx={{ width: 84, ...numInputSx }}
						/>
					</Box>
				</Box>

				{/* discount + type toggle */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<Typography sx={fieldLabelSx}>{t("order.new.line.discount")}</Typography>
					<Box sx={{ display: "flex", gap: "6px" }}>
						<Box sx={boxedInputSx}>
							<InputBase
								value={item.discountValue}
								onChange={(e) => onChange({ discountValue: parseNum(e.target.value) })}
								sx={{ width: 56, ...numInputSx }}
							/>
						</Box>
						<Box
							sx={{
								display: "inline-flex",
								height: 36,
								border: "1px solid",
								borderColor: designTokens.gray300,
								borderRadius: "6px",
								overflow: "hidden",
							}}
						>
							{(["Percentage", "Fixed"] as const).map((type) => {
								const selected = item.discountType === type;
								return (
									<ButtonBase
										key={type}
										onClick={() => onChange({ discountType: type })}
										title={type === "Fixed" ? t("order.new.line.fixedHint") : undefined}
										sx={{
											px: "9px",
											fontSize: 12,
											fontWeight: 600,
											color: selected ? "primary.main" : "text.secondary",
											bgcolor: selected ? designTokens.primarySoft : "background.paper",
										}}
									>
										{type === "Percentage" ? "%" : <PaymentsOutlinedIcon sx={{ fontSize: 15 }} />}
									</ButtonBase>
								);
							})}
						</Box>
					</Box>
				</Box>

				<Box sx={{ ml: "auto", alignSelf: "flex-end" }}>
					<IconButton
						onClick={onRemove}
						aria-label={t("order.new.line.remove")}
						sx={{
							color: designTokens.gray400,
							"&:hover": { color: "error.main", bgcolor: designTokens.errorBg },
						}}
					>
						<DeleteOutlineIcon sx={{ fontSize: 19 }} />
					</IconButton>
				</Box>
			</Box>
		</Box>
	);
};

export default OrderLineRow;
