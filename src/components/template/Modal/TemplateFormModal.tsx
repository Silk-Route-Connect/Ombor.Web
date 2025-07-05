import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import PartnerAutocomplete from "components/shared/Autocomplete/PartnerAutocomplete";
import ProductAutocomplete from "components/shared/Autocomplete/ProductAutocomplete";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { useTemplateFormWrapper } from "hooks/templates/useTemplateFormWrapper";
import { translate } from "i18n/i18n";
import { Template, TemplateType } from "models/template";
import { useStore } from "stores/StoreContext";
import { formatNumberWithCommas } from "utils/formatCurrency";

import { ItemsList } from "./ItemsList.tsx/ItemsList";

const CONTENT_HEIGHT = 560;
const TEMPLATE_TYPES: TemplateType[] = ["Supply", "Sale"];
const LIST_HEIGHT = 300;

export type TemplateFormPayload = {
	name: string;
	partnerId: number;
	type: TemplateType;
	items: TemplateFormItemPayload[];
};

export type TemplateFormItemPayload = {
	id: number;
	productId: number;
	productName: string;
	unitPrice: number;
	quantity: number;
	discount: number;
};

interface Props {
	isOpen: boolean;
	template?: Template | null;
	onClose: () => void;
	onSave: (payload: TemplateFormPayload) => void;
}

const TemplateFormModal: React.FC<Props> = ({ isOpen, template, onClose, onSave }) => {
	const form = useTemplateFormWrapper(template);
	const { partnerStore: partnersStore, productStore } = useStore();

	const [saving, setSaving] = useState(false);
	const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		form.reset();
		partnersStore.getAll();
		productStore.loadProducts();
	}, [isOpen, template]);

	const isDirty = form.isFormTouched;

	const attemptClose = () => {
		if (isDirty) {
			setConfirmCloseOpen(true);
		} else {
			doClose();
		}
	};

	const doClose = () => {
		setConfirmCloseOpen(false);
		onClose();
	};

	const handleSave = async () => {
		setSaving(true);
		const payload = form.buildPayload();

		if (payload) {
			onSave(payload);
		}

		setSaving(false);
		doClose();
	};

	return (
		<>
			<Dialog
				open={isOpen}
				fullWidth
				maxWidth="md"
				onClose={() => (saving ? undefined : attemptClose())}
			>
				<DialogTitle sx={{ pr: 6 }}>
					{translate(template ? "editTemplateTitle" : "createTemplateTitle")}
					<IconButton onClick={attemptClose} sx={{ position: "absolute", top: 8, right: 8 }}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				{saving && <LinearProgress />}

				<DialogContent dividers sx={{ height: CONTENT_HEIGHT }}>
					<Box>
						<Grid container rowSpacing={3} columnSpacing={2}>
							<Grid container columnSpacing={2} size={{ xs: 12 }}>
								<Grid size={{ xs: 12, sm: 4 }}>
									<TextField
										label={translate("templateFieldName")}
										value={form.name ?? ""}
										onChange={(e) => form.setName(e.target.value)}
										fullWidth
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 4 }}>
									<FormControl fullWidth>
										<InputLabel id="template-type-label">{translate("template.type")}</InputLabel>
										<Select
											labelId="template-type-label"
											label={translate("template.type")}
											value={form.type}
											onChange={(e) => form.setType(e.target.value as TemplateType)}
										>
											{TEMPLATE_TYPES.map((t) => (
												<MenuItem key={t} value={t}>
													{translate(`template.type.${t}`)}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								<Grid size={{ xs: 12, sm: 4 }}>
									<PartnerAutocomplete
										value={form.partner}
										type={form.type === "Sale" ? "Supplier" : "Customer"}
										onChange={(value) => form.setPartner(value)}
									/>
								</Grid>
							</Grid>

							<Grid container columnSpacing={2} alignItems="flex-end" size={{ xs: 12 }}>
								<Grid size={{ xs: 12, sm: 8 }}>
									<ProductAutocomplete
										value={form.selectedProduct}
										type={form.type === "Sale" ? "Sale" : "Supply"}
										onChange={(value) => form.setSelectedProduct(value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												form.addItem();
											}
										}}
									/>
								</Grid>

								<Grid size={{ xs: 12, sm: 4 }}>
									<Button
										fullWidth
										variant="contained"
										startIcon={<AddIcon />}
										onClick={form.addItem}
										sx={{ height: 56 }}
										disabled={!form.selectedProduct}
									>
										{translate("add")}
									</Button>
								</Grid>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<Box
									sx={{
										height: LIST_HEIGHT,
										overflowY: "auto",
										border: 1,
										borderColor: "divider",
										borderRadius: 1,
										p: 1,
									}}
								>
									<ItemsList
										data={form.items}
										onUpdate={form.updateItem}
										onRemove={form.removeItem}
									/>
								</Box>
							</Grid>

							<Grid size={{ xs: 12 }}>
								<Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
									{translate("transaction.total")}: {form.totalDue.toLocaleString()}
								</Typography>
							</Grid>
						</Grid>
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						px: 2,
					}}
				>
					<Typography variant="subtitle1">
						{translate("template.totalDue")}: {formatNumberWithCommas(form.totalDue)}
					</Typography>

					<Box>
						<Button onClick={attemptClose}>{translate("cancel")}</Button>
						<Button
							variant="contained"
							disabled={!form.isFormValid}
							onClick={handleSave}
							sx={{ ml: 1 }}
						>
							{translate("save")}
						</Button>
					</Box>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				isOpen={confirmCloseOpen}
				title={translate("unsavedChangesTitle")}
				content={<Typography>{translate("unsavedChangesContent")}</Typography>}
				confirmLabel={translate("discard")}
				cancelLabel={translate("keepEditing")}
				onConfirm={doClose}
				onCancel={() => setConfirmCloseOpen(false)}
			/>

			{saving && (
				<Box
					sx={{
						position: "absolute",
						inset: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						bgcolor: "rgba(255,255,255,0.5)",
						zIndex: 1300,
					}}
				>
					<CircularProgress />
				</Box>
			)}
		</>
	);
};

export default TemplateFormModal;
