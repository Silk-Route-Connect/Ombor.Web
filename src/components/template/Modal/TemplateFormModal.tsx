import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { TemplateFormPayload, useTemplateForm } from "hooks/templates/useTemplateForm";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { Template, TemplateType } from "models/template";
import { useStore } from "stores/StoreContext";
import { chipTokens, designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import {
	alpha,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	InputAdornment,
	LinearProgress,
	Typography,
	useTheme,
} from "@mui/material";

interface TemplateFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	template: Template | null;
	onClose: () => void;
	onSave: (payload: TemplateFormPayload) => void;
}

const toNumberOrZero = (raw: string): number => {
	const value = raw.trim();
	return value === "" ? 0 : Number(value);
};

/** Type → chipTokens key + the standard Sale/Supply icons (locked chip semantics). */
const TYPE_TOKEN: Record<TemplateType, keyof typeof chipTokens> = {
	Sale: "sale",
	Supply: "supply",
};

const TYPE_ICON: Record<TemplateType, React.ReactNode> = {
	Sale: <SellOutlinedIcon sx={{ fontSize: 16 }} />,
	Supply: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />,
};

/**
 * Sale/Supply toggle at the md control height (38px) so it lines up with the
 * neighbouring inputs; the selected state carries the locked chip hues
 * (Sale = teal, Supply = saffron — brand hues, not money green/red).
 */
const TypeToggle: React.FC<{
	value: TemplateType;
	disabled: boolean;
	onChange: (type: TemplateType) => void;
}> = ({ value, disabled, onChange }) => {
	const { t } = useTranslation();

	return (
		<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
			{(Object.keys(TYPE_TOKEN) as TemplateType[]).map((type) => {
				const tk = chipTokens[TYPE_TOKEN[type]];
				const selected = value === type;
				return (
					<Box
						key={type}
						role="button"
						aria-pressed={selected}
						onClick={() => !disabled && onChange(type)}
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							height: 38,
							px: "12px",
							borderRadius: "8px",
							cursor: disabled ? "default" : "pointer",
							border: "1.5px solid",
							borderColor: selected ? tk.color : designTokens.gray300,
							bgcolor: selected ? tk.bg : "background.paper",
							color: selected ? tk.color : designTokens.gray600,
							transition: "border-color .14s, background-color .14s, color .14s",
							"&:hover": { borderColor: selected ? tk.color : designTokens.gray400 },
						}}
					>
						{TYPE_ICON[type]}
						<Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "inherit" }}>
							{t(`template.type.${type}`)}
						</Typography>
					</Box>
				);
			})}
		</Box>
	);
};

/** Compact qty stepper (− input +) per the bundle's `.stepper`. */
const QtyStepper: React.FC<{
	value: number;
	disabled: boolean;
	onChange: (qty: number) => void;
}> = ({ value, disabled, onChange }) => {
	const btnSx = {
		minWidth: 30,
		width: 30,
		height: 36,
		p: 0,
		fontSize: 18,
		lineHeight: 1,
		color: "text.secondary",
		borderRadius: 0,
	} as const;

	return (
		<Box
			sx={{
				display: "inline-flex",
				alignItems: "center",
				border: "1px solid",
				borderColor: designTokens.gray300,
				borderRadius: "8px",
				overflow: "hidden",
				bgcolor: "background.paper",
			}}
		>
			<Button sx={btnSx} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}>
				−
			</Button>
			<Box
				component="input"
				value={value}
				disabled={disabled}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					const n = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
					onChange(Number.isNaN(n) || n < 1 ? 1 : n);
				}}
				sx={{
					width: 44,
					height: 36,
					border: "none",
					outline: "none",
					textAlign: "center",
					font: "inherit",
					fontWeight: 600,
					...numericSx,
					borderLeft: "1px solid",
					borderRight: "1px solid",
					borderColor: designTokens.gray200,
					bgcolor: "transparent",
				}}
			/>
			<Button sx={btnSx} disabled={disabled} onClick={() => onChange(value + 1)}>
				+
			</Button>
		</Box>
	);
};

/**
 * Create / edit a template — a partner-tied basket of priced products (mvp-plan
 * §12). Centred modal (locked pattern 3). The submit button is never disabled
 * (hard rule 5 / pattern 7): validation runs on submit and reports inline.
 * Switching the type re-prices every line to the matching live price.
 */
