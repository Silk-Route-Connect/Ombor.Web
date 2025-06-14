import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, Drawer, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";

import DetailsTab from "./Tabs/DetailsTab";
import ReportsTab from "./Tabs/ReportsTab";
import StatisticsTab from "./Tabs/StatisticsTab";
import SuppliesTab from "./Tabs/SuppliesTab";

export interface PartnerSidePaneProps {
	open: boolean;
	partner: Partner | null;
	onClose: () => void;
}

const PartnerSidePane: React.FC<PartnerSidePaneProps> = ({ open, partner, onClose }) => {
	const [tabIndex, setTabIndex] = useState(0);
	const [fromDate, setFromDate] = useState<Date>(new Date());
	const [toDate, setToDate] = useState<Date>(new Date());

	useEffect(() => {
		if (open && partner) {
			// Default to last week
			const today = new Date();
			const to = today.toISOString().slice(0, 10);
			const d = new Date(today);
			d.setDate(d.getDate() - 7);
			const from = d.toISOString().slice(0, 10);
			setFromDate(new Date(from));
			setToDate(new Date(to));
		}
	}, [open, partner]);

	if (!partner) return null;

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
					{partner.name}
				</Typography>
				<IconButton onClick={onClose} aria-label={translate("close")}>
					<CloseIcon />
				</IconButton>
			</Box>

			<Divider />

			<Tabs
				value={tabIndex}
				onChange={(_, newVal) => setTabIndex(newVal)}
				aria-label="partner side pane tabs"
			>
				<Tab label={translate("tabDetails")} />
				<Tab label={translate("tabSupplies")} />
				<Tab label={translate("tabConsolidatedReport")} />
				<Tab label={translate("tabStatistics")} />
			</Tabs>

			{tabIndex === 0 && <DetailsTab partner={partner} />}

			{tabIndex === 1 && <SuppliesTab partnerId={partner.id} />}

			{tabIndex === 2 && (
				<ReportsTab
					partnerId={partner.id}
					from={fromDate}
					to={toDate}
					onDateChange={({ from, to }) => {
						setFromDate(from);
						setToDate(to);
					}}
				/>
			)}

			{tabIndex === 3 && <StatisticsTab partnerId={partner.id} />}
		</Drawer>
	);
};

export default PartnerSidePane;
