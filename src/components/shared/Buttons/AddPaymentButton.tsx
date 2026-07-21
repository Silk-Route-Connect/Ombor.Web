import React from "react";
import { useTranslation } from "react-i18next";

import PaymentIcon from "@mui/icons-material/Payment";
import { Button } from "@mui/material";

interface AddPaymentButtonProps {
	onAddPayment: () => void;
	disabled?: boolean;
}

const AddPaymentButton: React.FC<AddPaymentButtonProps> = ({ onAddPayment, disabled = false }) => {
	const { t } = useTranslation();

	return (
		<Button
			variant="outlined"
			startIcon={<PaymentIcon />}
			onClick={onAddPayment}
			disabled={disabled}
			sx={{ mt: 1 }}
		>
			{t("payment.addPayment")}
		</Button>
	);
};

export default AddPaymentButton;
