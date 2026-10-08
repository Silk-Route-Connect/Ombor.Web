import React from "react";
import { useTranslation } from "react-i18next";
import PercentField from "components/shared/Inputs/PercentField";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { TransactionLineDiscountType } from "models/transaction";

import { Box } from "@mui/material";

import LineMoneyInput from "./LineMoneyInput";

/** The discount amount's width — «99,99» or a six-figure fixed sum. */
const DISCOUNT_WIDTH = 96;

interface LineDiscountFieldProps {
	id: string;
	value: number;
	type: TransactionLineDiscountType;
	onValueChange: (value: number) => void;
	onTypeChange: (type: TransactionLineDiscountType) => void;
	/** Only while a modal's save is in flight. */
	disabled?: boolean;
	onEnter?: () => void;
}

/**
 * A line discount: the amount and whether it is a percent or a fixed sum taken
 * off the whole line (rule 37) — one control for the sale, supply and order
 * lines and the order-edit modal. A percent may be fractional («1,5» is 1.5 %);
 * a fixed sum is whole UZS, so switching a fractional percent to a fixed sum
 * rounds it instead of showing «1,50» in a whole-sum field.
 */
export const LineDiscountField: React.FC<LineDiscountFieldProps> = ({
	id,
	value,
	type,
	onValueChange,
	onTypeChange,
	disabled,
	onEnter,
}) => {
	const { t } = useTranslation();

	const changeType = (next: TransactionLineDiscountType) => {
		if (next === "Fixed" && !Number.isInteger(value)) {
			onValueChange(Math.round(value));
		}
		onTypeChange(next);
	};

	const handleEnter = (e: React.KeyboardEvent) => {
		if (onEnter && e.key === "Enter") {
			e.preventDefault();
			onEnter();
		}
	};

	return (
		<Box sx={{ display: "flex", gap: "6px" }}>
			{type === "Percentage" ? (
				<PercentField
					id={id}
					value={value}
					onChange={onValueChange}
					unit={false}
					placeholder="0"
					fullWidth={false}
					disabled={disabled}
					onKeyDown={handleEnter}
					sx={{ width: DISCOUNT_WIDTH }}
				/>
			) : (
				<LineMoneyInput
					id={id}
					value={value}
					onChange={onValueChange}
					width={DISCOUNT_WIDTH}
					unit={false}
					disabled={disabled}
					onEnter={onEnter}
				/>
			)}
			<SegmentedControl<TransactionLineDiscountType>
				value={type}
				onChange={changeType}
				disabled={disabled}
				options={[
					{ value: "Percentage", label: "%" },
					{
						value: "Fixed",
						label: t("common.unit.uzs"),
						title: t("transaction.new.line.fixedHint"),
					},
				]}
			/>
		</Box>
	);
};

export default LineDiscountField;
