import React, { useEffect, useMemo, useState } from "react";
import DetailsTab from "components/warehouse/SidePane/Tabs/DetailsTab";
import MovementsTab from "components/warehouse/SidePane/Tabs/MovementsTab";
import StockTab from "components/warehouse/SidePane/Tabs/StockTab";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Warehouse } from "models/warehouse";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, Drawer, IconButton, Tab, Tabs, Typography } from "@mui/material";

type TabKey = "info" | "stock" | "movements";

interface TabDescriptor {
	key: TabKey;
	label: () => string;
	render: (context: TabRenderContext) => React.ReactNode;
}

interface TabRenderContext {
	warehouse: Warehouse;
	onEdit: (warehouse: Warehouse) => void;
	onDelete: (warehouse: Warehouse) => void;
	onAdjustStock: (warehouse: Warehouse) => void;
	onTransfer: (warehouse: Warehouse) => void;
}

export interface WarehouseSidePaneProps {
	open: boolean;
	warehouse: Warehouse | null;
	onClose: () => void;
	onEdit: (warehouse: Warehouse) => void;
	onDelete: (warehouse: Warehouse) => void;
	onAdjustStock: (warehouse: Warehouse) => void;
	onTransfer: (warehouse: Warehouse) => void;
}

const WarehouseSidePane: React.FC<WarehouseSidePaneProps> = observer(
	({ open, warehouse, onClose, onEdit, onDelete, onAdjustStock, onTransfer }) => {
		const [selectedTab, setSelectedTab] = useState<TabKey>("info");

		useEffect(() => {
			if (open && warehouse) {
				setSelectedTab("info");
			}
		}, [open, warehouse]);

		const tabs: TabDescriptor[] = useMemo(
			() => [
				{
					key: "info",
					label: () => translate("warehouse.sidePane.tab.info"),
					render: ({ warehouse, onEdit, onDelete }) => (
						<DetailsTab warehouse={warehouse} onEdit={onEdit} onDelete={onDelete} />
					),
				},
				{
					key: "stock",
					label: () => translate("warehouse.sidePane.tab.stock"),
					render: ({ warehouse, onAdjustStock, onTransfer }) => (
						<StockTab warehouse={warehouse} onAdjustStock={onAdjustStock} onTransfer={onTransfer} />
					),
				},
				{
					key: "movements",
					label: () => translate("warehouse.sidePane.tab.movements"),
					render: ({ warehouse }) => <MovementsTab warehouseId={warehouse.id} />,
				},
			],
			[],
		);

		const selectedIndex = tabs.findIndex((t) => t.key === selectedTab);
		const handleTabChange = (_: React.SyntheticEvent, index: number) =>
			setSelectedTab(tabs[index].key);

		if (!warehouse) {
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
						{warehouse.name}
					</Typography>
					<IconButton onClick={onClose} aria-label={translate("common.close")}>
						<CloseIcon />
					</IconButton>
				</Box>

				<Divider />

				<Tabs
					value={selectedIndex}
					onChange={handleTabChange}
					aria-label={translate("common.sidepane")}
				>
					{tabs.map((tab) => (
						<Tab key={tab.key} label={tab.label()} />
					))}
				</Tabs>

				{tabs[selectedIndex]?.render({
					warehouse,
					onEdit,
					onDelete,
					onAdjustStock,
					onTransfer,
				})}
			</Drawer>
		);
	},
);

export default WarehouseSidePane;
