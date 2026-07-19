import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PaymentSettlementModal from "components/payment/Form/PaymentSettlementModal";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import GhostButton from "components/shared/Buttons/GhostButton";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import CartLineRow from "components/transaction/Create/CartLineRow";
import KeyboardHints from "components/transaction/Create/KeyboardHints";
import PartnerPicker from "components/transaction/Create/PartnerPicker";
import ProductSearchBar from "components/transaction/Create/ProductSearchBar";
import SaveTemplateModal from "components/transaction/Create/SaveTemplateModal";
import TemplateLoadMenu from "components/transaction/Create/TemplateLoadMenu";
import TransactionSummaryCard from "components/transaction/Create/TransactionSummaryCard";
import WarehousePicker from "components/transaction/Create/WarehousePicker";
import { CartItem, useTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { observer } from "mobx-react-lite";
import { SettlementInput } from "models/payment";
import { Product } from "models/product";
import { Template } from "models/template";
import { PATHS, saleDetailPath, supplyDetailPath } from "routing/paths";
import { analytics } from "services/telemetry";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { TransactionDirection } from "utils/transactionUtils";

import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, ButtonBase, InputBase, Typography } from "@mui/material";

const loaded = <T,>(value: T[] | "loading"): T[] => (value === "loading" ? [] : value);

type DialogKind = "none" | "unsaved" | "noPay" | "settle" | "saveTemplate";

interface NewTransactionEntryProps {
	direction: TransactionDirection;
}

/**
 * Redesigned full-page POS transaction entry (mvp-plan §8), shared by New Sale
 * (`/sales/new`) and New Supply (`/supplies/new`). Partner/supplier + warehouse
 * selectors, the product-search cart with per-line + bulk discount (Sale also
 * hard-blocks over-stock), running totals, an inline single-wallet payment with
 * overpayment settlement (settle other open transactions → change → advance,
 * rule 40), notes + attachments, the immutability note, the unsaved-changes
 * guard, templates load/save, and the keyboard-first entry loop. The `direction`
 * selects pricing, partner pool, balance sign and all copy.
 */
