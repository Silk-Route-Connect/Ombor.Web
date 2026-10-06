import React from "react";
import { useTranslation } from "react-i18next";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { TransactionLineDiscountType } from "models/transaction";

import { Box } from "@mui/material";

import LineMoneyInput from "./LineMoneyInput";

interface LineDiscountFieldProps {
	id: string;
	value: number;
	type: TransactionLineDiscountType;
	onValueChange: (value: number) => void;
	onTypeChange: (type: TransactionLineDiscountType) => void;
	onEnter?: () => void;
}

/**
 * A line discount: the amount and whether it is a percent or a fixed sum taken
 * off the whole line (rule 37) — one control for the sale, supply and order lines.
 */
export const LineDiscountField: React.FC<LineDiscountFieldProps> = ({
	id,
	value,
	type,
	onValueChange,
	onTypeChange,
	onEnter,
}) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ display: "flex", gap: "6px" }}>
			<LineMoneyInput id={id} value={value} onChange={onValueChange} width={96} onEnter={onEnter} />
			<SegmentedControl<TransactionLineDiscountType>
				value={type}
				onChange={onTypeChange}
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
