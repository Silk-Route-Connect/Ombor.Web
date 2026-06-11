import React from "react";
import { useTranslation } from "react-i18next";
import { Payment } from "models/payment";
import { formatDateTime } from "utils/dateUtils";

import { Box, Chip, Grid, Link, Typography } from "@mui/material";

interface PaymentSummaryProps {
	payment: Payment;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ payment }) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ p: 2, pb: 1 }}>
			<Grid container columnSpacing={2} rowSpacing={2}>
				<Grid size={{ xs: 12, sm: 3 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("payment.partner")}
					</Typography>
					<Link href={`/partners/${payment.partnerId}`} underline="hover">
						{payment.partnerName}
					</Link>
				</Grid>

				<Grid size={{ xs: 12, sm: 3 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("payment.date")}
					</Typography>
					{formatDateTime(payment.date)}
				</Grid>

				<Grid size={{ xs: 12, sm: 3 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("payment.reason")}
					</Typography>
					{t(`payment.reason.${payment.type}`)}
				</Grid>

				<Grid size={{ xs: 12, sm: 3 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("payment.direction")}
					</Typography>
					<Chip
						label={t(`payment.direction.${payment.direction}`)}
						size="small"
						color={payment.direction === "Income" ? "success" : "warning"}
					/>
				</Grid>

				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{t("payment.notes")}
					</Typography>
					{payment.notes ?? <>&mdash;</>}
				</Grid>

				{payment.notes && (
					<Grid size={{ xs: 12 }}>
						<Typography variant="subtitle2" color="text.secondary">
							{t("fieldNotes")}
						</Typography>
						<Typography>{payment.notes}</Typography>
					</Grid>
				)}
			</Grid>
		</Box>
	);
};

export default PaymentSummary;
