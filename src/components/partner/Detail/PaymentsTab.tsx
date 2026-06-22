import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PartnerLedgerEntry } from "models/partner";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { balanceColor } from "utils/partnerUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Box } from "@mui/material";

import { bodyCellSx, EmptyRecords, headCellSx, LedgerCard } from "./detailTable";
import FilterDropdown from "./FilterDropdown";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type TypeFilter = "all" | "payment" | "deposit" | "withdraw";

interface PaymentsTabProps {
	payments: PartnerLedgerEntry[];
	onOpen: (entry: PartnerLedgerEntry) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ payments, onOpen }) => {
	const { t } = useTranslation();
	const [type, setType] = useState<TypeFilter>("all");

	const rows = payments.filter((p) => type === "all" || p.type === type);

	return (
		<>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: "14px", flexWrap: "wrap" }}>
				<FilterDropdown<TypeFilter>
					label={t("partner.pays.typeFilter")}
					icon={<FilterListIcon sx={{ fontSize: 15 }} />}
					value={type}
					onChange={setType}
					options={[
						{ value: "all", label: t("partner.pays.type.all") },
						{ value: "payment", label: t("partner.pays.type.payment") },
						{ value: "deposit", label: t("partner.pays.type.deposit") },
						{ value: "withdraw", label: t("partner.pays.type.withdraw") },
					]}
				/>
			</Box>

			<LedgerCard>
				{rows.length === 0 ? (
					<EmptyRecords
						icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />}
						title={t("partner.pays.empty.title")}
						body={t("partner.pays.empty.body")}
					/>
				) : (
					<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr>
								<Box component="th" sx={headCellSx}>
									{t("partner.pays.col.date")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("partner.pays.col.type")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("partner.pays.col.amount")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("partner.pays.col.wallet")}
								</Box>
							</tr>
						</thead>
						<tbody>
							{rows.map((p) => (
								<Box
									component="tr"
									key={p.id}
									onClick={() => onOpen(p)}
									sx={{ cursor: "pointer", "&:hover": { bgcolor: "grey.50" } }}
								>
									<Box component="td" sx={{ ...bodyCellSx, ...numericSx, whiteSpace: "nowrap" }}>
										{formatDate(p.date)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<EventCell type={p.type} label={t(eventLabelKey(p.type))} />
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											fontWeight: 600,
											color: balanceColor(p.delta),
										}}
									>
										{formatCurrency(Math.abs(p.delta))}
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, fontSize: 13, color: "text.primary" }}>
										{p.walletName ?? (
											<Box component="span" sx={{ color: "text.secondary" }}>
												{t("common.dash")}
											</Box>
										)}
									</Box>
								</Box>
							))}
						</tbody>
					</Box>
				)}
			</LedgerCard>
		</>
	);
};

export default PaymentsTab;
