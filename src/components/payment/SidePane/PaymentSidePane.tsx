import React from "react";
import { useTranslation } from "react-i18next";
import { Loadable } from "helpers/Loading";
import { Payment } from "models/payment";

import CloseIcon from "@mui/icons-material/Close";
import { Box, CircularProgress, Divider, Drawer, IconButton, Typography } from "@mui/material";

import AllocationsTable from "../Table/AllocationsTable";
import PaymentComponentsTable from "../Table/PaymentComponentsTable";
import PaymentSummary from "./PaymentSummary";

interface PaymentSidePaneProps {
	isOpen: boolean;
	payment: Loadable<Payment> | null;
	onClose: () => void;
}

const PaymentSidePane: React.FC<PaymentSidePaneProps> = ({ isOpen, payment, onClose }) => {
	const { t } = useTranslation();
	const loading = payment === "loading";

	const renderContent = () => {
		if (loading) {
			return (
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
			);
		}

		if (payment) {
			return (
				<>
					<Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
						<Typography variant="h6" sx={{ flexGrow: 1 }}>
							{`${t("payment")} #${payment.id}`}
						</Typography>
						<IconButton onClick={onClose}>
							<CloseIcon />
						</IconButton>
					</Box>

					<Divider />

					<PaymentSummary payment={payment} />

					<Divider />

					<Box sx={{ p: 2 }}>
						<Typography variant="subtitle1" sx={{ mb: 1 }}>
							{t("payment.components")}
						</Typography>
						<PaymentComponentsTable components={payment.components} />
					</Box>

					<Divider />

					<Box sx={{ p: 2 }}>
						<Typography variant="subtitle1" sx={{ mb: 1 }}>
							{t("payment.allocations")}
						</Typography>
						<AllocationsTable allocations={payment.allocations} />
					</Box>
				</>
			);
		}

		return <></>;
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
			{renderContent()}
		</Drawer>
	);
};

export default PaymentSidePane;
