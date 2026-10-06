import React from "react";
import { useTranslation } from "react-i18next";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import Callout from "components/shared/Callout/Callout";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isLoadError, Loadable } from "helpers/Loading";
import { usePaymentCreate } from "hooks/payment/usePaymentCreate";
import { observer } from "mobx-react-lite";
import {
	CreatePaymentRecordRequest,
	OutstandingTransaction,
	PaymentFormData,
} from "models/payment";

import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { Box, Stack } from "@mui/material";

import PaymentDirectionField from "./Create/PaymentDirectionField";
import PaymentGeneralFields from "./Create/PaymentGeneralFields";
import PaymentPartnerField from "./Create/PaymentPartnerField";
import PaymentPayrollFields from "./Create/PaymentPayrollFields";
import PaymentTypeField from "./Create/PaymentTypeField";
import PaymentWalletAmountFields from "./Create/PaymentWalletAmountFields";
import PaymentSettlementModal from "./PaymentSettlementModal";

export interface PaymentCreateModalProps {
	isOpen: boolean;
	isSaving: boolean;
	formData: Loadable<PaymentFormData>;
	outstanding: Loadable<OutstandingTransaction[]>;
	onLoadOutstanding: (partnerId: number) => void;
	/** Re-runs a failed reference-data load (partners, employees, wallets). */
	onRetryFormData: () => void;
	onSave: (request: CreatePaymentRecordRequest) => void;
	onClose: () => void;
}

/**
 * «Новый платёж» — a standalone payment of any of the five types (business-rules
 * §B), an immutable event: «Провести платёж» with the commit note, Ctrl+Enter
 * only. An «Оплата» (debt settlement) continues into the settlement step,
 * which books it. The logic lives in `usePaymentCreate`; the sections in `./Create`.
 */
const PaymentCreateModal: React.FC<PaymentCreateModalProps> = (props) => {
	const { isOpen, isSaving, formData, outstanding, onLoadOutstanding, onRetryFormData } = props;
	const { t } = useTranslation();
	const p = usePaymentCreate(props);
	const { partner } = p;
	const settles = p.type === "Transaction";

	return (
		<>
			<FormDialog
				open={isOpen && !p.settleOpen}
				size="md"
				title={t("payment.form.title")}
				subtitle={t("payment.form.subtitle")}
				tile={recordTile("Payment")}
				busy={isSaving}
				onClose={p.requestClose}
				onKeyDown={p.onKeyDown}
				discard={p.discard}
				footer={
					<FormDialogFooter
						canSave={!isSaving}
						loading={isSaving}
						onCancel={p.requestClose}
						onSave={p.submit}
						submitLabel={t(settles ? "payment.form.submitSettle" : "payment.form.submit")}
						submitIcon={settles ? <BalanceOutlinedIcon /> : <CheckIcon />}
						commitNote={t("payment.form.commitNote")}
					/>
				}
			>
				<Stack sx={{ gap: "16px" }}>
					{isLoadError(formData) && (
						<LoadStateView
							state={formData}
							size="section"
							onRetry={onRetryFormData}
							errorTitle={t("payment.error.formData")}
						/>
					)}
					<Box sx={{ pb: "16px", mb: "4px", borderBottom: "1px solid", borderColor: "divider" }}>
						<PaymentTypeField form={p.form} type={p.type} />
					</Box>

					{p.needsPartner && (
						<PaymentPartnerField
							form={p.form}
							partners={p.data.partners}
							partner={partner}
							type={p.type}
						/>
					)}
					{p.type === "Payroll" && (
						<PaymentPayrollFields form={p.form} employees={p.data.employees} />
					)}
					{p.type === "General" && <PaymentGeneralFields form={p.form} />}
					{p.needsDirChoice && p.needsPartner && (
						<PaymentDirectionField form={p.form} label={t("payment.form.directionBoth")} />
					)}

					<PaymentWalletAmountFields
						form={p.form}
						wallets={p.data.wallets}
						amountLimit={p.amountLimit}
					/>
					<AttachmentPicker files={p.files} onAdd={p.addFiles} onRemove={p.removeFile} />

					{p.hasOpenDebts && (
						<Callout tone="info" icon={<BalanceOutlinedIcon />}>
							{t("payment.form.debtsBanner")}
						</Callout>
					)}
				</Stack>
			</FormDialog>

			{p.settleOpen && partner && (
				<PaymentSettlementModal
					isOpen={p.settleOpen}
					isSaving={isSaving}
					partnerName={partner.name}
					amount={p.amount}
					walletName={p.selectedWallet?.name ?? ""}
					direction={p.effectiveDir}
					outstanding={outstanding}
					onRetry={() => onLoadOutstanding(partner.id)}
					onBack={p.closeSettlement}
					onConfirm={p.confirmSettlement}
				/>
			)}
		</>
	);
};

export default observer(PaymentCreateModal);
