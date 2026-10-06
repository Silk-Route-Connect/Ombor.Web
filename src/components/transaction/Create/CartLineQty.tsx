import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import QtyStepper from "components/shared/Inputs/QtyStepper";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { CartItem } from "hooks/transactions/useTransactionEntry";
import { controlSize, numericSx } from "theme";
import { measurementShort, measurementShortLabel } from "utils/productUtils";

import { Box, Typography } from "@mui/material";

import LineField from "./LineField";

type UnitMode = "unit" | "pack";

interface CartLineQtyProps {
	id: string;
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
 * The cart line's quantity: the shared stepper and — for packaged products — a
 * base-unit/package toggle (rule 21: entry in packages, quantity stored in whole
 * base units; the entered pack count itself is not persisted — F21). In package
 * mode every write multiplies through the package size, so quantity always stays
 * a whole number of packages.
 */
export const CartLineQty: React.FC<CartLineQtyProps> = ({
	id,
	item,
	autoFocusQty,
	onChange,
	onAutoFocused,
	onContinue,
}) => {
	const { t } = useTranslation();
	const unit = measurementShort(t, item.product.measurement);
	const unitLabel = measurementShortLabel(t, item.product.measurement);
	const packaging = item.product.packaging;
	const packSize = packaging != null && packaging.size >= 2 ? packaging.size : null;
	const inPackages = item.inPackages === true && packSize != null;
	// Base units per display unit; every quantity write multiplies through it.
	const step = inPackages && packSize ? packSize : 1;
	const displayQty =
		inPackages && packSize ? Math.max(1, Math.round(item.quantity / packSize)) : item.quantity;

	const qtyRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (autoFocusQty && qtyRef.current) {
			qtyRef.current.focus();
			qtyRef.current.select();
			onAutoFocused();
		}
	}, [autoFocusQty, onAutoFocused]);

	// Switching the unit converts UP to whole packages so the line never shrinks
	// below what was entered, and keeps focus in the field for immediate typing.
	const setUnitMode = (mode: UnitMode) => {
		const packs = mode === "pack";
		if (packSize == null || packs === inPackages) {
			return;
		}
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
		<LineField
			label={t("transaction.new.line.qty", {
				unit: inPackages ? t("transaction.new.line.packShort") : unitLabel,
			})}
			htmlFor={id}
		>
			<Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
				<QtyStepper
					id={id}
					value={displayQty}
					onChange={(next) => onChange({ quantity: next * step })}
					inputRef={qtyRef}
					onEnter={onContinue}
				/>
				{packSize != null && (
					<SegmentedControl<UnitMode>
						value={inPackages ? "pack" : "unit"}
						onChange={setUnitMode}
						options={[
							{ value: "unit", label: unitLabel },
							{
								value: "pack",
								label: t("transaction.new.line.packShort"),
								title:
									packaging?.label ||
									t("transaction.new.line.packTooltip", { size: packSize, unit }),
							},
						]}
					/>
				)}
				{inPackages && (
					<Typography
						variant="caption"
						sx={{
							...numericSx,
							lineHeight: `${controlSize.md.height}px`,
							color: "text.secondary",
							whiteSpace: "nowrap",
						}}
					>
						{t("transaction.new.line.packTotal", { count: item.quantity, unit })}
					</Typography>
				)}
			</Box>
		</LineField>
	);
};

export default CartLineQty;
