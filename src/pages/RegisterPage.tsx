import React from "react";
import { Link as RouterLink } from "react-router-dom";
import RegistrationForm from "components/auth/Form/RegistrationForm";
import OtpVerification from "components/auth/OtpVerification/OtpVerification";
import { translate } from "i18n/i18n";
import AuthLayout from "layouts/AuthLayout";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box, Link, Typography } from "@mui/material";

type Step = "form" | "otp";

const RegisterPage: React.FC = observer(() => {
	const { authStore, notificationStore } = useStore();
	const [step, setStep] = React.useState<Step>("form");
	const [phoneNumber, setPhoneNumber] = React.useState<string>("");
	const [registrationData, setRegistrationData] = React.useState<any>(null);

	const handleRegistrationSuccess = (phone: string, data: any) => {
		setPhoneNumber(phone);
		setRegistrationData(data);
		setStep("otp");
	};

	const handleVerificationSuccess = () => {
		// Navigation handled by authStore
	};

	const handleBackToForm = () => {
		setStep("form");
	};

	if (step === "otp") {
		return (
			<AuthLayout
				titleKey="auth.verify"
				subtitleKey="auth.verifySubtitle"
				switchTextKey="auth.goToLogin"
				switchTo="/login"
				rightMaxWidth={480}
				hideHeaderSwitch
			>
				<OtpVerification
					phoneNumber={phoneNumber}
					registrationData={registrationData}
					onSuccess={handleVerificationSuccess}
					onBack={handleBackToForm}
				/>
				<Box sx={{ mt: 2, textAlign: "center" }}>
					<Typography variant="body2" color="text.secondary">
						<Link component={RouterLink} to="/login" underline="hover">
							{translate("auth.goToLogin")}
						</Link>
					</Typography>
				</Box>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			titleKey="auth.register"
			subtitleKey="auth.registerSubtitle"
			switchTextKey="auth.goToLogin"
			switchTo="/login"
			rightMaxWidth={720}
			hideHeaderSwitch
		>
			<RegistrationForm onSuccess={handleRegistrationSuccess} />
			<Box sx={{ mt: 2, textAlign: "center" }}>
				<Typography variant="body2" color="text.secondary">
					<Link component={RouterLink} to="/login" underline="hover">
						{translate("auth.goToLogin")}
					</Link>
				</Typography>
			</Box>
		</AuthLayout>
	);
});

export default RegisterPage;
