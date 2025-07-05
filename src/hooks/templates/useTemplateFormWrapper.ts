import { Template } from "models/template";
import { useStore } from "stores/StoreContext";

import { useTemplateForm } from "./useTemplateForm";

export function useTemplateFormWrapper(initial?: Template | null) {
	const { productStore, partnerStore } = useStore();

	return useTemplateForm({ initial, productStore, partnerStore });
}
