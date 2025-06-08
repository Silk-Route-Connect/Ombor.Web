// src/components/product/Drawer/SuppliesTab.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Supply } from "models/supply";
import { useStore } from "stores/StoreContext";

type RangeOption = "week" | "month" | "custom";

export const SuppliesTab: React.FC<{ productId: number }> = ({ productId }) => {
	const { supplyStore } = useStore();
	const [range, setRange] = useState<RangeOption>("week");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");

	// 1) compute date window
	useEffect(() => {
		const today = new Date();
		const to = today.toISOString().slice(0, 10);
		let from: string;
		if (range === "week") {
			const d = new Date(today);
			d.setDate(d.getDate() - 7);
			from = d.toISOString().slice(0, 10);
		} else if (range === "month") {
			const d = new Date(today);
			d.setMonth(d.getMonth() - 1);
			from = d.toISOString().slice(0, 10);
		} else {
			from = fromDate || to;
		}
		setFromDate(from);
		setToDate(to);
	}, [range]);

	// 2) reload on filter change
	useEffect(() => {
		supplyStore.loadSupplies();
	}, [productId, fromDate, toDate, supplyStore]);

	// 3) define table columns
	const columns = useMemo<Column<Supply>[]>(
		() => [
			{
				key: "id",
				field: "id",
				headerName: translate("fieldId"),
				width: 80,
				renderCell: (s) => (
					<RouterLink to={`/supplies/${s.id}`} style={{ color: "#1976d2" }}>
						{s.id}
					</RouterLink>
				),
			},
			{
				key: "supplier",
				field: "supplierName",
				headerName: translate("fieldSupplier"),
				width: 180,
			},
			{
				key: "date",
				field: "date",
				headerName: translate("fieldDate"),
				width: 120,
				renderCell: (s) => new Date(s.date).toLocaleDateString("ru-RU"),
			},
			{
				key: "quantity",
				headerName: translate("fieldQuantity"),
				width: 100,
				align: "right",
				renderCell: (s) =>
					s.items.filter((i) => i.productId === productId).reduce((sum, i) => sum + i.quantity, 0),
			},
			{
				key: "total",
				headerName: translate("fieldTotalCost"),
				width: 120,
				align: "right",
				renderCell: (s) => {
					const total = s.items
						.filter((i) => i.productId === productId)
						.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
					return total.toLocaleString("ru-RU");
				},
			},
		],
		[productId],
	);

	// 4) compute aggregate spend
	const totalSpend = useMemo(() => {
		if (supplyStore.filteredSupplies === "loading") {
			return 0;
		}

		return supplyStore.filteredSupplies
			.flatMap((s) => s.items.filter((i) => i.productId === productId))
			.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
	}, [supplyStore.filteredSupplies, productId]);

	return (
		<Box sx={{ p: 2 }}>
			{/* date range */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
				<ToggleButtonGroup
					value={range}
					exclusive
					onChange={(_, v) => v && setRange(v)}
					size="small"
				>
					<ToggleButton value="week">{translate("reportRangeWeek")}</ToggleButton>
					<ToggleButton value="month">{translate("reportRangeMonth")}</ToggleButton>
					<ToggleButton value="custom">{translate("reportRangeCustom")}</ToggleButton>
				</ToggleButtonGroup>
				{range === "custom" && (
					<>
						<TextField
							label={translate("reportFrom")}
							type="date"
							size="small"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
							slotProps={{ inputLabel: { shrink: true } }}
						/>
						<TextField
							label={translate("reportTo")}
							type="date"
							size="small"
							value={toDate}
							onChange={(e) => setToDate(e.target.value)}
							slotProps={{ inputLabel: { shrink: true } }}
						/>
					</>
				)}
			</Box>

			{/* supplies table */}
			<DataTable<Supply> rows={supplyStore.filteredSupplies} columns={columns} pagination />

			{/* total spend */}
			<Box sx={{ mt: 2, textAlign: "right" }}>
				<Typography variant="subtitle1">
					{translate("suppliesTotalCost")}: <strong>{totalSpend.toLocaleString("ru-RU")}</strong>
				</Typography>
			</Box>
		</Box>
	);
};
