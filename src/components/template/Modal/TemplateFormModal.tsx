import React, { useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { isReady, readyOr } from "helpers/Loading";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { TemplateFormPayload, useTemplateForm } from "hooks/templates/useTemplateForm";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { Product } from "models/product";
import { Template, TemplateType } from "models/template";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx, radius } from "theme";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import { Box, Stack, TextField, Typography } from "@mui/material";

import TemplateLineList from "./TemplateLineList";

interface TemplateFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	template: Template | null;
	onClose: () => void;
	onSave: (payload: TemplateFormPayload) => void;
}

/** Sale first, as on every Sale / Supply choice. */
const TYPE_ORDER: TemplateType[] = ["Sale", "Supply"];

/** The standard Sale / Supply glyphs (locked chip semantics). */
const TYPE_ICON: Record<TemplateType, React.ReactNode> = {
	Sale: <SellOutlinedIcon />,
	Supply: <LocalShippingOutlinedIcon />,
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
	const { partnerStore, productStore } = useStore();
	const isEdit = Boolean(template);

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
			!isReady(productStore.allProducts)
				? []
				: productStore.allProducts.filter((p) => !p.isArchived),
		[productStore.allProducts],
	);

	const allPartners: Partner[] = readyOr(partnerStore.allPartners, []);
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

	const priceLabel =
		templateType === "Sale" ? t("template.form.salePrices") : t("template.form.supplyPrices");

	return (
		<FormDialog
			open={isOpen}
			size="lg"
			title={isEdit ? t("template.title.edit") : t("template.title.create")}
			subtitle={t("template.form.subtitle")}
			tile={recordTile("Template")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					canSave={!isSaving}
					loading={isSaving}
					onCancel={requestClose}
					onSave={submit}
					submitLabel={isEdit ? undefined : t("template.form.submit")}
					summary={
						<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
							{t("template.form.positionsCount")}{" "}
							<Box component="b" sx={numericSx}>
								{items.length}
							</Box>
						</Typography>
					}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				<Box
					sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "16px" }}
				>
					<FormField label={t("template.field.name")} required>
						<Controller
							name="name"
							control={control}
							render={({ field: { ref, ...field }, fieldState }) => (
								<TextField
									{...field}
									// On the input, not the root, so an invalid submit focuses the name.
									inputRef={ref}
									size="small"
									fullWidth
									disabled={isSaving}
									placeholder={t("template.form.namePlaceholder")}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>
					</FormField>
					<FormField label={t("template.field.partner")} required>
						<PartnerAutocomplete
							type="Both"
							size="small"
							value={partnerValue}
							error={!!formState.errors.partnerId}
							helperText={formState.errors.partnerId?.message}
							onChange={(p) =>
								setValue("partnerId", p?.id ?? 0, { shouldDirty: true, shouldValidate: true })
							}
						/>
					</FormField>
				</Box>

				<FormField label={t("template.field.type")}>
					<SegmentedControl<TemplateType>
						variant="form"
						fullWidth
						value={templateType}
						disabled={isSaving}
						onChange={setTemplateType}
						options={TYPE_ORDER.map((type) => ({
							value: type,
							label: t(`template.type.${type}`),
							icon: TYPE_ICON[type],
						}))}
					/>
				</FormField>

				<FormField label={t("template.field.lines")} required>
					<EntityAutocomplete<Product>
						placeholder={t("template.form.productPlaceholder")}
						size="small"
						options={productOptions}
						value={null}
						disabled={isSaving}
						additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
						onChange={(p) => p && addProduct(p)}
					/>
				</FormField>

				<TemplateLineList
					items={items}
					values={watchedItems}
					products={activeProducts}
					total={totalDue}
					error={Boolean(formState.errors.items)}
					disabled={isSaving}
					onUpdate={updateItem}
					onRemove={removeItem}
				/>

				<Box
					sx={{
						display: "flex",
						alignItems: "flex-start",
						gap: "9px",
						p: "11px 14px",
						bgcolor: designTokens.primarySoft,
						borderRadius: `${radius.md}px`,
					}}
				>
					<InfoOutlinedIcon
						sx={{ fontSize: 16, color: "primary.main", mt: "1px", flex: "0 0 auto" }}
					/>
					<Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
						{t("template.form.noteBefore")}{" "}
						<Box component="b" sx={{ color: "text.primary", fontWeight: 600 }}>
							{t("template.form.noteBold")}
						</Box>{" "}
						{t("template.form.noteAfter", { prices: priceLabel })}
					</Typography>
				</Box>
			</Stack>
		</FormDialog>
	);
};

export default observer(TemplateFormModal);
