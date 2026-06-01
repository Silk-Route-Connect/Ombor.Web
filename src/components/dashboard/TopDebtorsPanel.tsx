import React from "react";
import { useNavigate } from "react-router-dom";
import { translate } from "i18n/i18n";
import { formatSignedMoney } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Avatar, Box, Link, Typography } from "@mui/material";

import { TopDebtor } from "../../models/dashboard";
import DashboardPanel from "./DashboardPanel";

const initials = (name: string): string =>
	name
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]?.toUpperCase())
		.join("");

const TopDebtorsPanel: React.FC<{ debtors: TopDebtor[] }> = ({ debtors }) => {
	const navigate = useNavigate();

	return (
		<DashboardPanel title={translate("dashboard.topDebtors.title")}>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				{debtors.map((d) => (
					<Box
						key={d.name}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1.5,
							py: 1.25,
							borderBottom: 1,
							borderColor: "divider",
							"&:last-of-type": { borderBottom: 0 },
						}}
					>
						<Avatar
							sx={{
								width: 36,
								height: 36,
								bgcolor: "primary.light",
								color: "primary.main",
								fontSize: "0.8125rem",
								fontWeight: 600,
							}}
						>
							{initials(d.name)}
						</Avatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
								{d.name}
							</Typography>
							<Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
								{d.company || translate("dashboard.noCompany")}
							</Typography>
						</Box>
						<Typography
							variant="body2"
							sx={{ fontWeight: 700, color: "error.main", fontVariantNumeric: "tabular-nums" }}
						>
							{formatSignedMoney(-d.amount)}
						</Typography>
					</Box>
				))}
			</Box>

			<Link
				component="button"
				onClick={() => navigate("/partners")}
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: 0.25,
					mt: 1.5,
					fontSize: "0.8125rem",
					fontWeight: 600,
				}}
			>
				{translate("dashboard.topDebtors.all")}
				<ChevronRightIcon sx={{ fontSize: 16 }} />
			</Link>
		</DashboardPanel>
	);
};

export default TopDebtorsPanel;
