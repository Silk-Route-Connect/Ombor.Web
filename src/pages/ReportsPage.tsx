import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ReportHubCard from "components/report/Hub/ReportHubCard";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PATHS, reportPath } from "routing/paths";
import { ReportKind } from "utils/report/reportQuery";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RemoveShoppingCartOutlinedIcon from "@mui/icons-material/RemoveShoppingCartOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import { Box } from "@mui/material";

/** The hub's cards in reading order; «Долги» opens the existing debts page. */
const HUB: { key: ReportKind | "debts"; icon: React.ReactNode }[] = [
	{ key: "sales", icon: <PointOfSaleOutlinedIcon /> },
	{ key: "profit", icon: <SavingsOutlinedIcon /> },
	{ key: "purchases", icon: <LocalShippingOutlinedIcon /> },
	{ key: "stock", icon: <Inventory2OutlinedIcon /> },
	{ key: "cashFlow", icon: <AccountBalanceWalletOutlinedIcon /> },
	{ key: "expenses", icon: <ReceiptLongOutlinedIcon /> },
	{ key: "losses", icon: <RemoveShoppingCartOutlinedIcon /> },
	{ key: "debts", icon: <RequestQuoteOutlinedIcon /> },
];

/**
 * «Отчёты» (scope-8): one card per report, each saying in plain words which
 * question it answers. Every report opens on «Этот месяц».
 */
const ReportsPage: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<Box>
			<PageHeader title={t("report.hub.title")} subtitle={t("report.hub.subtitle")} />
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "16px",
				}}
			>
				{HUB.map(({ key, icon }) => (
					<ReportHubCard
						key={key}
						icon={icon}
						title={t(`report.kind.${key}.title`)}
						description={t(`report.kind.${key}.description`)}
						onOpen={() => navigate(key === "debts" ? PATHS.debts : reportPath(key))}
					/>
				))}
			</Box>
		</Box>
	);
};

export default ReportsPage;
