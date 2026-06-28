import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyRecords, LedgerCard } from "components/partner/Detail/detailTable";
import { derivePayments, deriveTransactions } from "components/partner/Detail/ledgerHelpers";
import LedgerTab from "components/partner/Detail/LedgerTab";
import PartnerArchivedBanner from "components/partner/Detail/PartnerArchivedBanner";
import PartnerBalanceCard from "components/partner/Detail/PartnerBalanceCard";
import PaymentsTab from "components/partner/Detail/PaymentsTab";
import TransactionsTab from "components/partner/Detail/TransactionsTab";
import PartnerFormModal from "components/partner/Form/PartnerFormModal";
import { buildPartnerActionRows } from "components/partner/PartnerActionsMenu";
import PartnerDialogs from "components/partner/PartnerDialogs";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import DetailTabs, { DetailTabSpec } from "components/shared/Detail/DetailTabs";
import { observer } from "mobx-react-lite";
import { Partner, PartnerLedgerEntry, UpdatePartnerRequest } from "models/partner";
import { PATHS, paymentDetailPath, saleDetailPath, supplyDetailPath } from "routing/paths";
import { PartnerFormValues } from "schemas/PartnerSchema";
import { useStore } from "stores/StoreContext";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

type PartnerDetailTab = "ledger" | "transactions" | "payments";

const PartnerDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const partnerId = Number(id);
	const [searchParams] = useSearchParams();
	const { partnerStore, partnerLedgerStore, notificationStore } = useStore();

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
		if (Number.isFinite(partnerId)) {
			void partnerLedgerStore.load(partnerId);
		}
		setTab(initialTab);
		return () => partnerLedgerStore.clear();
	}, [partnerId, initialTab, partnerLedgerStore]);

	const partner = partnerLedgerStore.partner;
	const ledgerState = partnerLedgerStore.ledger;
	const ledger = useMemo<PartnerLedgerEntry[]>(
		() => (ledgerState === "loading" ? [] : ledgerState),
		[ledgerState],
	);

	const transactions = useMemo(() => deriveTransactions(ledger), [ledger]);
	const payments = useMemo(() => derivePayments(ledger), [ledger]);

	const goBack = () => navigate(PATHS.partners);
	const openSource = (entry: PartnerLedgerEntry) => {
		if (!entry.sourceId) {
			// Fallback for the self-contained mock (no real source id to link to).
			notificationStore.info(
				`${entry.reference ?? t(`partner.event.${entry.type}`)} — ${t("common.pageInDevelopment")}`,
			);
			return;
		}
		switch (entry.type) {
			case "sale":
			case "refund-sale":
				navigate(saleDetailPath(entry.sourceId));
				break;
			case "supply":
			case "refund-supply":
				navigate(supplyDetailPath(entry.sourceId));
				break;
			case "payment":
			case "deposit":
			case "withdraw":
				navigate(paymentDetailPath(entry.sourceId));
				break;
			default:
				break; // opening — not navigable
		}
	};

	if (partner === "loading" || partnerLedgerStore.ledger === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (partner === null) {
		return (
			<Box sx={{ py: 10, textAlign: "center" }}>
				<Typography sx={{ color: "text.secondary" }}>{t("partner.detail.notFound")}</Typography>
			</Box>
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
					<LedgerCard>
						<EmptyRecords
							icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 22 }} />}
							title={t("partner.txns.empty.title")}
							body={t("partner.txns.emptyNew.body")}
						/>
					</LedgerCard>
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
				<LedgerCard>
					<EmptyRecords
						icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22 }} />}
						title={t("partner.pays.empty.title")}
						body={t("partner.pays.emptyNew.body")}
					/>
				</LedgerCard>
			);
		}
		return <PaymentsTab payments={payments} partnerName={partner.name} onOpen={openSource} />;
	};

	return (
		<Box>
			<DetailPageHeader
				breadcrumb={{ label: t("partner.title"), to: PATHS.partners }}
				title={partner.name}
				actions={actions}
				isArchived={partner.isArchived}
				archivedLabel={t("partner.badge.archived")}
			/>

			{partner.isArchived && <PartnerArchivedBanner />}

			<PartnerBalanceCard partner={partner} ledger={ledger} />

			<Stack sx={{ gap: "16px", mt: "20px" }}>
				<DetailTabs tabs={tabs} active={tab} onChange={setTab} />
				{renderTab()}
			</Stack>

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
