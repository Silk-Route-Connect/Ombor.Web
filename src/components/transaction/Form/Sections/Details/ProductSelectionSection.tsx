import React, { useMemo, useState } from "react";
import { Box, Grid, Stack } from "@mui/material";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { LinesTableHandle } from "./LinesTable";
import ProductTable, { ProductTableHandle } from "./ProductTable";

interface Props {
	form: TransactionFormType;
	mode: "Sale" | "Supply";
	productTableRef: React.RefObject<ProductTableHandle | null>;
	linesRef: React.RefObject<LinesTableHandle | null>;
}

const useDebounced = (value: string, delay = 300) => {
	const [debounced, setDebounced] = useState(value);
	React.useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);
	return debounced;
};

const ProductSelectionSection: React.FC<Props> = observer(
	({ form, mode, linesRef, productTableRef }) => {
		const { productStore } = useStore();
		const [search, setSearch] = useState("");
		const debounced = useDebounced(search);

		const source = mode === "Sale" ? productStore.saleProducts : productStore.supplyProducts;

		const filtered = useMemo(() => {
			const term = debounced.trim().toLowerCase();
			if (source === "loading") return [];

			return source.filter(
				(p) => !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term),
			);
		}, [debounced, source]);

		return (
			<Stack spacing={2} sx={{ height: "100%", minHeight: 0, alignContent: "flex-end" }}>
				<Grid size={{ xs: 12, md: 6 }}>
					<SearchInput
						value={search}
						onChange={setSearch}
						placeholder={translate("product.searchTitle")}
					/>
				</Grid>

				<Box sx={{ flexGrow: 1, minHeight: 0 }}>
					<ProductTable
						ref={productTableRef}
						mode={mode}
						rows={filtered}
						selectedId={form.selectedProduct?.id ?? null}
						onSelect={form.setSelectedProduct}
						onAdd={(p) => {
							form.addLine(p);
							requestAnimationFrame(() => linesRef.current?.focusQuantity(p.id));
						}}
						onSearchChange={setSearch}
					/>
				</Box>
			</Stack>
		);
	},
);

export default ProductSelectionSection;
