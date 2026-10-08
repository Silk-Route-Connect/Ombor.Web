import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import GhostButton from "components/shared/Buttons/GhostButton";
import { readyOr } from "helpers/Loading";
import { usePosShortcuts } from "hooks/transactions/usePosShortcuts";
import { usePosTemplates } from "hooks/transactions/usePosTemplates";
import { useTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { observer } from "mobx-react-lite";
import { SettlementInput } from "models/payment";
import { Product } from "models/product";
import { PATHS, saleDetailPath, supplyDetailPath } from "routing/paths";
import { analytics } from "services/telemetry";
import { useStore } from "stores/StoreContext";
import { formatCurrency } from "utils/formatCurrency";
import { TransactionDirection } from "utils/transactionUtils";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box, Button } from "@mui/material";

import KeyboardHints from "./KeyboardHints";
import NewTransactionDialogs, { PosDialog } from "./NewTransactionDialogs";
import PosNotes from "./PosNotes";
import PosPageHeader from "./PosPageHeader";
import PosProductCreate from "./PosProductCreate";
import { posColumnSx, posGridSx } from "./posStyles";
import ProductSearchBar from "./ProductSearchBar";
import TransactionCart from "./TransactionCart";
import TransactionPartyCard from "./TransactionPartyCard";
import TransactionSummaryCard from "./TransactionSummaryCard";

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
	const [dialog, setDialog] = useState<PosDialog>("none");
	const [bulkApplied, setBulkApplied] = useState(0);
	/** Product id whose just-added line should grab + select its quantity field. */
	const [focusQtyId, setFocusQtyId] = useState<number | null>(null);
	/** What was typed in the search when «Создать товар» opened the product form. */
	const [creatingProduct, setCreatingProduct] = useState<string | null>(null);
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

	const products = readyOr(isSale ? productStore.saleProducts : productStore.supplyProducts, []);
	const partners = readyOr(isSale ? partnerStore.customers : partnerStore.suppliers, []);
	const warehouses = readyOr(warehouseStore.activeWarehouses, []);
	const wallets = readyOr(walletStore.activeWallets, []);
	const templates = usePosTemplates(entry, products, () => setBulkApplied(0));

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

	// Add the product, then mark its line so it grabs + selects its quantity field.
	const handleAddProduct = (product: Product) => {
		entry.addProduct(product);
		setFocusQtyId(product.id);
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
				from_template: templates.fromTemplate,
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

	const confirmSettlement = (settlements: SettlementInput[]) => {
		entry.setSettleAlloc(settlements);
		setDialog("none");
		const distributed = settlements.reduce((s, a) => s + a.amount, 0);
		// Nothing is saved yet — the split rides along with the sale / supply.
		notificationStore.info(
			t(`transaction.new.settled.${direction}`, { amount: formatCurrency(distributed) }),
		);
	};

	// Keyboard-first POS: focus the product search on first load.
	useEffect(() => {
		if (!didFocusSearch.current && products.length > 0) {
			searchRef.current?.focus();
			didFocusSearch.current = true;
		}
	}, [products.length]);

	usePosShortcuts({ submit, leave: tryLeave, dialogOpen: dialog !== "none" });

	return (
		<Box>
			<PosPageHeader
				title={t(`transaction.new.title.${direction}`)}
				onBack={tryLeave}
				actions={
					<>
						<Button
							variant="text"
							startIcon={<LayersOutlinedIcon />}
							onClick={() => templates.canSave() && setDialog("saveTemplate")}
						>
							{t("transaction.new.saveAsTemplate")}
						</Button>
						<GhostButton onClick={tryLeave}>{t("transaction.new.cancel")}</GhostButton>
					</>
				}
			/>

			<Box sx={posGridSx}>
				<Box sx={posColumnSx}>
					<TransactionPartyCard entry={entry} partners={partners} warehouses={warehouses} />

					<ProductSearchBar
						direction={direction}
						products={products}
						catalogue={readyOr(productStore.allProducts, [])}
						warehouseId={entry.warehouseId}
						inCart={entry.inCart}
						inputRef={searchRef}
						onAdd={handleAddProduct}
						onScan={entry.addProduct}
						onCreateProduct={setCreatingProduct}
					/>
					<PosProductCreate
						typed={creatingProduct}
						onClose={() => setCreatingProduct(null)}
						onCreated={(product) => {
							setCreatingProduct(null);
							// A product of the other trade type can't join this cart.
							if (product.type === "All" || product.type === direction) {
								handleAddProduct(product);
							}
						}}
					/>

					<KeyboardHints direction={direction} />

					<TransactionCart
						entry={entry}
						templates={templates.partnerTemplates}
						onLoadTemplate={templates.load}
						bulkApplied={bulkApplied}
						onBulkApplied={setBulkApplied}
						focusQtyId={focusQtyId}
						onQtyFocused={() => setFocusQtyId(null)}
						onContinue={() => searchRef.current?.focus()}
					/>

					<PosNotes
						direction={direction}
						notes={entry.notes}
						onNotesChange={entry.setNotes}
						attachments={entry.attachments}
						onAddFiles={entry.addFiles}
						onRemoveFile={entry.removeFile}
					/>
				</Box>

				<TransactionSummaryCard
					entry={entry}
					wallets={wallets}
					overWallet={overWallet}
					onOpenSettle={() => setDialog("settle")}
					onSubmit={submit}
				/>
			</Box>

			<NewTransactionDialogs
				dialog={dialog}
				entry={entry}
				walletName={tenderWallet?.name ?? ""}
				templateSaving={templates.saving}
				onClose={() => setDialog("none")}
				onLeave={() => {
					setDialog("none");
					navigate(listPath);
				}}
				onSubmitUnpaid={() => void runSubmit()}
				onSettle={confirmSettlement}
				onSaveTemplate={(name) => void templates.save(name).then(() => setDialog("none"))}
			/>
		</Box>
	);
});

export default NewTransactionEntry;
