import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyRecords, LedgerCard } from "components/partner/Detail/detailTable";
import { derivePayments, deriveTransactions } from "components/partner/Detail/ledgerHelpers";
import LedgerTab from "components/partner/Detail/LedgerTab";
import PartnerArchivedBanner from "components/partner/Detail/PartnerArchivedBanner";
import PartnerBalanceCard from "components/partner/Detail/PartnerBalanceCard";
import PartnerDetailHeader from "components/partner/Detail/PartnerDetailHeader";
import PartnerDetailTabs, { PartnerDetailTab } from "components/partner/Detail/PartnerDetailTabs";
import PaymentsTab from "components/partner/Detail/PaymentsTab";
import TransactionsTab from "components/partner/Detail/TransactionsTab";
import PartnerFormModal from "components/partner/Form/PartnerFormModal";
import PartnerDialogs from "components/partner/PartnerDialogs";
import { observer } from "mobx-react-lite";
import { Partner, PartnerLedgerEntry, UpdatePartnerRequest } from "models/partner";
import { PATHS, paymentDetailPath, saleDetailPath, supplyDetailPath } from "routing/paths";
import { PartnerFormValues } from "schemas/PartnerSchema";
import { useStore } from "stores/StoreContext";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";

const PartnerDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const partnerId = Number(id);
	const { partnerStore, partnerLedgerStore, notificationStore } = useStore();

	const [tab, setTab] = useState<PartnerDetailTab>("ledger");

	useEffect(() => {
		if (Number.isFinite(partnerId)) {
			void partnerLedgerStore.load(partnerId);
		}
		setTab("ledger");
		return () => partnerLedgerStore.clear();
	}, [partnerId, partnerLedgerStore]);

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

	const tabs = [
		{ value: "ledger" as const, label: t("partner.tab.ledger"), count: ledger.length },
		{
			value: "transactions" as const,
			label: t("partner.tab.transactions"),
			count: transactions.length,
		},
		{ value: "payments" as const, label: t("partner.tab.payments"), count: payments.length },
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
			return <TransactionsTab transactions={transactions} onOpen={openSource} />;
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
		return <PaymentsTab payments={payments} onOpen={openSource} />;
	};

	return (
		<Box>
			<PartnerDetailHeader
				partner={partner}
				onBack={goBack}
				onEdit={() => partnerStore.openEdit(partner)}
				onArchive={() => partnerStore.openArchive(partner)}
				onRestore={() => partnerStore.openRestore(partner)}
				onDelete={handleDelete}
			/>

			{partner.isArchived && <PartnerArchivedBanner />}

			<PartnerBalanceCard partner={partner} ledger={ledger} />

			<Stack sx={{ gap: "16px", mt: "20px" }}>
				<PartnerDetailTabs value={tab} tabs={tabs} onChange={setTab} />
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
