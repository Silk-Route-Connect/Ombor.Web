import { Box, Drawer, IconButton, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

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

export interface EmployeeSidePaneProps {
	open: boolean;
	employee: Employee | null;
	onClose: () => void;
}

const EmployeeSidePane: React.FC<EmployeeSidePaneProps> = ({ open, employee, onClose }) => {
	useEffect(() => {
		if (open && employee) {
			setToDate(lastNDays(7));
			setToDate(today());
		}
	}, [open, employee]);

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
				"& .MuiDrawer-paper": { width: 950, boxSizing: "border-box" },
			})}
		>
			<Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					{employee.fullName}
				</Typography>
				<IconButton onClick={onClose} aria-label={translate("close")}>
					<CloseIcon />
				</IconButton>
			</Box>
		</Drawer>
	);
};

export default EmployeeSidePane;
function setToDate(arg0: Date) {
	throw new Error("Function not implemented.");
}