export const NewTransactionEntry: React.FC<NewTransactionEntryProps> = observer(({ direction }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const isSale = direction === "Sale";
	const {
		productStore,
		partnerStore,
		warehouseStore,
		walletStore,
		templateStore,
		transactionStore,
		notificationStore,
	} = useStore();

	const entry = useTransactionEntry(direction);
	const [dialog, setDialog] = useState<DialogKind>("none");
	const [notesOpen, setNotesOpen] = useState(false);
	const [bulkPct, setBulkPct] = useState("");
	const [bulkApplied, setBulkApplied] = useState(0);
	/** Product id whose just-added line should grab + select its quantity field. */
	const [focusQtyId, setFocusQtyId] = useState<number | null>(null);
	/** Analytics: a template was loaded into this entry (see sale/supply_created). */
	const [fromTemplate, setFromTemplate] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const didFocusSearch = useRef(false);

	const listPath = isSale ? PATHS.sales : PATHS.supplies;
	const detailPath = isSale ? saleDetailPath : supplyDetailPath;

	useEffect(() => {
		void productStore.getAll();
		void partnerStore.getAll();
		void warehouseStore.getAll();
		void walletStore.getAll();
		void templateStore.getAll();
	}, [productStore, partnerStore, warehouseStore, walletStore, templateStore]);

	const products = loaded(isSale ? productStore.saleProducts : productStore.supplyProducts);
	const partners = loaded(isSale ? partnerStore.customers : partnerStore.suppliers);
	const warehouses = loaded(warehouseStore.filteredWarehouses);
	const wallets = loaded(walletStore.filteredWallets);
	const allTemplates = loaded(templateStore.allTemplates);

	// Hard-block a Supply tender that exceeds the paying wallet's balance. A Sale
	// is money-in and its change is self-covered, so only Supply outflows are guarded.
	// Available clamps at zero: an overdrawn wallet blocks any positive tender, but a
	// zero tender (credit supply) is not an outflow and must pass (DR-25).
	const tenderWallet = wallets.find((w) => w.id === entry.pay.walletId);
	const overWallet =
		!isSale && tenderWallet != null && entry.paid > Math.max(0, tenderWallet.balance);

	// Seed the warehouse + wallet defaults once their lists arrive.
	useEffect(() => {
		if (entry.warehouseId == null && warehouses.length > 0) {
			entry.setWarehouseId(warehouses[0].id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [warehouses.length]);
	useEffect(() => {
		if (entry.pay.walletId == null && wallets.length > 0) {
			entry.setPay({ ...entry.pay, walletId: wallets[0].id });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [wallets.length]);

	const partnerTemplates = useMemo(
		() =>
			entry.partner
				? allTemplates.filter(
						(tpl) => tpl.partnerId === entry.partner!.id && tpl.type === direction,
					)
				: [],
		[allTemplates, entry.partner, direction],
	);

	const walletName = wallets.find((w) => w.id === entry.pay.walletId)?.name ?? "";

	/* ── actions ── */
	const applyBulk = () => {
		const pct = parseInt(bulkPct.replace(/[^\d]/g, ""), 10) || 0;
		entry.applyBulk(pct);
		setBulkApplied(pct);
	};

	// Add the product, then mark its line so it grabs + selects its quantity field.
	const handleAddProduct = (product: Product) => {
		entry.addProduct(product);
		setFocusQtyId(product.id);
	};

	const loadTemplate = (tpl: Template) => {
		const items: CartItem[] = tpl.items.flatMap((item) => {
			const product = products.find((p) => p.id === item.productId);
			if (!product) {
				return [];
			}
			const cartItem: CartItem = {
				product,
				quantity: item.quantity,
				unitPrice: item.unitPrice,
				discountValue: item.discount ?? 0,
				// Preserve the template's real discount kind (was hard-coded to
				// "Percentage", which dropped Fixed discounts on load).
				discountType: item.discountType ?? "Percentage",
				// Restore package-entry mode when the item was saved in packages (F21);
				// CartLineQty only honours it when the product still has packaging.
				inPackages: Boolean(item.packageSize),
			};
			return [cartItem];
		});
		entry.loadItems(items);
		setBulkApplied(0);
		setFromTemplate(true);
		notificationStore.success(t("transaction.new.template.loaded", { name: tpl.name }));
	};

	const runSubmit = async () => {
		setDialog("none");
		const created = await transactionStore.createTransactionEntry(entry.buildPayload());
		if (created) {
			analytics.capture(isSale ? "sale_created" : "supply_created", {
				line_count: entry.count,
				subtotal: entry.subtotal,
				discount_total: entry.discTotal,
				total: entry.total,
				from_template: fromTemplate,
				has_attachments: entry.attachments.length > 0,
				payment_kind: entry.payState,
				has_settlement: entry.settledSum > 0,
				overpayment_disposition:
					entry.payState === "over" ? (entry.useAdvance ? "advance" : "change") : undefined,
			});
			navigate(detailPath(created.id));
		}
	};

	const submit = () => {
		entry.setTried(true);
		if (!entry.valid || overWallet) {
			const failed = [
				!entry.partner ? "partner" : null,
				entry.items.length === 0 ? "items" : null,
				entry.hasStockError ? "stock" : null,
				overWallet ? "wallet" : null,
			].filter((f): f is string => f !== null);
			analytics.capture("form_validation_failed", {
				form: isSale ? "new_sale" : "new_supply",
				field_count: failed.length,
				first_field: failed[0],
			});
			return;
		}
		if (entry.paid === 0) {
			setDialog("noPay");
			return;
		}
		void runSubmit();
	};

	const tryLeave = () => {
		if (entry.dirty) {
			setDialog("unsaved");
		} else {
			navigate(listPath);
		}
	};

	const openSaveTemplate = () => {
		if (!entry.partner) {
			notificationStore.error(t(`transaction.new.tpl.partnerRequired.${direction}`));
			return;
		}
		if (entry.items.length === 0) {
			notificationStore.error(t("transaction.new.tpl.linesRequired"));
			return;
		}
		setDialog("saveTemplate");
	};

	const saveTemplate = async (name: string) => {
		if (!entry.partner) {
			return;
		}
		await templateStore.create({
			name,
			partnerId: entry.partner.id,
			type: direction,
			items: entry.items.map((it) => {
				const packSize = it.product.packaging?.size;
				const packageQuantity =
					it.inPackages && packSize && packSize > 0
						? Math.round(it.quantity / packSize)
						: undefined;
				return {
					productId: it.product.id,
					quantity: it.quantity,
					unitPrice: it.unitPrice,
					discount: it.discountValue,
					discountType: it.discountType,
					packageQuantity,
				};
			}),
		});
		setDialog("none");
	};

	const confirmSettlement = (settlements: SettlementInput[]) => {
		entry.setSettleAlloc(settlements);
		setDialog("none");
		const distributed = settlements.reduce((s, a) => s + a.amount, 0);
		notificationStore.success(
			t("transaction.new.settled", { amount: formatCurrency(distributed) }),
		);
	};

	// Latest-value refs so the single window listener stays stable ([] deps).
	const submitRef = useRef(submit);
	submitRef.current = submit;
	const leaveRef = useRef(tryLeave);
	leaveRef.current = tryLeave;
	const dialogRef = useRef(dialog);
	dialogRef.current = dialog;

	// Keyboard-first POS: focus the product search on first load.
	useEffect(() => {
		if (!didFocusSearch.current && products.length > 0) {
			searchRef.current?.focus();
			didFocusSearch.current = true;
		}
	}, [products.length]);

	// Page-level shortcuts: ⌘/Ctrl+Enter submit · Esc leave · Alt+P/Alt+W focus pickers.
	useEffect(() => {
		const focus = (selector: string) =>
			(document.querySelector(selector) as HTMLElement | null)?.focus();
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				submitRef.current();
			} else if (e.key === "Escape") {
				// Let an open dropdown / dialog consume Esc first.
				if (dialogRef.current !== "none" || document.querySelector('[role="listbox"]')) {
					return;
				}
				e.preventDefault();
				leaveRef.current();
			} else if (e.altKey && e.code === "KeyP") {
				e.preventDefault();
				focus('[data-ns="partner"] input');
			} else if (e.altKey && e.code === "KeyW") {
				e.preventDefault();
				focus('[data-ns="warehouse"] [role="combobox"]');
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const triedNoPartner = entry.tried && !entry.partner;
	const triedNoItems = entry.tried && entry.items.length === 0;

	return (
		<Box>
			{/* header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "16px",
					mb: "18px",
					flexWrap: "wrap",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
					<ButtonBase
						onClick={tryLeave}
						sx={{
							width: 38,
							height: 38,
							borderRadius: "8px",
							border: "1px solid",
							borderColor: designTokens.gray300,
							bgcolor: "background.paper",
							color: designTokens.gray600,
							"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
						}}
					>
						<ChevronLeftIcon sx={{ fontSize: 20 }} />
					</ButtonBase>
					<Typography
						component="h1"
						sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}
					>
						{t(`transaction.new.title.${direction}`)}
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
					<Button
						variant="text"
						startIcon={<LayersOutlinedIcon sx={{ fontSize: "18px !important" }} />}
						onClick={openSaveTemplate}
					>
						{t("transaction.new.saveAsTemplate")}
					</Button>
					<GhostButton onClick={tryLeave}>{t("transaction.new.cancel")}</GhostButton>
				</Box>
			</Box>

			{/* POS grid */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
					alignItems: "start",
					gap: "18px",
				}}
			>
				{/* LEFT */}
				<Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
					{/* selectors */}
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "1.4fr 1fr" },
							gap: "14px",
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "12px",
							boxShadow: 1,
							p: "16px 18px",
						}}
					>
						<Box
							data-ns="partner"
							sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}
						>
							<FieldLabel required>{t(`transaction.new.partner.label.${direction}`)}</FieldLabel>
							<PartnerPicker
								direction={direction}
								partner={entry.partner}
								partners={partners}
								error={triedNoPartner}
								onPick={entry.setPartner}
							/>
							{triedNoPartner && (
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: "5px",
										fontSize: 12,
										color: "error.main",
										fontWeight: 600,
									}}
								>
									<ErrorOutlineIcon sx={{ fontSize: 12 }} />
									{t(`transaction.new.partner.required.${direction}`)}
								</Box>
							)}
						</Box>
						<Box
							data-ns="warehouse"
							sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}
						>
							<FieldLabel required>{t(`transaction.new.warehouse.label.${direction}`)}</FieldLabel>
							<WarehousePicker
								value={entry.warehouseId}
								warehouses={warehouses}
								onChange={entry.setWarehouseId}
							/>
						</Box>
					</Box>

					{/* product search */}
					<ProductSearchBar
						direction={direction}
						products={products}
						warehouseId={entry.warehouseId}
						inCart={entry.inCart}
						inputRef={searchRef}
						onAdd={handleAddProduct}
					/>

					<KeyboardHints direction={direction} />

					{/* cart */}
					<Box
						sx={{
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "12px",
							boxShadow: 1,
							overflow: "hidden",
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								p: "14px 18px",
								borderBottom: entry.items.length > 0 ? "1px solid" : "none",
								borderColor: "divider",
							}}
						>
							<Typography sx={{ fontSize: 15, fontWeight: 700 }}>
								{t("transaction.new.cart.title")}{" "}
								<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
									· {entry.count}
								</Box>
							</Typography>
							{entry.items.length > 0 ? (
								<Button
									variant="text"
									onClick={() => {
										entry.clearItems();
										setBulkApplied(0);
									}}
									sx={{ fontSize: 13 }}
								>
									{t("transaction.new.cart.clear")}
								</Button>
							) : (
								entry.partner && (
									<TemplateLoadMenu
										direction={direction}
										templates={partnerTemplates}
										onLoad={loadTemplate}
									/>
								)
							)}
						</Box>

						{entry.items.length === 0 ? (
							<Box sx={{ p: "40px 24px", textAlign: "center" }}>
								<Box
									sx={{
										width: 46,
										height: 46,
										borderRadius: "50%",
										display: "grid",
										placeItems: "center",
										mx: "auto",
										mb: "12px",
										bgcolor: triedNoItems ? designTokens.errorBg : designTokens.primarySoft,
										color: triedNoItems ? "error.main" : "primary.main",
									}}
								>
									{triedNoItems ? <ErrorOutlineIcon /> : <SearchIcon />}
								</Box>
								<Typography
									sx={{
										fontSize: 14,
										fontWeight: 600,
										color: triedNoItems ? "error.main" : "text.primary",
									}}
								>
									{triedNoItems
										? t("transaction.new.cart.emptyErrorTitle")
										: t("transaction.new.cart.emptyTitle")}
								</Typography>
								<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "4px" }}>
									{t("transaction.new.cart.emptyBody")}
								</Typography>
							</Box>
						) : (
							<>
								{entry.items.map((item, index) => (
									<CartLineRow
										key={item.product.id}
										direction={direction}
										item={item}
										warehouseId={entry.warehouseId}
										lineTotal={entry.lineTotal(item)}
										lineDiscount={entry.lineDiscount(item)}
										autoFocusQty={focusQtyId === item.product.id}
										onChange={(patch) => entry.updateItem(index, patch)}
										onRemove={() => entry.removeItem(index)}
										onAutoFocused={() => setFocusQtyId(null)}
										onContinue={() => searchRef.current?.focus()}
									/>
								))}
								<ButtonBase
									onClick={() => searchRef.current?.focus()}
									sx={{
										width: "100%",
										justifyContent: "flex-start",
										gap: "7px",
										p: "12px 18px",
										borderTop: "1px solid",
										borderColor: "divider",
										fontSize: 13.5,
										fontWeight: 600,
										color: "primary.main",
										"&:hover": { bgcolor: designTokens.primarySoft },
									}}
								>
									<AddIcon sx={{ fontSize: 16 }} />
									{t("transaction.new.cart.addProduct")}
								</ButtonBase>

								{/* bulk discount */}
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: "12px",
										p: "12px 18px",
										borderTop: "1px dashed",
										borderColor: "divider",
										bgcolor: designTokens.gray25,
										flexWrap: "wrap",
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
											fontSize: 13,
											fontWeight: 600,
											color: designTokens.gray700,
										}}
									>
										<LocalOfferOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
										{t("transaction.new.bulk.label")}
									</Box>
									<Box sx={{ flex: 1 }} />
									{bulkApplied > 0 && (
										<Box sx={{ fontSize: 12, color: "success.main", fontWeight: 600 }}>
											{t("transaction.new.bulk.applied", { pct: bulkApplied })}
										</Box>
									)}
									<Box
										sx={{
											display: "inline-flex",
											alignItems: "center",
											height: 36,
											border: "1px solid",
											borderColor: designTokens.gray300,
											borderRadius: "6px",
											px: "10px",
											gap: "6px",
											bgcolor: "background.paper",
										}}
									>
										<InputBase
											value={bulkPct}
											placeholder="0"
											onChange={(e) => setBulkPct(e.target.value.replace(/[^\d]/g, ""))}
											sx={{ width: 40, "& input": { textAlign: "right", p: 0, fontWeight: 600 } }}
										/>
										<Box component="span" sx={{ color: "text.disabled", fontSize: 13 }}>
											%
										</Box>
									</Box>
									<GhostButton onClick={applyBulk} sx={{ py: "6px", fontSize: 13 }}>
										{t("transaction.new.bulk.apply")}
									</GhostButton>
								</Box>
							</>
						)}
					</Box>

					{/* notes + attachments */}
					<Box>
						<ButtonBase
							onClick={() => setNotesOpen((o) => !o)}
							sx={{
								gap: "7px",
								fontSize: 13.5,
								fontWeight: 600,
								color: "primary.main",
								p: "4px 2px",
							}}
						>
							{notesOpen ? (
								<ExpandMoreIcon sx={{ fontSize: 16 }} />
							) : (
								<KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
							)}
							{t("transaction.new.notes.toggle")}
						</ButtonBase>
						{notesOpen && (
							<Box
								sx={{
									mt: "8px",
									p: "14px 16px",
									bgcolor: "background.paper",
									border: "1px solid",
									borderColor: "divider",
									borderRadius: "8px",
									boxShadow: 1,
									display: "flex",
									flexDirection: "column",
									gap: "12px",
								}}
							>
								<InputBase
									value={entry.notes}
									onChange={(e) => entry.setNotes(e.target.value)}
									placeholder={t(`transaction.new.notes.placeholder.${direction}`)}
									multiline
									minRows={3}
									sx={{
										border: "1px solid",
										borderColor: designTokens.gray300,
										borderRadius: "6px",
										p: "9px 11px",
										fontSize: 13.5,
										"&:focus-within": { borderColor: "primary.main" },
									}}
								/>
								<AttachmentPicker
									files={entry.attachments}
									onAdd={entry.addFiles}
									onRemove={entry.removeFile}
								/>
							</Box>
						)}
					</Box>
				</Box>

				{/* RIGHT */}
				<TransactionSummaryCard
					entry={entry}
					wallets={wallets}
					overWallet={overWallet}
					onOpenSettle={() => setDialog("settle")}
					onSubmit={submit}
				/>
			</Box>

			{/* dialogs */}
			<ConfirmDialog
				isOpen={dialog === "unsaved"}
				title={t("transaction.new.dialog.unsaved.title")}
				content={t(`transaction.new.dialog.unsaved.body.${direction}`)}
				icon={<ErrorOutlineIcon />}
				iconTone="warning"
				confirmVariant="warning"
				cancelLabel={t("transaction.new.dialog.unsaved.stay")}
				confirmLabel={t("transaction.new.dialog.unsaved.leave")}
				onCancel={() => setDialog("none")}
				onConfirm={() => {
					setDialog("none");
					navigate(listPath);
				}}
			/>

			<ConfirmDialog
				isOpen={dialog === "noPay"}
				title={t("transaction.new.dialog.noPay.title")}
				content={t(`transaction.new.dialog.noPay.body.${direction}`, {
					amount: formatCurrency(entry.total),
					partner: entry.partner?.name ?? "",
				})}
				icon={<ErrorOutlineIcon />}
				iconTone="info"
				confirmVariant="primary"
				cancelLabel={t("transaction.new.dialog.noPay.back")}
				confirmLabel={t("transaction.new.dialog.noPay.confirm")}
				onCancel={() => setDialog("none")}
				onConfirm={() => void runSubmit()}
			/>

			{dialog === "settle" && (
				<PaymentSettlementModal
					isOpen
					isSaving={false}
					partnerName={entry.partner?.name ?? ""}
					amount={entry.overExcess}
					walletName={walletName}
					direction={isSale ? "Income" : "Expense"}
					outstanding={entry.outstanding}
					onBack={() => setDialog("none")}
					onConfirm={confirmSettlement}
				/>
			)}

			<SaveTemplateModal
				isOpen={dialog === "saveTemplate"}
				isSaving={templateStore.isSaving}
				onClose={() => setDialog("none")}
				onSave={saveTemplate}
			/>
		</Box>
	);
});

const FieldLabel: React.FC<{ required?: boolean; children: React.ReactNode }> = ({
	required,
	children,
}) => (
	<Typography
		component="span"
		sx={{
			fontSize: 11.5,
			fontWeight: 700,
			letterSpacing: "0.03em",
			textTransform: "uppercase",
			color: "text.disabled",
			display: "flex",
			alignItems: "center",
			gap: "6px",
		}}
	>
		{children}
		{required && (
			<Box component="span" sx={{ color: "error.main" }}>
				*
			</Box>
		)}
	</Typography>
);

export default NewTransactionEntry;
