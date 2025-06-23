import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Box, CircularProgress, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { TransactionPayment } from "models/payment"; // <- your new type
import { TransactionRecord } from "models/transaction";

import LineItemsTable from "./Table/LineItemsTable";
import PaymentsTable from "./Table/PaymentsTable";
import TransactionSummary from "./TransactionSummary";

export interface TransactionSidePaneProps {
	isOpen: boolean;
	transaction: Loadable<TransactionRecord> | null;
	payments: Loadable<TransactionPayment[]>;
	onClose: () => void;
}

const TransactionSidePane: React.FC<TransactionSidePaneProps> = ({
	isOpen,
	transaction,
	payments,
	onClose,
}) => {
	if (!transaction) return null;

	if (transaction === "loading") {
		return (
			<Drawer
				anchor="right"
				open={isOpen}
				onClose={onClose}
				ModalProps={{ keepMounted: true }}
				sx={(theme) => ({
					zIndex: theme.zIndex.drawer + 3,
					"& .MuiDrawer-paper": { width: 900, boxSizing: "border-box" },
				})}
			>
				<Box
					sx={{
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<CircularProgress />
				</Box>
			</Drawer>
		);
	}

	const renderPayments = () => {
		if (payments === "loading") {
			return (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						py: 4,
					}}
				>
					<CircularProgress size={28} />
				</Box>
			);
		}

		if (payments.length === 0) {
			return (
				<Typography color="text.secondary" fontStyle="italic">
					{translate("transaction.section.payments.empty")}
				</Typography>
			);
		}

		return <PaymentsTable payments={payments} />;
	};

	return (
		<Drawer
			anchor="right"
			open={isOpen}
			onClose={onClose}
			ModalProps={{ keepMounted: true }}
			sx={(theme) => ({
				zIndex: theme.zIndex.drawer + 3,
				"& .MuiDrawer-paper": { width: 900, boxSizing: "border-box" },
			})}
		>
			<Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					{translate(`transaction.type.${transaction.type}`)} #{transaction.id}
				</Typography>
				<IconButton onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</Box>
			<Divider />

			<TransactionSummary transaction={transaction} />
			<Divider />

			<Box sx={{ p: 2 }}>
				<Typography variant="subtitle1" sx={{ mb: 1 }}>
					{translate("transaction.section.payments")}
				</Typography>
				{renderPayments()}
			</Box>
			<Divider />

			<Box sx={{ p: 2 }}>
				<Typography variant="subtitle1" sx={{ mb: 1 }}>
					{translate("transaction.section.lineItems")}
				</Typography>
				<LineItemsTable items={transaction.lines} />
			</Box>
		</Drawer>
	);
};

export default TransactionSidePane;
