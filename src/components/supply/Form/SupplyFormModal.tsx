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
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Supply } from "models/supply";
import { IProductStore } from "stores/ProductStore";
import { ISupplierStore } from "stores/SupplierStore";
import { ISupplyStore } from "stores/SupplyStore";
import { ITemplateStore } from "stores/TemplateStore";

import DetailsStep from "./Steps/DetailsStep";
import PaymentStep from "./Steps/PaymentStep";
import { useSupplyForm } from "./useSupplyForm";

const CONTENT_HEIGHT = 560;

export type SupplyItemPayload = {
	productId: number;
	productName: string;
	quantity: number;
	unitPrice: number;
	discount: number; // 0 if none
};

export interface SupplyFormPayload {
	supplierId: number;
	date: Date;
	items: SupplyItemPayload[];
	notes?: string;
	paymentType: "cash" | "card" | "transfer";
	currency: "uzs" | "usd" | "rub";
	exchangeRate: number; // 0 when currency === "uzs"
	totalPaid: number;
	attachments?: File[];
}

export interface SupplyTemplatePayload {
	name: string;
	partnerId: number; // same as supplierId for supply templates
	items: SupplyItemPayload[];
}

interface Props {
	isOpen: boolean;
	supply?: Supply | null;
	onClose(): void;
	onSave(p: SupplyFormPayload): Promise<void>;
	onSaveTemplate(t: SupplyTemplatePayload): Promise<void>;
	supplyStore: ISupplyStore;
	supplierStore: ISupplierStore;
	templateStore: ITemplateStore;
	productStore: IProductStore;
}

const SupplyFormModal: React.FC<Props> = observer(
	({
		isOpen,
		supply,
		onClose,
		onSave,
		onSaveTemplate,
		supplierStore,
		templateStore,
		productStore,
	}) => {
		useEffect(() => {
			productStore.loadProducts();
			templateStore.load("supply");
			supplierStore.loadSuppliers?.();
		}, [productStore, templateStore, supplierStore]);

		const form = useSupplyForm(supply, templateStore, productStore);
		const [activeStep, setActiveStep] = useState(0);
		const [saving, setSaving] = useState(false);
		const [confirmClose, setConfirmClose] = useState(false);

		const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
		const [templateName, setTemplateName] = useState("");

		const save = async () => {
			setSaving(true);
			await onSave(form.buildPayload());
			setSaving(false);
			onClose();
		};

		const openTemplateDialog = () => setTemplateDialogOpen(true);

		const confirmTemplateSave = async () => {
			if (!templateName.trim()) return;
			setSaving(true);
			await onSaveTemplate({
				name: templateName.trim(),
				partnerId: form.supplierId!,
				items: form.items.map((i) => ({
					productId: i.productId,
					productName: i.productName ?? "",
					quantity: i.quantity,
					unitPrice: i.unitPrice,
					discount: i.discount ?? 0,
				})),
			});
			setSaving(false);
			setTemplateDialogOpen(false);
			setTemplateName("");
		};

		return (
			<Dialog
				open={isOpen}
				onClose={() => (saving ? undefined : setConfirmClose(true))}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle sx={{ pr: 6 }}>
					{translate(supply ? "updateTitle" : "createTitle")}
					<IconButton
						onClick={() => setConfirmClose(true)}
						sx={{ position: "absolute", right: 8, top: 8 }}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				{saving && <LinearProgress />}

				<DialogContent dividers sx={{ minHeight: CONTENT_HEIGHT }}>
					{/* step bar removed per request */}
					{activeStep === 0 ? (
						<DetailsStep form={form} productStore={productStore} supplierStore={supplierStore} />
					) : (
						<PaymentStep form={form} />
					)}
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
							disabled={!form.isDetailsValid || saving}
						>
							{translate("saveAsTemplate")}
						</Button>
					)}

					<Box display="flex" gap={1}>
						{activeStep === 1 && (
							<Button onClick={() => setActiveStep(0)}>{translate("back")}</Button>
						)}

						{activeStep === 0 && <Button onClick={onClose}>{translate("close")}</Button>}

						{activeStep === 0 ? (
							<Button
								variant="contained"
								onClick={() => setActiveStep(1)}
								disabled={!form.isDetailsValid}
							>
								{translate("payment")}
							</Button>
						) : (
							<Button variant="contained" onClick={save} disabled={!form.isPaymentValid || saving}>
								{translate("save")}
							</Button>
						)}
					</Box>
				</DialogActions>

				{/* confirm-close dialog */}
				<Dialog open={confirmClose} onClose={() => setConfirmClose(false)} maxWidth="xs">
					<DialogContent>{translate("confirmClose")}</DialogContent>
					<DialogActions>
						<Button onClick={() => setConfirmClose(false)}>{translate("cancel")}</Button>
						<Button onClick={onClose}>{translate("yes")}</Button>
					</DialogActions>
				</Dialog>

				{/* template-name dialog */}
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
							disabled={!templateName.trim() || saving}
						>
							{translate("save")}
						</Button>
					</DialogActions>
				</Dialog>

				{saving && (
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

export default SupplyFormModal;
