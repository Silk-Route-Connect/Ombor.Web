import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PartnerLedgerEntry } from "models/partner";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatCurrency } from "utils/formatCurrency";
import { balanceColor } from "utils/partnerUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Box } from "@mui/material";

import { bodyCellSx, EmptyRecords, headCellSx } from "./detailTable";
import DetailTableCard from "./DetailTableCard";
import FilterDropdown from "./FilterDropdown";
import { DETAIL_ROWS_PER_PAGE_OPTIONS, useDetailTablePage } from "./ledgerHelpers";
import { EventCell, eventLabelKey } from "./ledgerMeta";

type TypeFilter = "all" | "payment" | "deposit" | "withdraw";

interface PaymentsTabProps {
	payments: PartnerLedgerEntry[];
	partnerName: string;
	onOpen: (entry: PartnerLedgerEntry) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ payments, partnerName, onOpen }) => {
	const { t } = useTranslation();
	const [type, setType] = useState<TypeFilter>("all");
	const [search, setSearch] = useState("");

	const filtered = useMemo(() => {
		const ql = search.trim().toLowerCase();
		return payments.filter((p) => {
			if (type !== "all" && p.type !== type) {
				return false;
			}
			if (!ql) {
				return true;
			}
			const haystack = [
				t(eventLabelKey(p.type)),
				p.reference ?? "",
				p.walletName ?? "",
				String(Math.abs(p.delta)),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(ql);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [payments, type, search, t]);

	const { page, rowsPerPage, setPage, changeRowsPerPage, paginate } = useDetailTablePage(
		`${type}|${search}`,
	);
	const rows = paginate(filtered);

	const handleExport = () => {
		exportToCsv<PartnerLedgerEntry>(
			`partner_${partnerName}_payments_${csvDateStamp()}`,
			[
				{ header: t("partner.pays.col.date"), value: (p) => formatDate(p.date) },
				{ header: t("partner.pays.col.type"), value: (p) => t(eventLabelKey(p.type)) },
				{ header: t("partner.pays.col.amount"), value: (p) => Math.abs(p.delta) },
				{ header: t("partner.pays.col.wallet"), value: (p) => p.walletName ?? "" },
			],
			filtered,
		);
	};

	return (
		<DetailTableCard
			search={{ value: search, onChange: setSearch, placeholder: t("partner.pays.search") }}
			filters={
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
			}
			onExport={handleExport}
			exportDisabled={filtered.length === 0}
			pagination={{
				count: filtered.length,
				page,
				rowsPerPage,
				rowsPerPageOptions: DETAIL_ROWS_PER_PAGE_OPTIONS,
				onPageChange: setPage,
				onRowsPerPageChange: changeRowsPerPage,
			}}
		>
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
		</DetailTableCard>
	);
};

export default PaymentsTab;
