import React, { useMemo } from "react";
import ProductFormModal from "components/product/Form/ProductFormModal";
import { observer } from "mobx-react-lite";
import { Product } from "models/product";
import { ProductFormInputs, ProductFormValues } from "schemas/ProductSchema";
import { useStore } from "stores/StoreContext";
import { ServerErrorHandler } from "utils/formServerErrors";
import { toProductRequest } from "utils/productUtils";

interface PosProductCreateProps {
	/** The search text the cashier typed, or null while the form is closed. */
	typed: string | null;
	onClose: () => void;
	/** The created product — the POS adds it to the cart it kept. */
	onCreated: (product: Product) => void;
}

/** A typed code of digits only is a scanned barcode, anything else a name. */
const BARCODE_LIKE = /^\d{6,}$/;

/**
 * «Создать товар» from the POS search when nothing matched: the regular product
 * form, started from what was typed (a scanned unknown code becomes the barcode,
 * text the name). The sale / supply in progress stays untouched underneath.
 */
const PosProductCreate: React.FC<PosProductCreateProps> = observer(
	({ typed, onClose, onCreated }) => {
		const { productStore } = useStore();

		const defaults = useMemo<Partial<ProductFormInputs>>(() => {
			const value = typed?.trim() ?? "";
			if (!value) {
				return {};
			}
			return BARCODE_LIKE.test(value) ? { barcode: value } : { name: value };
		}, [typed]);

		const handleSave = async (
			payload: ProductFormValues,
			_imagesToRemove: number[],
			applyServerErrors: ServerErrorHandler,
		): Promise<void> => {
			const created = await productStore.create(toProductRequest(payload), applyServerErrors);
			if (created) {
				onCreated(created);
			}
		};

		return (
			<ProductFormModal
				isOpen={typed !== null}
				isSaving={productStore.isSaving}
				product={null}
				defaults={defaults}
				onClose={onClose}
				onSave={(payload, images, applyServerErrors) =>
					void handleSave(payload, images, applyServerErrors)
				}
			/>
		);
	},
);

export default PosProductCreate;
