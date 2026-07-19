import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CartItem } from "hooks/transactions/useTransactionEntry";
import { designTokens, numericSx } from "theme";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, ButtonBase, IconButton, InputBase, Typography } from "@mui/material";

import { fieldLabelSx, segmentedBoxSx, segmentSx } from "./lineSx";

interface CartLineQtyProps {
	item: CartItem;
	/** Focus + select the quantity field (set right after the line is added). */
	autoFocusQty: boolean;
	onChange: (patch: Partial<CartItem>) => void;
	/** Called once the field has consumed the autofocus request. */
	onAutoFocused: () => void;
	/** Enter in the quantity field → continue adding (refocus the product search). */
	onContinue: () => void;
}

/**
 * The cart line's quantity control: stepper with a free-form draft buffer, and —
 * for packaged products — a base-unit/package segmented toggle (rule 21: entry in
 * packages, quantity stored in whole base units; the entered pack count itself is
 * not persisted — F21). In package mode every write multiplies through the
 * package size, so quantity always stays a whole number of packages.
 */
export const CartLineQty: React.FC<CartLineQtyProps> = ({
	item,
	autoFocusQty,
	onChange,
	onAutoFocused,
	onContinue,
}) => {
	const { t } = useTranslation();
	const unit = MEASUREMENT_SHORT[item.product.measurement];
	const packaging = item.product.packaging;
	const packSize = packaging != null && packaging.size >= 2 ? packaging.size : null;
	const inPackages = item.inPackages === true && packSize != null;
	// Base units per display unit; every quantity write multiplies through it.
	const step = inPackages && packSize ? packSize : 1;
	const displayQty =
		inPackages && packSize ? Math.max(1, Math.round(item.quantity / packSize)) : item.quantity;

	const qtyRef = useRef<HTMLInputElement>(null);

	// Free-form editing buffer for the quantity: lets the field go empty while
	// retyping (clear «32» → type «55») instead of snapping back to the min on
	// every keystroke. Only a valid value (≥ 1) commits; blur and the stepper
	// revert the buffer to the controlled value. Focus selects all so a
	// click-then-type replaces too. Holds package counts while in package mode.
	const [qtyDraft, setQtyDraft] = useState<string | null>(null);
	const qtyValue = qtyDraft ?? String(displayQty);

	useEffect(() => {
		if (autoFocusQty && qtyRef.current) {
			qtyRef.current.focus();
			qtyRef.current.select();
			onAutoFocused();
		}
	}, [autoFocusQty, onAutoFocused]);

	const setDisplayQty = (next: number) => {
		setQtyDraft(null);
		onChange({ quantity: Math.max(1, next) * step });
	};
	const onQtyChange = (raw: string) => {
		setQtyDraft(raw);
		const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
		if (!Number.isNaN(n) && n >= 1) {
			onChange({ quantity: n * step });
		}
	};
	const onQtyKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setDisplayQty(displayQty + 1);
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setDisplayQty(displayQty - 1);
		} else if (e.key === "Enter") {
			e.preventDefault();
			onContinue();
		}
	};

	// Switching the unit resets the draft (digits typed as base units must not be
	// re-read as packs), converts UP to whole packages so the line never shrinks
	// below what was entered, and keeps focus in the field for immediate typing.
	const setUnitMode = (packs: boolean) => {
		if (packSize == null || packs === inPackages) {
			return;
		}
		setQtyDraft(null);
		if (packs) {
			const packCount = Math.max(1, Math.ceil(item.quantity / packSize));
			onChange({ inPackages: true, quantity: packCount * packSize });
		} else {
			onChange({ inPackages: false });
		}
		qtyRef.current?.focus();
		qtyRef.current?.select();
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
			<Typography sx={fieldLabelSx}>
				{t("transaction.new.line.qty", {
					unit: inPackages ? t("transaction.new.line.packShort") : unit,
				})}
			</Typography>
			<Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
						disabled={displayQty <= 1}
						onClick={() => setDisplayQty(displayQty - 1)}
						sx={{ borderRadius: 0, width: 32, height: 36, color: designTokens.gray600 }}
					>
						<RemoveIcon sx={{ fontSize: 16 }} />
					</IconButton>
					<InputBase
						inputRef={qtyRef}
						value={qtyValue}
						onFocus={(e) => e.currentTarget.select()}
						onChange={(e) => onQtyChange(e.target.value)}
						onBlur={() => setQtyDraft(null)}
						onKeyDown={onQtyKeyDown}
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
						onClick={() => setDisplayQty(displayQty + 1)}
						sx={{ borderRadius: 0, width: 32, height: 36, color: designTokens.gray600 }}
					>
						<AddIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</Box>

				{packSize != null && (
					<Box sx={segmentedBoxSx}>
						<ButtonBase onClick={() => setUnitMode(false)} sx={segmentSx(!inPackages)}>
							{unit}
						</ButtonBase>
						<ButtonBase
							onClick={() => setUnitMode(true)}
							title={
								packaging?.label || t("transaction.new.line.packTooltip", { size: packSize, unit })
							}
							sx={segmentSx(inPackages)}
						>
							{t("transaction.new.line.packShort")}
						</ButtonBase>
					</Box>
				)}

				{inPackages && (
					<Typography
						sx={{ ...numericSx, fontSize: 12, color: "text.disabled", whiteSpace: "nowrap" }}
					>
						{t("transaction.new.line.packTotal", { count: item.quantity, unit })}
					</Typography>
				)}
			</Box>
		</Box>
	);
};

export default CartLineQty;
