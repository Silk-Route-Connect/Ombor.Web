import React, { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	LinearProgress,
	TextField,
	Typography,
} from "@mui/material";
import PartnerAutocomplete from "components/shared/Autocomplete/PartnerAutocomplete";
import ProductAutocomplete from "components/shared/Autocomplete/ProductAutocomplete";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { translate } from "i18n/i18n";
import { Template, TemplateItem, TemplateType } from "models/template";
import { useStore } from "stores/StoreContext";
import { formatNumberWithCommas } from "utils/formatCurrency";

const CONTENT_HEIGHT = 560;
const TEMPLATE_TYPES: TemplateType[] = ["Supply", "Sale"];

export type TemplateFormPayload = {
	name: string;
	partnerId: number;
	type: TemplateType;
	items: TemplateItem[];
};

interface Props {
	isOpen: boolean;
	template?: Template | null;
	onClose: () => void;
	onSave: (payload: TemplateFormPayload) => void;
}

const TemplateFormModal: React.FC<Props> = ({ isOpen, template, onClose, onSave }) => {
	const { partnersStore, productStore } = useStore();

	const [name, setName] = useState("");
	const [type, setType] = useState<TemplateType>("Supply");
	const [partnerId, setPartnerId] = useState(0);
	const [items, setItems] = useState<TemplateItem[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<TemplateItem | null>(null);
	const [saving, setSaving] = useState(false);
	const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

	const initial = useMemo(
		() => ({
			name: template?.name ?? "",
			type: template?.type ?? "Supply",
			partnerId: template?.partnerId ?? 0,
			itemsJson: JSON.stringify(template?.items ?? []),
		}),
		[template],
	);

	useEffect(() => {
		if (!isOpen) return;
		partnersStore.getAll();
		productStore.loadProducts();
		setName(template?.name ?? "");
		setType(template?.type ?? "Supply");
		setPartnerId(template?.partnerId ?? 0);
		setItems(template?.items ?? []);
		setSelectedProduct(null);
	}, [isOpen, template, partnersStore]);

	useEffect(() => {
		if (!isOpen) return;
		if (!template || type !== template.type) {
			setPartnerId(0);
			partnersStore.getAll();
		}
	}, [type, isOpen, template, partnersStore]);

	const isDirty = () =>
		name !== initial.name ||
		type !== initial.type ||
		partnerId !== initial.partnerId ||
		JSON.stringify(items) !== initial.itemsJson;

	const attemptClose = () => {
		if (isDirty()) {
			setConfirmCloseOpen(true);
		} else {
			doClose();
		}
	};
	const doClose = () => {
		setConfirmCloseOpen(false);
		onClose();
	};

	const handleAddProduct = () => {
		if (!selectedProduct) return;
		setItems((prev) => [
			...prev,
			{
				id: 0,
				productId: selectedProduct.productId,
				productName: selectedProduct.productName,
				quantity: 1,
				unitPrice: selectedProduct.unitPrice ?? 0,
				discount: selectedProduct.discount ?? 0,
			},
		]);
		setSelectedProduct(null);
	};

	const updateItem = <K extends keyof TemplateItem>(
		idx: number,
		field: K,
		value: TemplateItem[K],
	) => {
		setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
	};
	const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

	const suppliers = Array.isArray(partnersStore.allSuppliers) ? partnersStore.allSuppliers : [];

	const isSaveDisabled = !name.trim() || !type || partnerId === 0 || items.length === 0;

	const handleSave = async () => {
		setSaving(true);
		onSave({ name, partnerId, type, items });
		setSaving(false);
		doClose();
	};

	const calculateTotal = (item: TemplateItem): number => {
		if (item.discount && item.discount > 0) {
			return item.unitPrice * item.quantity - item.discount;
		}

		return item.unitPrice * item.quantity;
	};

	const totalDue = useMemo(
		() => items.reduce((sum, item) => sum + calculateTotal(item), 0),
		[items],
	);

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={() => (saving ? undefined : attemptClose())}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle sx={{ pr: 6 }}>
					{translate(template ? "editTemplateTitle" : "createTemplateTitle")}
					<IconButton onClick={attemptClose} sx={{ position: "absolute", top: 8, right: 8 }}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				{saving && <LinearProgress />}

				<DialogContent
					dividers
					sx={{
						display: "flex",
						flexDirection: "column",
						height: CONTENT_HEIGHT,
						gap: 2,
						p: 2,
					}}
				>
					<Grid container spacing={2} mb={2} alignItems="center">
						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								margin="dense"
								label={translate("templateFieldName")}
								value={name}
								onChange={(e) => setName(e.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 4 }}>
							<TextField
								margin="dense"
								select
								label={translate("templateFieldType")}
								value={type}
								onChange={(e) => setType(e.target.value as TemplateType)}
								fullWidth
								slotProps={{ select: { native: true } }}
							>
								{TEMPLATE_TYPES.map((t) => (
									<option key={t} value={t}>
										{translate(`templateType.${t}`)}
									</option>
								))}
							</TextField>
						</Grid>
						<Grid size={{ xs: 12, sm: 4 }}>
							<PartnerAutocomplete
								value={suppliers.find((p) => p.id === partnerId) || null}
								onChange={(s) => setPartnerId(s?.id ?? 0)}
							/>
						</Grid>
					</Grid>

					<Grid container spacing={2} mb={2} alignItems="center">
						<Grid size={{ xs: 12, sm: 8 }}>
							<ProductAutocomplete
								value={null}
								type={type}
								onChange={(p) =>
									p
										? setSelectedProduct({
												id: 0,
												productId: p.id,
												productName: p.name,
												quantity: 1,
												unitPrice: p.salePrice,
											})
										: setSelectedProduct(null)
								}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 4 }}>
							<Button
								variant="contained"
								fullWidth
								onClick={handleAddProduct}
								disabled={!selectedProduct}
								sx={{ height: 56 }}
							>
								{translate("add")}
							</Button>
						</Grid>
					</Grid>

					<Box sx={{ flex: 1, overflowY: "auto" }}>
						{items.map((item, idx) => (
							<Box
								key={`${item.id}-${idx}`}
								display="grid"
								gridTemplateColumns="2fr 1fr 1fr 1fr auto"
								gap={2}
								alignItems="center"
								mb={1}
							>
								<TextField
									label={translate("template.itemProduct")}
									value={item.productName}
									margin="dense"
									fullWidth
									slotProps={{
										input: {
											readOnly: true,
										},
									}}
								/>
								<TextField
									label={translate("template.itemQuantity")}
									type="number"
									value={item.quantity}
									margin="dense"
									fullWidth
									onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
								/>
								<TextField
									label={translate("template.itemUnitPrice")}
									type="number"
									value={item.unitPrice}
									margin="dense"
									fullWidth
									onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))}
								/>
								<TextField
									label={translate("template.itemDiscount")}
									type="number"
									value={item.discount ?? 0}
									margin="dense"
									fullWidth
									onChange={(e) => updateItem(idx, "discount", Number(e.target.value))}
								/>
								<IconButton size="medium" onClick={() => removeItem(idx)}>
									<DeleteIcon fontSize="medium" color="error" />
								</IconButton>
							</Box>
						))}
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
						{translate("template.totalDue")}: {formatNumberWithCommas(totalDue)}
					</Typography>

					<Box>
						<Button onClick={attemptClose}>{translate("cancel")}</Button>
						<Button
							variant="contained"
							disabled={isSaveDisabled}
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
