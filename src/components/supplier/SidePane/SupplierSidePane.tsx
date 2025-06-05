import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, Drawer, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Supplier } from "models/supplier";

import SupplierDetailsTab from "./Tabs/DetailsTab";
import SupplierReportsTab from "./Tabs/ReportsTab";
import SupplierStatisticsTab from "./Tabs/StatisticsTab";
import SupplierSuppliesTab from "./Tabs/SuppliesTab";

export interface SupplierSidePaneProps {
	open: boolean;
	supplier: Supplier | null;
	onClose: () => void;
}

const SupplierSidePane: React.FC<SupplierSidePaneProps> = ({ open, supplier, onClose }) => {
	const [tabIndex, setTabIndex] = useState(0);
	const [fromDate, setFromDate] = useState<Date>(new Date());
	const [toDate, setToDate] = useState<Date>(new Date());

	useEffect(() => {
		if (open && supplier) {
			// Default to last week
			const today = new Date();
			const to = today.toISOString().slice(0, 10);
			const d = new Date(today);
			d.setDate(d.getDate() - 7);
			const from = d.toISOString().slice(0, 10);
			setFromDate(new Date(from));
			setToDate(new Date(to));
		}
	}, [open, supplier]);

	if (!supplier) return null;

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			ModalProps={{ keepMounted: true }}
			sx={(theme) => ({
				zIndex: theme.zIndex.drawer + 2,
				"& .MuiDrawer-paper": {
					width: 900,
					boxSizing: "border-box",
				},
			})}
		>
			<Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					{supplier.name}
				</Typography>
				<IconButton onClick={onClose} aria-label={translate("close")}>
					<CloseIcon />
				</IconButton>
			</Box>

			<Divider />

			<Tabs
				value={tabIndex}
				onChange={(_, newVal) => setTabIndex(newVal)}
				aria-label="Supplier side pane tabs"
			>
				<Tab label={translate("tabDetails")} />
				<Tab label={translate("tabSupplies")} />
				<Tab label={translate("tabConsolidatedReport")} />
				<Tab label={translate("tabStatistics")} />
			</Tabs>

			{tabIndex === 0 && <SupplierDetailsTab supplier={supplier} />}

			{tabIndex === 1 && <SupplierSuppliesTab supplierId={supplier.id} />}

			{tabIndex === 2 && (
				<SupplierReportsTab
					supplierId={supplier.id}
					from={fromDate}
					to={toDate}
					onDateChange={({ from, to }) => {
						setFromDate(from);
						setToDate(to);
					}}
				/>
			)}

			{tabIndex === 3 && <SupplierStatisticsTab supplierId={supplier.id} />}
		</Drawer>
	);
};

export default SupplierSidePane;
