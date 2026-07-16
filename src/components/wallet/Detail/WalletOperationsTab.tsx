import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DirectionBadge from "components/shared/DirectionBadge/DirectionBadge";
import DetailLink from "components/shared/Link/DetailLink";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { WalletOperation, WalletOperationDirection } from "models/wallet";
import { paymentDetailPath } from "routing/paths";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { matchesSearch } from "utils/stringUtils";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Paper, Typography } from "@mui/material";

type DirFilter = "all" | WalletOperationDirection;

/** DataTable needs an `id`; WalletOperation already carries one. */
type OperationRow = WalletOperation;

interface WalletOperationsTabProps {
	operations: WalletOperation[];
	onOpenPayment: (operation: WalletOperation) => void;
	onOpenTransfer: (transferId: number) => void;
}

/** Keep the payment link from also firing the row's open-detail click. */
const stop = (e: React.MouseEvent) => e.stopPropagation();

const TypeChip: React.FC<{ label: string }> = ({ label }) => (
	<Box
		component="span"
		sx={{
			display: "inline-flex",
			alignItems: "center",
			px: "9px",
			py: "2px",
			borderRadius: "999px",
			fontSize: 12,
			fontWeight: 600,
			bgcolor: "grey.100",
			color: designTokens.gray700,
			whiteSpace: "nowrap",
		}}
	>
		{label}
	</Box>
);

/**
 * The «Операции» tab on the shared DataTable (warm band, sortable columns,
 * 10/25/50 pager) with a search + direction segmented filter above it. Amounts
 * carry no +/− sign — direction is the shared green ↓ / red ↑ badge (locked
 * pattern 4). The «Платёж» cell links to the payment; a transfer row opens the
 * transfer detail, a payment row routes to its payment.
 *
 * The prototype's period date filter is omitted for now (locked pattern 12).
 */
export const WalletOperationsTab: React.FC<WalletOperationsTabProps> = ({
	operations,
	onOpenPayment,
	onOpenTransfer,
}) => {
	const { t } = useTranslation();
	const [query, setQuery] = useState("");
	const [dir, setDir] = useState<DirFilter>("all");

	const rows = useMemo<OperationRow[]>(
		() =>
			operations.filter((o) => {
				if (dir !== "all" && o.direction !== dir) {
					return false;
				}
				if (query.trim()) {
					return matchesSearch(o.party, query) || matchesSearch(o.paymentNumber, query);
				}
				return true;
			}),
		[operations, query, dir],
	);

	const filtering = query.trim().length > 0 || dir !== "all";

	const dirOptions: Array<{ value: DirFilter; label: string }> = [
		{ value: "all", label: t("wallet.operations.filterAll") },
		{ value: "In", label: t("wallet.operations.in") },
		{ value: "Out", label: t("wallet.operations.out") },
	];

	const columns = useMemo<Column<OperationRow>[]>(
		() => [
			{
				key: "date",
				headerName: t("wallet.operations.date"),
				sortValue: (o) => o.date,
				renderCell: (o) => (
					<Box
						component="span"
						sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
					>
						{formatDateTime(o.date)}
					</Box>
				),
			},
			{
				key: "payment",
				headerName: t("wallet.operations.payment"),
				sortValue: (o) => o.paymentNumber ?? "",
				renderCell: (o) => {
					if (!o.paymentNumber) {
						return (
							<Box component="span" sx={{ color: "text.disabled" }}>
								—
							</Box>
						);
					}
					return o.paymentId ? (
						<Box component="span" sx={{ ...numericSx, fontWeight: 600 }} onClick={stop}>
							<DetailLink to={paymentDetailPath(o.paymentId)}>{o.paymentNumber}</DetailLink>
						</Box>
					) : (
						<Box component="span" sx={{ ...numericSx, fontWeight: 600, color: "text.primary" }}>
							{o.paymentNumber}
						</Box>
					);
				},
			},
			{
				key: "type",
				headerName: t("wallet.operations.type"),
				sortValue: (o) => t(`wallet.operation.${o.kind}`),
				renderCell: (o) => <TypeChip label={t(`wallet.operation.${o.kind}`)} />,
			},
			{
				key: "direction",
				headerName: t("wallet.operations.direction"),
				sortValue: (o) => o.direction,
				renderCell: (o) => (
					<DirectionBadge
						income={o.direction === "In"}
						label={t(o.direction === "In" ? "wallet.operations.in" : "wallet.operations.out")}
					/>
				),
			},
			{
				key: "party",
				headerName: t("wallet.operations.party"),
				sortValue: (o) => o.party ?? "",
				renderCell: (o) => (
					<Box
						component="span"
						sx={{ color: o.transferId != null ? "text.secondary" : "text.primary" }}
					>
						{o.party ?? "—"}
					</Box>
				),
			},
			{
				key: "amount",
				headerName: t("wallet.operations.amount"),
				align: "right",
				sortValue: (o) => o.amount,
				renderCell: (o) => (
					<Box
						component="span"
						sx={{
							...numericSx,
							fontWeight: 700,
							fontSize: 15,
							color: o.direction === "In" ? "success.main" : "error.main",
						}}
					>
						{formatCurrency(o.amount)}
					</Box>
				),
			},
			{
				key: "balanceAfter",
				headerName: t("wallet.operations.balanceAfter"),
				align: "right",
				sortValue: (o) => o.balanceAfter,
				renderCell: (o) => (
					<Box component="span" sx={{ ...numericSx, fontWeight: 700, color: "text.primary" }}>
						{formatCurrency(o.balanceAfter)}
					</Box>
				),
			},
		],
		[t],
	);

	const handleRowClick = (o: OperationRow): void => {
		if (o.transferId != null) {
			onOpenTransfer(o.transferId);
		} else {
			onOpenPayment(o);
		}
	};

	return (
		<>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder={t("wallet.operations.searchPlaceholder")}
				/>
				<SegmentedControl options={dirOptions} value={dir} onChange={setDir} />
			</Box>

			{rows.length === 0 ? (
				<Paper
					elevation={1}
					sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
				>
					<Box sx={{ p: "44px 24px 48px", textAlign: "center" }}>
						<SwapHorizIcon sx={{ fontSize: 26, color: "text.disabled" }} />
						<Typography sx={{ fontWeight: 600, mt: 1 }}>
							{t("wallet.operations.emptyTitle")}
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
							{filtering ? t("wallet.operations.emptyFiltered") : t("wallet.operations.emptyBody")}
						</Typography>
					</Box>
				</Paper>
			) : (
				<DataTable<OperationRow>
					rows={rows}
					columns={columns}
					pagination
					defaultSort={{ key: "date", order: "desc" }}
					onRowClick={handleRowClick}
				/>
			)}
		</>
	);
};

export default WalletOperationsTab;
