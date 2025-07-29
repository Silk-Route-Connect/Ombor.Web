import React from "react";
import { Box, Chip, Grid, Link, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Payment } from "models/payment";
import { formatDateTime } from "utils/dateUtils";

interface PaymentSummaryProps {
	payment: Payment;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ payment }) => (
	<Box sx={{ p: 2, pb: 1 }}>
		<Grid container columnSpacing={2} rowSpacing={2}>
			<Grid size={{ xs: 12, sm: 3 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("payment.partner")}
				</Typography>
				<Link href={`/partners/${payment.partnerId}`} underline="hover">
					{payment.partnerName}
				</Link>
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("payment.date")}
				</Typography>
				{formatDateTime(payment.date)}
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("payment.reason")}
				</Typography>
				{translate(`payment.reason.${payment.type}`)}
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("payment.direction")}
				</Typography>
				<Chip
					label={translate(`payment.direction.${payment.direction}`)}
					size="small"
					color={payment.direction === "Income" ? "success" : "warning"}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Typography variant="subtitle2" color="text.secondary">
					{translate("payment.notes")}
				</Typography>
				{payment.notes ?? <>&mdash;</>}
			</Grid>

			{payment.notes && (
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2" color="text.secondary">
						{translate("fieldNotes")}
					</Typography>
					<Typography>{payment.notes}</Typography>
				</Grid>
			)}
		</Grid>
	</Box>
);

export default PaymentSummary;
