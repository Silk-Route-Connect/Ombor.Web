import React, { useEffect, useState } from "react";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	LinearProgress,
	TextField,
} from "@mui/material";
import TransactionFormDetails from "components/shared/Transaction/Form/Steps/TransactionFormDetails";
import TransactionFormPayment from "components/shared/Transaction/Form/Steps/TransactionFormPayment";
import { TransactionFormMode } from "hooks/transactions/useTransactionForm";
import { useTransactionFormWrapper } from "hooks/transactions/useTransactionFormWrapper";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { PaymentCurrency, PaymentMethod } from "models/payment";
import { TransactionRecord, TransactionType } from "models/transaction";
import { useStore } from "stores/StoreContext";

const CONTENT_HEIGHT = 560;

export type TransactionFormLinePayload = {
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: number;
	discount: number;
};

export interface TransactionFormPayload {
	partnerId: number;
	type: TransactionType;
	date: Date;
	lines: TransactionFormLinePayload[];
	notes?: string;
	paymentMethod: PaymentMethod;
	currency: PaymentCurrency;
	exchangeRate: number;
	totalPaid: number;
	attachments?: File[];
}

export interface TransactionFormTemplatePayload {
	name: string;
	partnerId: number;
	lines: TransactionFormLinePayload[];
}

interface TransactionFormProps {
	isOpen: boolean;
	isSaving: boolean;
	mode: TransactionFormMode;
	transaction?: TransactionRecord | null;

	onSave(payload: TransactionFormPayload): void;
	onSaveTemplate(template: TransactionFormTemplatePayload): Promise<void>;
	onClose(): void;
}

const TransactionFormModal: React.FC<TransactionFormProps> = observer(
	({ isOpen, isSaving, mode, transaction, onClose, onSave, onSaveTemplate }) => {
		const form = useTransactionFormWrapper(mode, transaction);
		const [activeStep, setActiveStep] = useState(0);
		const [confirmClose, setConfirmClose] = useState(false);
		const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
		const [templateName, setTemplateName] = useState("");

		const { productStore, templateStore, partnerStore } = useStore();

		useEffect(() => {
			if (isOpen) {
				resetForm();
				productStore.loadProducts();
				templateStore.load();
			}
		}, [productStore, templateStore, partnerStore, isOpen]);

		const resetForm = (): void => {
			form.reset();
			setActiveStep(0);
			setConfirmClose(false);
			setTemplateDialogOpen(false);
			setTemplateName("");
		};

		const openTemplateDialog = () => setTemplateDialogOpen(true);

		const confirmTemplateSave = () => {
			if (!templateName.trim()) return;
			onSaveTemplate({
				name: templateName.trim(),
				partnerId: form.partnerId!,
				lines: form.lines.map((i) => ({
					productId: i.productId,
					productName: i.productName ?? "",
					quantity: i.quantity,
					unitPrice: i.unitPrice,
					discount: i.discount ?? 0,
				})),
			});
			setTemplateDialogOpen(false);
			setTemplateName("");
		};

		return (
			<Dialog
				open={isOpen}
				onClose={() => !isSaving && setConfirmClose(true)}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle sx={{ pr: 6 }}>
					{translate(transaction ? "updateTitle" : "createTitle")}
					<IconButton
						onClick={() => setConfirmClose(true)}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ height: CONTENT_HEIGHT }}>
					<Box sx={{ display: activeStep === 0 ? "block" : "none" }}>
						<TransactionFormDetails mode={mode} form={form} />
					</Box>
					<Box sx={{ display: activeStep === 1 ? "block" : "none" }}>
						<TransactionFormPayment form={form} />
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						justifyContent: activeStep === 0 ? "space-between" : "flex-end",
					}}
				>
					{activeStep === 0 && (
						<Button
							variant="text"
							startIcon={<BookmarkAddOutlinedIcon />}
							onClick={openTemplateDialog}
							disabled={!form.isDetailsValid || isSaving}
						>
							{translate("saveAsTemplate")}
						</Button>
					)}

					<Box display="flex" gap={1} sx={{ display: activeStep === 0 ? "block" : "none" }}>
						<Button onClick={onClose}>{translate("close")}</Button>
						<Button
							variant="contained"
							onClick={() => setActiveStep(1)}
							disabled={!form.isDetailsValid}
						>
							{translate("payment")}
						</Button>
					</Box>

					<Box display="flex" gap={1} sx={{ display: activeStep === 1 ? "block" : "none" }}>
						<Button onClick={() => setActiveStep(0)}>{translate("back")}</Button>
						<Button
							variant="contained"
							onClick={() => onSave(form.buildPayload())}
							disabled={!form.isPaymentValid || isSaving}
						>
							{translate("save")}
						</Button>
					</Box>
				</DialogActions>

				<Dialog open={confirmClose} onClose={() => setConfirmClose(false)} maxWidth="xs">
					<DialogContent>{translate("confirmClose")}</DialogContent>
					<DialogActions>
						<Button onClick={() => setConfirmClose(false)}>{translate("cancel")}</Button>
						<Button onClick={onClose}>{translate("yes")}</Button>
					</DialogActions>
				</Dialog>

				<Dialog
					open={templateDialogOpen}
					onClose={() => setTemplateDialogOpen(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>{translate("template.dialogTitle")}</DialogTitle>
					<DialogContent sx={{ pt: 2 }}>
						<TextField
							fullWidth
							label={translate("template.fieldName")}
							value={templateName}
							onChange={(e) => setTemplateName(e.target.value)}
							error={!templateName.trim()}
							helperText={!templateName.trim() ? translate("template.nameRequired") : " "}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setTemplateDialogOpen(false)}>{translate("cancel")}</Button>
						<Button
							variant="contained"
							onClick={confirmTemplateSave}
							disabled={!templateName.trim() || isSaving}
						>
							{translate("save")}
						</Button>
					</DialogActions>
				</Dialog>

				{isSaving && (
					<Box
						sx={{
							position: "absolute",
							inset: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							bgcolor: "rgba(255,255,255,0.5)",
							zIndex: 1200,
						}}
					>
						<CircularProgress />
					</Box>
				)}
			</Dialog>
		);
	},
);

export default TransactionFormModal;
