import React, { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, Drawer, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";
import { lastNDays, today } from "utils/dateUtils";

import DetailsTab from "./Tabs/DetailsTab";
import PaymentsTab from "./Tabs/PaymentsTab";
import SalesTab from "./Tabs/SalesTab";
import StatisticsTab from "./Tabs/StatisticsTab";
import SuppliesTab from "./Tabs/SuppliesTab";

type TabKey = "details" | "sales" | "supplies" | "reports" | "statistics";

interface TabDescriptor {
	key: TabKey;
	hideFor?: Array<Partner["type"]>;
	label: () => string;
	render: (context: TabRenderContext) => React.ReactNode;
}

interface TabRenderContext {
	partner: Partner;
	fromDate: Date;
	toDate: Date;
	setDates: (from: Date, to: Date) => void;
}

export interface PartnerSidePaneProps {
	open: boolean;
	partner: Partner | null;
	onClose: () => void;
}

const PartnerSidePane: React.FC<PartnerSidePaneProps> = ({ open, partner, onClose }) => {
	const [fromDate, setFromDate] = useState(() => lastNDays(7));
	const [toDate, setToDate] = useState(() => today());
	const [selectedTab, setSelectedTab] = useState<TabKey>("details");

	useEffect(() => {
		if (open && partner) {
			setFromDate(lastNDays(7));
			setToDate(today());
		}
	}, [open, partner]);

	const tabs: TabDescriptor[] = useMemo(
		() => [
			{
				key: "details",
				label: () => translate("tabDetails"),
				render: ({ partner }) => <DetailsTab partner={partner} />,
			},
			{
				key: "sales",
				hideFor: ["Supplier"],
				label: () => translate("tabSales"),
				render: ({ partner }) => <SalesTab partnerId={partner.id} />,
			},
			{
				key: "supplies",
				hideFor: ["Customer"],
				label: () => translate("tabSupplies"),
				render: ({ partner }) => <SuppliesTab partnerId={partner.id} />,
			},
			{
				key: "reports",
				label: () => translate("tabConsolidatedReport"),
				render: ({ partner }) => <PaymentsTab partnerId={partner.id} />,
			},
			{
				key: "statistics",
				label: () => translate("tabStatistics"),
				render: () => <StatisticsTab />,
			},
		],
		[],
	);

	const visibleTabs = useMemo(
		() => (partner ? tabs.filter((t) => !t.hideFor?.includes(partner.type)) : []),
		[partner, tabs],
	);

	useEffect(() => {
		if (!visibleTabs.some((t) => t.key === selectedTab)) {
			setSelectedTab(visibleTabs[0]?.key ?? "details");
		}
	}, [selectedTab, visibleTabs]);

	const selectedIndex = visibleTabs.findIndex((t) => t.key === selectedTab);
	const handleTabChange = (_: React.SyntheticEvent, index: number) =>
		setSelectedTab(visibleTabs[index].key);

	if (!partner) {
		return null;
	}

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			ModalProps={{ keepMounted: true }}
			sx={(theme) => ({
				zIndex: theme.zIndex.drawer + 2,
				"& .MuiDrawer-paper": {
					width: 950,
					boxSizing: "border-box",
				},
			})}
		>
			<Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					{partner.name}
				</Typography>
				<IconButton onClick={onClose} aria-label={translate("common.close")}>
					<CloseIcon />
				</IconButton>
			</Box>

			<Divider />

			<Tabs value={selectedIndex} onChange={handleTabChange} aria-label={"common.sidepane"}>
				{visibleTabs.map((tab) => (
					<Tab key={tab.key} label={tab.label()} />
				))}
			</Tabs>

			{visibleTabs[selectedIndex]?.render({
				partner,
				fromDate,
				toDate,
				setDates: (from, to) => {
					setFromDate(from);
					setToDate(to);
				},
			})}
		</Drawer>
	);
};

export default PartnerSidePane;
