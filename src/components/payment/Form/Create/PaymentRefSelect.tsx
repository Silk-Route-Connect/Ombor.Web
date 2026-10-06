import React from "react";

import { Box, MenuItem, Select } from "@mui/material";

export interface PaymentRefOption {
	id: number;
	label: string;
	/** Muted detail at the item's right end — partner type, position, wallet type. */
	meta: string;
}

interface PaymentRefSelectProps {
	value: number | null;
	options: PaymentRefOption[];
	placeholder: string;
	error?: boolean;
	onChange: (id: number) => void;
}

/**
 * Opens below the field, capped and scrollable, so a long list (the partners)
 * never spills as a full-page overlay (PAY-7).
 */
const MENU_PROPS = {
	anchorOrigin: { vertical: "bottom" as const, horizontal: "left" as const },
	transformOrigin: { vertical: "top" as const, horizontal: "left" as const },
	slotProps: { paper: { sx: { maxHeight: 320, mt: "4px" } } },
};

/** The payment form's reference pickers (partner, employee, wallet): one look for all three. */
const PaymentRefSelect: React.FC<PaymentRefSelectProps> = ({
	value,
	options,
	placeholder,
	error,
	onChange,
}) => (
	<Select
		size="small"
		fullWidth
		displayEmpty
		MenuProps={MENU_PROPS}
		value={value ? String(value) : ""}
		error={error}
		onChange={(e) => onChange(Number(e.target.value))}
		renderValue={(raw) =>
			options.find((o) => String(o.id) === raw)?.label ?? (
				<Box component="span" sx={{ color: "text.disabled" }}>
					{placeholder}
				</Box>
			)
		}
	>
		{options.map((o) => (
			<MenuItem key={o.id} value={String(o.id)}>
				<Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
					<span>{o.label}</span>
					<Box component="span" sx={{ color: "text.disabled", fontSize: 12 }}>
						{o.meta}
					</Box>
				</Box>
			</MenuItem>
		))}
	</Select>
);

export default PaymentRefSelect;
