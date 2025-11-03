import React, { useEffect, useMemo, useState } from "react";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Divider, Drawer, IconButton, Tab, Tabs, Typography } from "@mui/material";

import DetailsTab from "./Tabs/DetailsTab";
import PayrollTab from "./Tabs/PayrollTab";

type TabKey = "details" | "payroll";

interface TabDescriptor {
	key: TabKey;
	label: () => string;
	render: (context: TabRenderContext) => React.ReactNode;
}

interface TabRenderContext {
	employee: Employee;
	onEdit: (employee: Employee) => void;
	onDelete: (employee: Employee) => void;
	onPayment: (employee: Employee) => void;
}

export interface EmployeeSidePaneProps {
	open: boolean;
	employee: Employee | null;
	onClose: () => void;
	onEdit: (employee: Employee) => void;
	onDelete: (employee: Employee) => void;
	onPayment: (employee: Employee) => void;
}

const EmployeeSidePane: React.FC<EmployeeSidePaneProps> = ({
	open,
	employee,
	onClose,
	onEdit,
	onDelete,
	onPayment,
}) => {
	const [selectedTab, setSelectedTab] = useState<TabKey>("details");

	useEffect(() => {
		if (open && employee) {
			setSelectedTab("details");
		}
	}, [open, employee]);

	const tabs: TabDescriptor[] = useMemo(
		() => [
			{
				key: "details",
				label: () => translate("tabDetails"),
				render: ({ employee, onEdit, onDelete, onPayment }) => (
					<DetailsTab
						employee={employee}
						onEdit={onEdit}
						onDelete={onDelete}
						onPayment={onPayment}
					/>
				),
			},
			{
				key: "payroll",
				label: () => translate("tabPayroll"),
				render: ({ employee }) => <PayrollTab employeeId={employee.id} />,
			},
		],
		[],
	);

	const selectedIndex = tabs.findIndex((t) => t.key === selectedTab);
	const handleTabChange = (_: React.SyntheticEvent, index: number) =>
		setSelectedTab(tabs[index].key);

	if (!employee) {
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
					width: 750,
					boxSizing: "border-box",
				},
			})}
		>
			<Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					{employee.fullName}
				</Typography>
				<IconButton onClick={onClose} aria-label={translate("common.close")}>
					<CloseIcon />
				</IconButton>
			</Box>

			<Divider />

			<Tabs value={selectedIndex} onChange={handleTabChange} aria-label="employee sidepane tabs">
				{tabs.map((tab) => (
					<Tab key={tab.key} label={tab.label()} />
				))}
			</Tabs>

			{tabs[selectedIndex]?.render({
				employee,
				onEdit,
				onDelete,
				onPayment,
			})}
		</Drawer>
	);
};

export default EmployeeSidePane;
