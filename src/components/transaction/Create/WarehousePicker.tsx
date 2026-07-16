import React from "react";
import { Warehouse } from "models/warehouse";

import CheckIcon from "@mui/icons-material/Check";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, ListItemText, MenuItem, Select } from "@mui/material";

interface WarehousePickerProps {
	value: number | null;
	warehouses: Warehouse[];
	onChange: (id: number) => void;
}

/** Warehouse selector for the New Sale header — stock is read per this warehouse. */
export const WarehousePicker: React.FC<WarehousePickerProps> = ({
	value,
	warehouses,
	onChange,
}) => (
	<Select
		value={value != null && warehouses.some((w) => w.id === value) ? String(value) : ""}
		onChange={(e) => onChange(Number(e.target.value))}
		displayEmpty
		fullWidth
		sx={{
			// Match the partner Autocomplete's height (38px) — the Select's default
			// padding otherwise makes it taller than the field beside it.
			"&.MuiOutlinedInput-root": { height: 38 },
			"& .MuiSelect-select": { display: "flex", alignItems: "center" },
		}}
		renderValue={(v) => {
			const wh = warehouses.find((w) => String(w.id) === v);
			return (
				<Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
					<WarehouseOutlinedIcon sx={{ fontSize: 17, color: "text.disabled" }} />
					<Box component="span" sx={{ color: wh ? "text.primary" : "text.disabled" }}>
						{wh?.name ?? ""}
					</Box>
				</Box>
			);
		}}
	>
		{warehouses.map((w) => (
			<MenuItem key={w.id} value={String(w.id)} sx={{ gap: "10px" }}>
				<WarehouseOutlinedIcon
					sx={{ fontSize: 17, color: w.id === value ? "primary.main" : "text.disabled" }}
				/>
				<ListItemText primary={w.name} />
				{w.id === value && <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />}
			</MenuItem>
		))}
	</Select>
);

export default WarehousePicker;
