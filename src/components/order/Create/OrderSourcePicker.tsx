import React from "react";
import { useTranslation } from "react-i18next";
import { ORDER_SOURCES, OrderSource } from "models/order";

import CheckIcon from "@mui/icons-material/Check";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { Box, ListItemText, MenuItem, Select } from "@mui/material";

interface OrderSourcePickerProps {
	value: OrderSource;
	onChange: (source: OrderSource) => void;
}

/** Where the order came from (Нет / Telegram / OmborWeb) — matches the New Order header. */
export const OrderSourcePicker: React.FC<OrderSourcePickerProps> = ({ value, onChange }) => {
	const { t } = useTranslation();

	return (
		<Select
			value={value}
			onChange={(e) => onChange(e.target.value as OrderSource)}
			fullWidth
			sx={{
				// Match the partner Autocomplete / warehouse Select height beside it.
				"&.MuiOutlinedInput-root": { height: 45 },
				"& .MuiSelect-select": { display: "flex", alignItems: "center" },
			}}
			renderValue={(v) => (
				<Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
					<PublicOutlinedIcon sx={{ fontSize: 17, color: "text.disabled" }} />
					<Box component="span">{t(`order.source.${v as OrderSource}`)}</Box>
				</Box>
			)}
		>
			{ORDER_SOURCES.map((s) => (
				<MenuItem key={s} value={s} sx={{ gap: "10px" }}>
					<ListItemText primary={t(`order.source.${s}`)} />
					{s === value && <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />}
				</MenuItem>
			))}
		</Select>
	);
};

export default OrderSourcePicker;
