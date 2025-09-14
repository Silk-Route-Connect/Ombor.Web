import React from "react";
import { translate } from "i18n/i18n";

import PaymentIcon from "@mui/icons-material/Payment";
import { Button } from "@mui/material";

interface AddPaymentButtonProps {
	onAddPayment: () => void;
	disabled?: boolean;
}

const AddPaymentButton: React.FC<AddPaymentButtonProps> = ({ onAddPayment, disabled = false }) => (
	<Button
		variant="outlined"
		startIcon={<PaymentIcon />}
		onClick={onAddPayment}
		disabled={disabled}
		sx={{ mt: 1 }}
	>
		{translate("payment.addPayment")}
	</Button>
);

export default AddPaymentButton;
