import React, { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, Drawer, IconButton, Tab, Tabs, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";

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
	render: (ctx: TabRenderContext) => React.ReactNode;
}

interface TabRenderContext {
	partner: Partner;
	fromDate: Date;
	toDate: Date;
	setDates: (from: Date, to: Date) => void;
}

function today(): Date {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

function lastNDays(n: number): Date {
	const d = today();
	d.setDate(d.getDate() - n);
	return d;
}

export interface PartnerSidePaneProps {
	open: boolean;
	partner: Partner | null;
	onClose: () => void;
}

const PartnerSidePane: React.FC<PartnerSidePaneProps> = ({ open, partner, onClose }) => {
	const [fromDate, setFromDate] = useState(() => lastNDays(7));
	const [toDate, setToDate] = useState(() => today());

	useEffect(() => {
		if (open && partner) {
			setFromDate(lastNDays(7));
			setToDate(today());
		}
	}, [open, partner]);

	const tabDescriptors: TabDescriptor[] = useMemo(
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
				render: ({ partner }) => <StatisticsTab partnerId={partner.id} />,
			},
		],
		[],
	);

	const visibleTabs = useMemo(
		() => (partner ? tabDescriptors.filter((t) => !t.hideFor?.includes(partner.type)) : []),
		[partner, tabDescriptors],
	);

	const [selectedKey, setSelectedKey] = useState<TabKey>("details");

	useEffect(() => {
		if (!visibleTabs.some((t) => t.key === selectedKey)) {
			setSelectedKey(visibleTabs[0]?.key ?? "details");
		}
	}, [selectedKey, visibleTabs]);

	const selectedIndex = visibleTabs.findIndex((t) => t.key === selectedKey);
	const handleTabChange = (_: React.SyntheticEvent, index: number) =>
		setSelectedKey(visibleTabs[index].key);

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
				"& .MuiDrawer-paper": { width: 950, boxSizing: "border-box" },
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

			<Tabs value={selectedIndex} onChange={handleTabChange} aria-label="partner side pane tabs">
				{visibleTabs.map((t) => (
					<Tab key={t.key} label={t.label()} />
				))}
			</Tabs>

			{visibleTabs[selectedIndex]?.render({
				partner,
				fromDate,
				toDate,
				setDates: (f, t) => {
					setFromDate(f);
					setToDate(t);
				},
			})}
		</Drawer>
	);
};

export default PartnerSidePane;
