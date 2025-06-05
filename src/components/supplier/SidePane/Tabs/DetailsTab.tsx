import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { Supplier } from "models/supplier";

export interface DetailsTabProps {
	supplier: Supplier;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ supplier }) => {
	return (
		<Box sx={{ p: 2 }}>
			<Grid container spacing={2}>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldCompanyName")}</Typography>
					<Typography>{supplier.companyName ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldIsActive")}</Typography>
					<Typography>{supplier.isActive ? translate("active") : translate("inactive")}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldAddress")}</Typography>
					<Typography>{supplier.address ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldEmail")}</Typography>
					<Typography>{supplier.email ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{translate("fieldBalance")}</Typography>
					<Typography color={supplier.balance > 0 ? "success" : "error"}>
						{supplier.balance > 0 ? "+" : "-"} {supplier.balance.toLocaleString("ru-RU")}
					</Typography>
				</Grid>
				<Grid size={{ xs: 12 }}>
					<Typography variant="subtitle2">{translate("fieldPhoneNumbers")}</Typography>
					<Typography>
						{supplier.phoneNumbers.length ? supplier.phoneNumbers.join(", ") : "—"}
					</Typography>
				</Grid>
			</Grid>
		</Box>
	);
};

export default DetailsTab;
