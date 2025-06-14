import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Box, Button, Chip, Grid, MenuItem, TextField } from "@mui/material";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";

import { SupplyFormState } from "../useSupplyForm";

interface PaymentStepProps {
	form: SupplyFormState;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ form }) => (
	<Grid container rowSpacing={3} columnSpacing={2}>
		<Grid size={{ xs: 12, sm: 4 }}>
			<TextField
				label={translate("totalDue")}
				value={form.totalDue.toLocaleString()}
				disabled
				fullWidth
			/>
		</Grid>

		<Grid size={{ xs: 12, sm: 4 }}>
			<NumericField
				label={translate("fieldPaymentAmount")}
				value={form.paymentAmount}
				onChange={(e) => form.setPaymentAmount(+e.target.value)}
			/>
		</Grid>

		<Grid size={{ xs: 12, sm: 4 }}>
			<TextField
				label={translate("fieldDebt")}
				value={form.debt.toLocaleString()}
				disabled
				fullWidth
			/>
		</Grid>

		<Grid size={{ xs: 12, sm: 4 }}>
			<TextField
				select
				label={translate("fieldPaymentType")}
				value={form.paymentType}
				onChange={(e) => form.setPaymentType(e.target.value as "cash" | "card")}
				fullWidth
			>
				<MenuItem value="cash">{translate("payment.cash")}</MenuItem>
				<MenuItem value="card">{translate("payment.card")}</MenuItem>
			</TextField>
		</Grid>

		<Grid size={{ xs: 12, sm: 4 }}>
			<TextField
				select
				label={translate("fieldCurrency")}
				value={form.currency}
				onChange={(e) => form.setCurrency(e.target.value as "uzs" | "usd" | "rub")}
				fullWidth
			>
				<MenuItem value="uzs">UZS</MenuItem>
				<MenuItem value="usd">USD</MenuItem>
				<MenuItem value="rub">RUB</MenuItem>
			</TextField>
		</Grid>

		<Grid size={{ xs: 12, sm: 4 }}>
			<NumericField
				label={translate("fieldExchangeRate")}
				value={form.exchangeRate}
				onChange={(e) => form.setExchangeRate(+e.target.value)}
				disabled={form.currency === "uzs"}
			/>
		</Grid>

		{/* notes */}
		<Grid size={{ xs: 12 }}>
			<TextField
				label={translate("fieldNotes")}
				value={form.notes}
				onChange={(e) => form.setNotes(e.target.value)}
				fullWidth
				multiline
				minRows={3}
			/>
		</Grid>

		<Grid container size={{ xs: 12 }} columnSpacing={2} alignItems="flex-start">
			<Grid size={{ xs: 12, sm: 4 }}>
				<Button fullWidth variant="outlined" startIcon={<UploadFileIcon />} component="label">
					{translate("fieldAttachments")}
					<input type="file" hidden multiple onChange={form.handleAttachmentsChange} />
				</Button>
			</Grid>

			<Grid size={{ xs: 12, sm: 8 }}>
				{form.attachments.length > 0 && (
					<Box display="flex" flexWrap="wrap" gap={1} mt={{ xs: 2, sm: 0 }}>
						{form.attachments.map((f, idx) => (
							<Chip
								key={`${f.name}-${idx}`}
								label={f.name}
								onDelete={() => form.removeAttachment(idx)}
								deleteIcon={<CloseIcon />}
							/>
						))}
					</Box>
				)}
			</Grid>
		</Grid>
	</Grid>
);

export default PaymentStep;
