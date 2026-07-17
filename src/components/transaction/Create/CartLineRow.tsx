import React from "react";
import { useTranslation } from "react-i18next";
import { CartItem, stockAt } from "hooks/transactions/useTransactionEntry";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";
import { TransactionDirection } from "utils/transactionUtils";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, ButtonBase, IconButton, InputBase, Typography } from "@mui/material";

import { CartLineQty } from "./CartLineQty";
import { fieldLabelSx, segmentedBoxSx, segmentSx } from "./lineSx";

interface CartLineRowProps {
	direction: TransactionDirection;
	item: CartItem;
	warehouseId: number | null;
	lineTotal: number;
	lineDiscount: number;
	/** Focus + select this row's quantity field (set right after the line is added). */
	autoFocusQty: boolean;
	onChange: (patch: Partial<CartItem>) => void;
	onRemove: () => void;
	/** Called once the row has consumed the autofocus request. */
	onAutoFocused: () => void;
	/** Enter in the quantity field → continue adding (refocus the product search). */
	onContinue: () => void;
}

const parseNum = (s: string): number => {
	const n = parseInt(s.replace(/[^\d]/g, ""), 10);
	return Number.isNaN(n) ? 0 : n;
};

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
 * One rich cart line: quantity stepper, editable unit price, line discount
 * (% or fixed currency — rules 37–38), live line total + discount amount, and
 * per-line stock validation (hard-blocks over-stock / zero qty before submit).
 */
export const CartLineRow: React.FC<CartLineRowProps> = ({
	direction,
	item,
	warehouseId,
	lineTotal,
	lineDiscount,
	autoFocusQty,
	onChange,
	onRemove,
	onAutoFocused,
	onContinue,
}) => {
	const { t } = useTranslation();
	const isSale = direction === "Sale";
	const unit = MEASUREMENT_SHORT[item.product.measurement];
	const stock = stockAt(item.product, warehouseId);
	// A supply adds stock, so over-stock never applies — only sales validate it.
	const over = isSale && item.quantity > stock;
	const near = isSale && !over && stock > 0 && item.quantity / stock >= 0.8;
	const invalid = over;

	// Enter from the price / discount fields also continues to the next product.
	const onEnterContinue = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			onContinue();
		}
	};

	return (
		<Box
			sx={{
				p: "14px 18px",
				borderBottom: "1px solid",
				borderColor: "divider",
				"&:last-of-type": { borderBottom: "none" },
				bgcolor: invalid ? designTokens.errorBg : "transparent",
			}}
		>
			<Box sx={{ display: "flex", justifyContent: "space-between", gap: "18px" }}>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.product.name}</Typography>
					<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled", mt: "2px" }}>
						{item.product.sku}
					</Typography>
					{isSale && (
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "5px",
								mt: "5px",
								fontSize: 11.5,
								fontWeight: 600,
								color: over ? "error.main" : near ? "warning.main" : "text.secondary",
							}}
						>
							{over ? (
								<ErrorOutlineIcon sx={{ fontSize: 12 }} />
							) : (
								<Inventory2OutlinedIcon sx={{ fontSize: 12 }} />
							)}
							{over
								? t("transaction.new.line.over", { count: stock, unit })
								: t("transaction.new.line.inStock", { count: stock, unit })}
						</Box>
					)}
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
				{/* quantity stepper + unit toggle (packaged products) */}
				<CartLineQty
					item={item}
					autoFocusQty={autoFocusQty}
					onChange={onChange}
					onAutoFocused={onAutoFocused}
					onContinue={onContinue}
				/>

				{/* unit price */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<Typography sx={fieldLabelSx}>
						{t(isSale ? "transaction.new.line.price" : "transaction.new.line.priceSupply", {
							unit,
						})}
					</Typography>
					<Box sx={boxedInputSx}>
						<Box component="span" sx={{ color: "text.disabled", fontSize: 13 }}>
							×
						</Box>
						<InputBase
							value={item.unitPrice}
							onChange={(e) => onChange({ unitPrice: parseNum(e.target.value) })}
							onKeyDown={onEnterContinue}
							sx={{ width: 84, ...numInputSx }}
						/>
					</Box>
				</Box>

				{/* discount + type toggle */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
					<Typography sx={fieldLabelSx}>{t("transaction.new.line.discount")}</Typography>
					<Box sx={{ display: "flex", gap: "6px" }}>
						<Box sx={boxedInputSx}>
							<InputBase
								value={item.discountValue}
								onChange={(e) => onChange({ discountValue: parseNum(e.target.value) })}
								onKeyDown={onEnterContinue}
								sx={{ width: 56, ...numInputSx }}
							/>
						</Box>
						<Box sx={segmentedBoxSx}>
							{(["Percentage", "Fixed"] as const).map((type) => {
								const selected = item.discountType === type;
								return (
									<ButtonBase
										key={type}
										onClick={() => onChange({ discountType: type })}
										title={type === "Fixed" ? t("transaction.new.line.fixedHint") : undefined}
										sx={segmentSx(selected)}
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
						aria-label={t("transaction.new.line.remove")}
						sx={{
							color: designTokens.gray400,
							"&:hover": { color: "error.main", bgcolor: designTokens.errorBg },
						}}
					>
						<DeleteOutlineIcon sx={{ fontSize: 19 }} />
					</IconButton>
				</Box>
			</Box>

			{invalid && (
				<Box
					sx={{
						mt: "8px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						p: "7px 11px",
						borderRadius: "6px",
						bgcolor: designTokens.errorBg,
						border: "1px solid",
						borderColor: designTokens.errorBorder,
						color: "error.main",
						fontSize: 12.5,
						fontWeight: 600,
					}}
				>
					<ErrorOutlineIcon sx={{ fontSize: 14 }} />
					{t("transaction.new.line.errOver", { count: stock, unit })}
				</Box>
			)}
		</Box>
	);
};

export default CartLineRow;
