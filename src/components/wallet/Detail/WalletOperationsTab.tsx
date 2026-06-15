import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { WalletOperation, WalletOperationDirection } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { matchesSearch } from "utils/stringUtils";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Box, Paper, Typography } from "@mui/material";

type DirFilter = "all" | WalletOperationDirection;

interface WalletOperationsTabProps {
	operations: WalletOperation[];
	onOpenPayment: (operation: WalletOperation) => void;
	onOpenTransfer: (transferId: number) => void;
}

const headCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
	bgcolor: "background.paper",
} as const;

const bodyCellSx = {
	p: "13px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

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

const DirectionPill: React.FC<{ direction: WalletOperationDirection }> = ({ direction }) => {
	const { t } = useTranslation();
	const inbound = direction === "In";
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				fontSize: 12.5,
				fontWeight: 600,
				color: inbound ? "success.main" : "error.main",
				whiteSpace: "nowrap",
			}}
		>
			{inbound ? <SouthEastIcon sx={{ fontSize: 15 }} /> : <NorthEastIcon sx={{ fontSize: 15 }} />}
			{t(inbound ? "wallet.operations.in" : "wallet.operations.out")}
		</Box>
	);
};

/**
 * The «Операции» tab: every money movement through the wallet (newest first),
 * with a search and a direction segmented filter. Amounts carry no +/− sign —
 * direction is conveyed by the pill + green/red colour (locked pattern 4). A
 * payment row routes to its payment; a transfer row opens the transfer detail.
 *
 * The prototype's period date filter is omitted for now (locked pattern 12 —
 * date-range filtering across ledgers is a planned refinement).
 */
export const WalletOperationsTab: React.FC<WalletOperationsTabProps> = ({
	operations,
	onOpenPayment,
	onOpenTransfer,
}) => {
	const { t } = useTranslation();
	const [query, setQuery] = useState("");
	const [dir, setDir] = useState<DirFilter>("all");

	const rows = useMemo(
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

	return (
		<>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder={t("wallet.operations.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 300 } }}
				/>
				<SegmentedControl options={dirOptions} value={dir} onChange={setDir} />
			</Box>

			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				{rows.length === 0 ? (
					<Box sx={{ p: "44px 24px 48px", textAlign: "center" }}>
						<SwapHorizIcon sx={{ fontSize: 26, color: "text.disabled" }} />
						<Typography sx={{ fontWeight: 600, mt: 1 }}>
							{t("wallet.operations.emptyTitle")}
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
							{filtering ? t("wallet.operations.emptyFiltered") : t("wallet.operations.emptyBody")}
						</Typography>
					</Box>
				) : (
					<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr>
								<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
									{t("wallet.operations.date")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("wallet.operations.payment")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("wallet.operations.type")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("wallet.operations.direction")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("wallet.operations.party")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("wallet.operations.amount")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right", pr: "18px" }}>
									{t("wallet.operations.balanceAfter")}
								</Box>
							</tr>
						</thead>
						<tbody>
							{rows.map((o) => {
								const isTransfer = o.transferId != null;
								return (
									<Box
										component="tr"
										key={o.id}
										onClick={() =>
											isTransfer ? onOpenTransfer(o.transferId as number) : onOpenPayment(o)
										}
										sx={{ cursor: "pointer", "&:hover": { bgcolor: designTokens.gray25 } }}
									>
										<Box
											component="td"
											sx={{ ...bodyCellSx, pl: "18px", ...numericSx, color: "text.secondary" }}
										>
											{formatDate(o.date)}
										</Box>
										<Box component="td" sx={bodyCellSx}>
											{o.paymentNumber ? (
												<Box
													component="span"
													sx={{
														...numericSx,
														fontWeight: 600,
														fontSize: 13,
														color: "primary.main",
													}}
												>
													{o.paymentNumber}
												</Box>
											) : (
												<Box
													component="span"
													sx={{
														display: "inline-flex",
														alignItems: "center",
														gap: "4px",
														px: "9px",
														py: "2px",
														borderRadius: "999px",
														fontSize: 12,
														fontWeight: 600,
														bgcolor: "grey.100",
														color: designTokens.gray700,
													}}
												>
													<SwapHorizIcon sx={{ fontSize: 13 }} />
													{t("wallet.operation.Transfer")}
												</Box>
											)}
										</Box>
										<Box component="td" sx={bodyCellSx}>
											<TypeChip label={t(`wallet.operation.${o.kind}`)} />
										</Box>
										<Box component="td" sx={bodyCellSx}>
											<DirectionPill direction={o.direction} />
										</Box>
										<Box
											component="td"
											sx={{ ...bodyCellSx, color: isTransfer ? "text.secondary" : "text.primary" }}
										>
											{o.party}
										</Box>
										<Box
											component="td"
											sx={{
												...bodyCellSx,
												textAlign: "right",
												...numericSx,
												fontWeight: 700,
												fontSize: 15,
												color: o.direction === "In" ? "success.main" : "error.main",
											}}
										>
											{formatCurrency(o.amount)}
										</Box>
										<Box
											component="td"
											sx={{
												...bodyCellSx,
												textAlign: "right",
												pr: "18px",
												...numericSx,
												fontWeight: 600,
												color: "text.secondary",
											}}
										>
											{formatCurrency(o.balanceAfter)}
										</Box>
									</Box>
								);
							})}
						</tbody>
					</Box>
				)}
			</Paper>
		</>
	);
};

export default WalletOperationsTab;
