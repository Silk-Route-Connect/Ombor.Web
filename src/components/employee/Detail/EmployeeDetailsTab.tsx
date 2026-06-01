import React from "react";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { formatDateTime } from "utils/dateUtils";

import HomeIcon from "@mui/icons-material/HomeOutlined";
import EmailIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box>
		<Typography variant="caption" sx={{ color: "text.secondary" }}>
			{label}
		</Typography>
		<Typography variant="body1" sx={{ fontWeight: 500 }}>
			{children}
		</Typography>
	</Box>
);

const EmployeeDetailsTab: React.FC<{ employee: Employee }> = ({ employee }) => {
	const contact = employee.contactInfo;
	const hasContact =
		!!contact &&
		(contact.phoneNumbers?.length || contact.email || contact.address || contact.telegramAccount);

	return (
		<Paper elevation={1} sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, p: 3 }}>
			<Typography variant="subtitle2" sx={{ color: "text.secondary" }} gutterBottom>
				{translate("employee.details.employmentInfo")}
			</Typography>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
					gap: 2,
					mt: 2,
				}}
			>
				<Field label={translate("employee.position")}>{employee.position}</Field>
				<Field label={translate("employee.dateOfEmployment")}>
					{formatDateTime(employee.dateOfEmployment)}
				</Field>
			</Box>

			{hasContact && (
				<>
					<Divider sx={{ my: 3 }} />
					<Typography variant="subtitle2" sx={{ color: "text.secondary" }} gutterBottom>
						{translate("employee.details.contactInfo")}
					</Typography>
					<Stack spacing={1.5} mt={2}>
						{contact?.phoneNumbers?.map((phone, index) => (
							<Box key={`${phone}-${index}`} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<PhoneIcon fontSize="small" color="action" />
								<Typography variant="body2">{phone}</Typography>
							</Box>
						))}
						{contact?.email && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<EmailIcon fontSize="small" color="action" />
								<Typography variant="body2">{contact.email}</Typography>
							</Box>
						)}
						{contact?.address && (
							<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
								<HomeIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
								<Typography variant="body2">{contact.address}</Typography>
							</Box>
						)}
						{contact?.telegramAccount && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<TelegramIcon fontSize="small" color="action" />
								<Typography variant="body2">{contact.telegramAccount}</Typography>
							</Box>
						)}
					</Stack>
				</>
			)}
		</Paper>
	);
};

export default EmployeeDetailsTab;
