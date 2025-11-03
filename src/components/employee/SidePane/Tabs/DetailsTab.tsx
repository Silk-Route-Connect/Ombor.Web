import React from "react";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { formatDateTime } from "utils/dateUtils";

import {
	Delete as DeleteIcon,
	Edit as EditIcon,
	Email as EmailIcon,
	Home as HomeIcon,
	Phone as PhoneIcon,
	Telegram as TelegramIcon,
} from "@mui/icons-material";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";

interface DetailsTabProps {
	employee: Employee;
	onEdit: (employee: Employee) => void;
	onDelete: (employee: Employee) => void;
	onPayment: (employee: Employee) => void;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ employee, onEdit, onDelete, onPayment }) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "Active":
				return "success";
			case "OnLeave":
				return "warning";
			case "Terminated":
				return "error";
			default:
				return "default";
		}
	};

	const hasContactInfo =
		employee.contactInfo?.phoneNumbers?.length ||
		employee.contactInfo?.email ||
		employee.contactInfo?.address ||
		employee.contactInfo?.telegramAccount;

	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
			{/* Content */}
			<Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
				{/* Employment Information */}
				<Box mb={3}>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						{translate("employee.details.employmentInfo")}
					</Typography>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: 2,
							mt: 2,
						}}
					>
						{/* Position */}
						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("employee.position")}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{employee.position}
							</Typography>
						</Box>

						{/* Status */}
						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("employee.status")}
							</Typography>
							<Box mt={0.5}>
								<Chip
									label={translate(`employee.status.${employee.status}`)}
									color={getStatusColor(employee.status)}
									size="small"
								/>
							</Box>
						</Box>

						{/* Salary */}
						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("employee.salary")}
							</Typography>
							<Typography variant="body1" fontWeight={500}>
								{employee.salary.toLocaleString()}
							</Typography>
						</Box>

						{/* Employment Date */}
						<Box>
							<Typography variant="caption" color="text.secondary">
								{translate("employee.dateOfEmployment")}
							</Typography>
							<Typography variant="body1">{formatDateTime(employee.dateOfEmployment)}</Typography>
						</Box>
					</Box>
				</Box>

				{/* Contact Information */}
				{hasContactInfo && (
					<>
						<Divider sx={{ my: 3 }} />
						<Box mb={3}>
							<Typography variant="subtitle2" color="text.secondary" gutterBottom>
								{translate("employee.details.contactInfo")}
							</Typography>

							<Stack spacing={2} mt={2}>
								{/* Phone Numbers */}
								{employee.contactInfo?.phoneNumbers?.map((phone, index) => (
									<Box key={`${phone}-${index}`} display="flex" alignItems="center" gap={1}>
										<PhoneIcon fontSize="small" color="action" />
										<Typography variant="body2">{phone}</Typography>
									</Box>
								))}

								{/* Email */}
								{employee.contactInfo?.email && (
									<Box display="flex" alignItems="center" gap={1}>
										<EmailIcon fontSize="small" color="action" />
										<Typography variant="body2">{employee.contactInfo.email}</Typography>
									</Box>
								)}

								{/* Address */}
								{employee.contactInfo?.address && (
									<Box display="flex" alignItems="flex-start" gap={1}>
										<HomeIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
										<Typography variant="body2">{employee.contactInfo.address}</Typography>
									</Box>
								)}

								{/* Telegram */}
								{employee.contactInfo?.telegramAccount && (
									<Box display="flex" alignItems="center" gap={1}>
										<TelegramIcon fontSize="small" color="action" />
										<Typography variant="body2">{employee.contactInfo.telegramAccount}</Typography>
									</Box>
								)}
							</Stack>
						</Box>
					</>
				)}
			</Box>

			{/* Footer Actions */}
			<Box
				sx={{
					p: 2,
					borderTop: 1,
					borderColor: "divider",
					display: "flex",
					gap: 1,
					flexDirection: "column",
				}}
			>
				<Button variant="contained" color="primary" onClick={() => onPayment(employee)} fullWidth>
					{translate("employee.payroll")}
				</Button>

				<Box display="flex" gap={1}>
					<Button
						variant="outlined"
						startIcon={<EditIcon />}
						onClick={() => onEdit(employee)}
						fullWidth
					>
						{translate("common.edit")}
					</Button>
					<Button
						variant="outlined"
						color="error"
						startIcon={<DeleteIcon />}
						onClick={() => onDelete(employee)}
						fullWidth
					>
						{translate("common.delete")}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default DetailsTab;
