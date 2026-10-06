import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { readyOr } from "helpers/Loading";
import { Product } from "models/product";
import { Template } from "models/template";
import { useStore } from "stores/StoreContext";

import { CartItem, UseTransactionEntry } from "./useTransactionEntry";

export interface UsePosTemplates {
	/** The picked partner's templates of this direction. */
	partnerTemplates: Template[];
	/** Analytics: a template was loaded into this entry. */
	fromTemplate: boolean;
	load: (template: Template) => void;
	/** Explains (toast) why the cart can't be saved yet; true when it can. */
	canSave: () => boolean;
	save: (name: string) => Promise<void>;
	saving: boolean;
}

/**
 * Templates on the New Sale / Supply page: load one of the partner's templates
 * into the cart, or save the cart as a template. Templates are partner-specific
 * (mvp-plan §12).
 */
export function usePosTemplates(
	entry: UseTransactionEntry,
	products: Product[],
	onLoaded: () => void,
): UsePosTemplates {
	const { t } = useTranslation();
	const { templateStore, notificationStore } = useStore();
	const { direction, partner } = entry;
	const [fromTemplate, setFromTemplate] = useState(false);
	const allTemplates = readyOr(templateStore.allTemplates, []);

	const partnerTemplates = useMemo(
		() =>
			partner
				? allTemplates.filter((tpl) => tpl.partnerId === partner.id && tpl.type === direction)
				: [],
		[allTemplates, partner, direction],
	);

	const load = (tpl: Template) => {
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
		onLoaded();
		setFromTemplate(true);
		notificationStore.success(t("transaction.new.template.loaded", { name: tpl.name }));
	};

	const canSave = (): boolean => {
		if (!partner) {
			notificationStore.error(t(`transaction.new.tpl.partnerRequired.${direction}`));
			return false;
		}
		if (entry.items.length === 0) {
			notificationStore.error(t("transaction.new.tpl.linesRequired"));
			return false;
		}
		return true;
	};

	const save = async (name: string) => {
		if (!partner) {
			return;
		}
		await templateStore.create({
			name,
			partnerId: partner.id,
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
	};

	return {
		partnerTemplates,
		fromTemplate,
		load,
		canSave,
		save,
		saving: templateStore.isSaving,
	};
}
