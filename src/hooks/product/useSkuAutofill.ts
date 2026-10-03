import { useEffect, useRef } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { ProductFormInputs } from "schemas/ProductSchema";

const randomDigits = (): string => String(Math.floor(1000 + Math.random() * 9000));

/**
 * SKU in the DEC-12 format: the initials of each word of the name (native script,
 * upper-cased) + 4 digits — «Молоко Пастеризованное» → «МП-1234»; «SKU-1234»
 * while the name is empty.
 */
export const buildSku = (name: string | undefined, digits: string): string => {
	const initials = (name ?? "")
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => word.charAt(0).toUpperCase())
		.join("");
	return `${initials || "SKU"}-${digits}`;
};

interface UseSkuAutofillResult {
	/** «Сгенерировать»: fresh digits for the current name (also on edit). */
	regenerate: () => void;
}

/**
 * Keeps the SKU filled from the name while creating a product, so a shop owner
 * never has to invent an «Артикул». The digits are drawn once per open (the code
 * doesn't flicker while typing); once the user types their own SKU the autofill
 * stops touching it.
 */
export function useSkuAutofill(
	form: UseFormReturn<ProductFormInputs>,
	isOpen: boolean,
	isCreate: boolean,
): UseSkuAutofillResult {
	const { control, getValues, setValue } = form;
	const digits = useRef(randomDigits());
	const lastAuto = useRef<string | null>(null);
	const name = useWatch({ control, name: "name" });

	useEffect(() => {
		if (isOpen) {
			digits.current = randomDigits();
			lastAuto.current = null;
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || !isCreate) {
			return;
		}
		const current = getValues("sku") ?? "";
		if (current !== "" && current !== lastAuto.current) {
			return;
		}
		const next = name?.trim() ? buildSku(name, digits.current) : "";
		if (next !== current) {
			lastAuto.current = next;
			setValue("sku", next, { shouldDirty: next !== "" });
		}
	}, [name, isOpen, isCreate, getValues, setValue]);

	const regenerate = () => {
		digits.current = randomDigits();
		const next = buildSku(getValues("name"), digits.current);
		lastAuto.current = next;
		setValue("sku", next, { shouldDirty: true, shouldValidate: true });
	};

	return { regenerate };
}
