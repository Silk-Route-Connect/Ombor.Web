import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
	derivePayments,
	deriveTransactions,
	ledgerSourcePath,
} from "components/partner/Detail/ledgerHelpers";
import LedgerTab from "components/partner/Detail/LedgerTab";
import PartnerArchivedBanner from "components/partner/Detail/PartnerArchivedBanner";
import PartnerDetailRail from "components/partner/Detail/PartnerDetailRail";
import PaymentsTab from "components/partner/Detail/PaymentsTab";
import TransactionsTab from "components/partner/Detail/TransactionsTab";
import PartnerFormModal from "components/partner/Form/PartnerFormModal";
import { buildPartnerActionRows } from "components/partner/PartnerActionsMenu";
import PartnerDialogs from "components/partner/PartnerDialogs";
import PartnerTypeChip from "components/partner/PartnerTypeChip";
import { DETAIL_RAIL_COLUMNS } from "components/shared/Detail/detailLayout";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import DetailTabs, { DetailTabSpec } from "components/shared/Detail/DetailTabs";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { isPresent, isReady, readyOr } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { Partner, PartnerLedgerEntry, UpdatePartnerRequest } from "models/partner";
import { PATHS } from "routing/paths";
import { PartnerFormValues } from "schemas/PartnerSchema";
import { useStore } from "stores/StoreContext";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box } from "@mui/material";

type PartnerDetailTab = "ledger" | "transactions" | "payments";

const PartnerDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const partnerId = useRouteEntityId();
	const [searchParams] = useSearchParams();
	const { partnerStore, partnerLedgerStore } = useStore();

	// Deep-link: a partner opened from Debts arrives with ?tab=transactions&status=open
	// so it lands on the Транзакции tab pre-filtered to outstanding debt (B13/DBT-1).
	const resolveTab = (raw: string | null): PartnerDetailTab =>
		raw === "transactions" ? "transactions" : raw === "payments" ? "payments" : "ledger";
	const initialTab = resolveTab(searchParams.get("tab"));
	const statusParam = searchParams.get("status");
	const initialStatus = (
		["open", "paid", "partial", "unpaid"].includes(statusParam ?? "") ? statusParam : undefined
	) as "open" | "paid" | "partial" | "unpaid" | undefined;

	const [tab, setTab] = useState<PartnerDetailTab>(initialTab);

	useEffect(() => {
		if (partnerId !== null) {
			void partnerLedgerStore.load(partnerId);
		}
		setTab(initialTab);
		return () => partnerLedgerStore.clear();
	}, [partnerId, initialTab, partnerLedgerStore]);

	const partner = partnerId === null ? null : partnerLedgerStore.partner;
	const ledgerState = partnerLedgerStore.ledger;
	const ledger = useMemo<PartnerLedgerEntry[]>(() => readyOr(ledgerState, []), [ledgerState]);
	const retry = () => partnerId !== null && void partnerLedgerStore.load(partnerId);

	const transactions = useMemo(() => deriveTransactions(ledger), [ledger]);
	const payments = useMemo(() => derivePayments(ledger), [ledger]);

	const goBack = () => navigate(PATHS.partners);
	const openSource = (entry: PartnerLedgerEntry) => {
		const path = ledgerSourcePath(entry);
		if (path) {
			navigate(path);
		}
	};

	// The ledger is the page's core (tabs, rail figures) — the page waits for both
	// and shows a failed ledger as the page error, never as an empty history.
	if (!isPresent(partner) || !isReady(ledgerState)) {
		const state = !isPresent(partner) ? partner : isReady(ledgerState) ? "loading" : ledgerState;
		return (
			<LoadStateView
				state={state}
				onRetry={retry}
				errorTitle={t(isPresent(partner) ? "partner.error.getLedger" : "partner.error.getById")}
				notFound={{ title: t("partner.detail.notFound"), backTo: PATHS.partners }}
			/>
		);
	}

	const reflect = (updated: Partner | null) => {
		if (updated) {
			partnerLedgerStore.applyPartner(updated);
		}
	};

	const handleEditSave = (values: PartnerFormValues) => {
		const request: UpdatePartnerRequest = {
			id: partner.id,
			type: values.type,
			name: values.name,
			companyName: values.companyName,
			address: values.address,
			email: values.email,
			telegram: values.telegram,
			phoneNumbers: values.phoneNumbers,
		};
		void partnerStore.update(request).then(reflect);
	};

	const handleDelete = () => {
		if (partner.isDeletable) {
			partnerStore.openDelete(partner);
		} else {
			partnerStore.openCannotDelete(partner);
		}
	};

	const noHistory = partner.activityCount === 0;
	const dialogMode = partnerStore.dialogMode;

	const actions = buildPartnerActionRows(t, {
		partner,
		onEdit: () => partnerStore.openEdit(partner),
		onArchive: () => partnerStore.openArchive(partner),
		onRestore: () => partnerStore.openRestore(partner),
		onDelete: handleDelete,
	});

	const tabs: DetailTabSpec<PartnerDetailTab>[] = [
		{ key: "ledger", label: t("partner.tab.ledger"), count: ledger.length },
		{ key: "transactions", label: t("partner.tab.transactions"), count: transactions.length },
		{ key: "payments", label: t("partner.tab.payments"), count: payments.length },
	];

	const renderTab = () => {
		if (tab === "ledger") {
			return <LedgerTab ledger={ledger} partnerName={partner.name} onOpenSource={openSource} />;
		}
		if (tab === "transactions") {
			if (noHistory) {
				return (
					<DetailTableCard>
						<TableEmptyState
							icon={<ReceiptLongOutlinedIcon />}
							title={t("partner.txns.empty.title")}
							hint={t("partner.txns.emptyNew.body")}
						/>
					</DetailTableCard>
				);
			}
			return (
				<TransactionsTab
					transactions={transactions}
					partnerName={partner.name}
					initialStatus={initialStatus}
					onOpen={openSource}
				/>
			);
		}
		if (noHistory) {
			return (
				<DetailTableCard>
					<TableEmptyState
						icon={<AccountBalanceWalletOutlinedIcon />}
						title={t("partner.pays.empty.title")}
						hint={t("partner.pays.emptyNew.body")}
					/>
				</DetailTableCard>
			);
		}
		return <PaymentsTab payments={payments} partnerName={partner.name} onOpen={openSource} />;
	};

	return (
		<Box>
			<DetailPageHeader
				backTo={PATHS.partners}
				title={partner.name}
				titleExtra={
					<Box sx={{ display: "inline-flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
						<Box
							sx={{
								width: 5,
								height: 5,
								borderRadius: "50%",
								bgcolor: "text.secondary",
								flex: "0 0 auto",
							}}
						/>
						<PartnerTypeChip type={partner.type} dimmed={partner.isArchived} size="md" />
						{partner.companyName && (
							<>
								<Box
									sx={{
										width: 5,
										height: 5,
										borderRadius: "50%",
										bgcolor: "text.secondary",
										flex: "0 0 auto",
									}}
								/>
								<Box
									component="span"
									sx={{
										display: "inline-flex",
										alignItems: "center",
										gap: "7px",
										fontSize: 15,
										color: "text.secondary",
										minWidth: 0,
									}}
								>
									<Inventory2OutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
									{partner.companyName}
								</Box>
							</>
						)}
					</Box>
				}
				actions={actions}
				isArchived={partner.isArchived}
			/>

			{partner.isArchived && <PartnerArchivedBanner />}

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: DETAIL_RAIL_COLUMNS,
					gap: "20px",
					alignItems: "start",
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
					<DetailTabs tabs={tabs} active={tab} onChange={setTab} />
					{renderTab()}
				</Box>

				<Box sx={{ position: "sticky", top: 0 }}>
					<PartnerDetailRail partner={partner} ledger={ledger} />
				</Box>
			</Box>

			<PartnerFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={partnerStore.isSaving}
				partner={dialogMode.kind === "form" ? (dialogMode.partner ?? null) : null}
				onSave={handleEditSave}
				onClose={() => partnerStore.closeDialog()}
			/>

			<PartnerDialogs onArchived={reflect} onRestored={reflect} onDeleted={goBack} />
		</Box>
	);
});

export default PartnerDetailPage;
