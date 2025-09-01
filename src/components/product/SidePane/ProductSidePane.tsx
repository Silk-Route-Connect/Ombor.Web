import React, { useState } from "react";
import { translate } from "i18n/i18n";
import { Product } from "models/product";

import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import { DetailsTab } from "./Tabs/DetailsTab";
import ReportsTab from "./Tabs/ReportsTab";
import TransactionsTab from "./Tabs/TransactionsTab";

interface ProductDetailsDrawerProps {
	open: boolean;
	product: Product | null;

	onClose: () => void;
}

export default function ProductDetailsDrawer({
	open,
	product,
	onClose,
}: Readonly<ProductDetailsDrawerProps>) {
	const [tab, setTab] = useState(0);
	const handleTabChange = (_: React.SyntheticEvent, newVal: number) => setTab(newVal);

	const TabPanel = ({ children, index }: { children: React.ReactNode; index: number }) =>
		tab === index ? <Box>{children}</Box> : null;

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
					{product?.name}
				</Typography>
				<IconButton onClick={onClose} aria-label={translate("close")}>
					<CloseIcon />
				</IconButton>
			</Box>
			<Divider />

			<Tabs
				value={tab}
				onChange={handleTabChange}
				aria-label={translate("productDetailsTabsAria")}
				sx={{ borderBottom: 1, borderColor: "divider" }}
			>
				<Tab label={translate("tabDetails")} />
				<Tab label={translate("tabReports")} />
				<Tab label={translate("tabSales")} />
				<Tab label={translate("tabSupplies")} />
			</Tabs>

			<TabPanel index={0}>{product && <DetailsTab product={product} />}</TabPanel>
			<TabPanel index={1}>
				<ReportsTab />
			</TabPanel>
			<TabPanel index={2}>
				<TransactionsTab mode="Sale" />
			</TabPanel>
			<TabPanel index={3}>
				<TransactionsTab mode="Supply" />
			</TabPanel>
		</Drawer>
	);
}