const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
	isOpen,
	isSaving,
	template,
	onClose,
	onSave,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const { partnerStore, productStore } = useStore();
	const isEdit = Boolean(template);

	// The submit button is never disabled (hard rule 5), so `canSave` is unused here.
	const {
		form,
		totalDue,
		templateType,
		setTemplateType,
		items,
		addProduct,
		updateItem,
		removeItem,
		submit,
	} = useTemplateForm({ isOpen, isSaving, template, onSave, onClose });
	const { control, formState, watch, setValue } = form;
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);

	const partnerId = watch("partnerId");
	const watchedItems = watch("items");

	const activeProducts: Product[] = useMemo(
		() =>
			productStore.allProducts === "loading"
				? []
				: productStore.allProducts.filter((p) => !p.isArchived),
		[productStore.allProducts],
	);

	const allPartners: Partner[] =
		partnerStore.allPartners === "loading" ? [] : partnerStore.allPartners;
	const partnerValue = allPartners.find((p) => p.id === partnerId) ?? null;

	const pickedIds = (watchedItems ?? []).map((l) => l.productId);
	const productOptions = activeProducts.filter((p) => !pickedIds.includes(p.id));

	useEffect(() => {
		if (isOpen) {
			productStore.getAll();
			partnerStore.getAll();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty,
		isSaving,
		onClose,
	);

	const linesErr = Boolean(formState.errors.items);

	const priceLabel =
		templateType === "Sale" ? t("template.form.salePrices") : t("template.form.supplyPrices");

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				onKeyDown={onKeyDown}
				slotProps={{ paper: { sx: { width: 760, maxWidth: "94%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={isEdit ? t("template.title.edit") : t("template.title.create")}
					subtitle={t("template.form.subtitle")}
					disabled={isSaving}
					onClose={requestClose}
				/>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							gap: "18px",
							mb: "18px",
						}}
					>
						<Box>
							<FormFieldLabel label={t("template.field.name")} required />
							<Controller
								name="name"
								control={control}
								render={({ field, fieldState }) => (
									<Box
										component="input"
										{...field}
										disabled={isSaving}
										placeholder={t("template.form.namePlaceholder")}
										sx={{
											mt: "7px",
											width: "100%",
											height: 38,
											px: "13px",
											font: "inherit",
											fontSize: 14,
											borderRadius: "8px",
											border: "1px solid",
											borderColor: fieldState.error ? "error.main" : designTokens.gray300,
											outline: "none",
											bgcolor: "background.paper",
											"&:focus": {
												borderColor: "primary.main",
												boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
											},
										}}
									/>
								)}
							/>
						</Box>
						<Box>
							<FormFieldLabel label={t("template.field.partner")} required />
							<Box sx={{ mt: "7px" }}>
								<PartnerAutocomplete
									type="Both"
									size="small"
									value={partnerValue}
									onChange={(p) =>
										setValue("partnerId", p?.id ?? 0, { shouldDirty: true, shouldValidate: true })
									}
								/>
							</Box>
						</Box>
					</Box>

					<Box sx={{ mb: "18px" }}>
						<FormFieldLabel label={t("template.field.type")} />
						<Box sx={{ mt: "7px" }}>
							<TypeToggle value={templateType} disabled={isSaving} onChange={setTemplateType} />
						</Box>
					</Box>

					<FormFieldLabel label={t("template.field.lines")} required />
					<Box sx={{ mt: "8px", mb: "12px" }}>
						<EntityAutocomplete<Product>
							label=""
							placeholder={t("template.form.productPlaceholder")}
							size="small"
							options={productOptions}
							value={null}
							disabled={isSaving}
							additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
							onChange={(p) => p && addProduct(p)}
						/>
					</Box>

					<Box
						sx={{
							border: "1px solid",
							borderColor: linesErr ? designTokens.errorBorder : "divider",
							borderRadius: "12px",
							overflow: "hidden",
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								p: "12px 16px",
								bgcolor: designTokens.gray25,
								borderBottom: "1px solid",
								borderColor: "divider",
							}}
						>
							<Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
								{t("template.form.itemsTitle")}{" "}
								<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
									· {items.length}
								</Box>
							</Typography>
							{items.length > 0 && (
								<Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
									{t("template.form.total")}:{" "}
									<Box component="b" sx={{ ...numericSx, color: "text.primary", fontWeight: 700 }}>
										{formatCurrency(totalDue)}
									</Box>{" "}
									UZS
								</Typography>
							)}
						</Box>

						{items.length === 0 ? (
							<Box sx={{ p: "28px 18px", textAlign: "center" }}>
								<Box
									sx={{
										width: 46,
										height: 46,
										borderRadius: "50%",
										mx: "auto",
										mb: "12px",
										display: "grid",
										placeItems: "center",
										bgcolor: designTokens.gray100,
										color: designTokens.gray500,
									}}
								>
									<Inventory2OutlinedIcon sx={{ fontSize: 22 }} />
								</Box>
								<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
									{t("template.form.emptyTitle")}
								</Typography>
								<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
									{t("template.form.emptyBody")}
								</Typography>
								{linesErr && (
									<Typography sx={{ fontSize: 12.5, color: "error.main", mt: "8px" }}>
										{t("template.validation.itemsRequired")}
									</Typography>
								)}
							</Box>
						) : (
							items.map((field, index) => {
								const line = watchedItems?.[index];
								const qty = line?.quantity ?? 1;
								const price = line?.unitPrice ?? 0;
								const product = activeProducts.find((p) => p.id === line?.productId);
								const unit = product ? MEASUREMENT_SHORT[product.measurement] : "";

								return (
									<Box
										key={field.productId}
										sx={{
											display: "grid",
											gridTemplateColumns: "1fr auto auto auto",
											gap: "16px",
											alignItems: "end",
											p: "13px 16px",
											borderBottom: "1px solid",
											borderColor: "divider",
											"&:last-of-type": { borderBottom: "none" },
										}}
									>
										<Box sx={{ minWidth: 0 }}>
											<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
												{field.productName}
											</Typography>
											<Typography
												sx={{ ...numericSx, fontSize: 12, color: "text.disabled", mt: "2px" }}
											>
												{product?.sku ?? ""} · {formatCurrency(qty * price)} UZS
											</Typography>
										</Box>

										<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
											<Typography
												sx={{
													fontSize: 10.5,
													fontWeight: 600,
													letterSpacing: ".04em",
													textTransform: "uppercase",
													color: "text.disabled",
												}}
											>
												{t("template.form.qtyLabel")}
											</Typography>
											<QtyStepper
												value={qty}
												disabled={isSaving}
												onChange={(q) => updateItem(index, { quantity: q })}
											/>
										</Box>

										<Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
											<Typography
												sx={{
													fontSize: 10.5,
													fontWeight: 600,
													letterSpacing: ".04em",
													textTransform: "uppercase",
													color: "text.disabled",
												}}
											>
												{t("template.form.priceLabel")}
											</Typography>
											<NumericField
												value={price || ""}
												size="small"
												min={0}
												disabled={isSaving}
												onChange={(e) =>
													updateItem(index, { unitPrice: toNumberOrZero(e.target.value) })
												}
												sx={{ width: 140 }}
												slotProps={{
													input: {
														endAdornment: <InputAdornment position="end">UZS</InputAdornment>,
														sx: { ...numericSx, fontWeight: 600 },
													},
												}}
											/>
										</Box>

										<IconButton
											onClick={() => removeItem(index)}
											aria-label={t("common.delete")}
											sx={{
												width: 36,
												height: 36,
												color: designTokens.gray500,
												"&:hover": { bgcolor: designTokens.errorBg, color: "error.main" },
											}}
										>
											<DeleteOutlineIcon sx={{ fontSize: 18 }} />
										</IconButton>
									</Box>
								);
							})
						)}
					</Box>

					<Box
						sx={{
							display: "flex",
							alignItems: "flex-start",
							gap: "9px",
							mt: "16px",
							p: "11px 14px",
							bgcolor: designTokens.primarySoft,
							borderRadius: "8px",
						}}
					>
						<InfoOutlinedIcon
							sx={{ fontSize: 16, color: "primary.main", mt: "1px", flex: "0 0 auto" }}
						/>
						<Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.55 }}>
							{t("template.form.noteBefore")}{" "}
							<Box component="b" sx={{ color: "text.primary", fontWeight: 600 }}>
								{t("template.form.noteBold")}
							</Box>{" "}
							{t("template.form.noteAfter", { prices: priceLabel })}
						</Typography>
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						px: "24px",
						py: "14px",
						gap: "10px",
						borderTop: "1px solid",
						borderColor: "divider",
						bgcolor: designTokens.gray25,
					}}
				>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
						{t("template.form.positionsCount")}{" "}
						<Box component="b" sx={numericSx}>
							{items.length}
						</Box>
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton icon={<CheckIcon />} onClick={submit}>
						{isEdit ? t("common.save") : t("template.form.submit")}
					</PrimaryButton>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				isOpen={discardOpen}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("common.dialog.discardChanges.title")}
				content={t("common.dialog.discardChanges.body")}
				confirmLabel={t("common.dialog.discardChanges.confirm")}
				cancelLabel={t("common.dialog.discardChanges.cancel")}
				confirmVariant="danger"
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default observer(TemplateFormModal);
