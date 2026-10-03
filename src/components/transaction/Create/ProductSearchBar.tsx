import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { dropdownSlotProps } from "components/transaction/Create/dropdownSx";
import { stockAt } from "hooks/transactions/useTransactionEntry";
import { Product } from "models/product";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";
import { matchesSearch } from "utils/stringUtils";
import { TransactionDirection } from "utils/transactionUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";

interface ProductSearchBarProps {
	direction: TransactionDirection;
	products: Product[];
	warehouseId: number | null;
	inCart: Set<number>;
	inputRef?: React.Ref<HTMLInputElement>;
	onAdd: (product: Product) => void;
}

/** Sellable items first: out-of-stock products (at the picked warehouse) sink to the bottom. */
function inStockFirst(products: Product[], warehouseId: number | null): Product[] {
	const inStock = products.filter((p) => stockAt(p, warehouseId) > 0);
	const out = products.filter((p) => stockAt(p, warehouseId) <= 0);
	return [...inStock, ...out];
}

/**
 * POS product search. Picking a product adds it to the cart and keeps the panel
 * open for rapid multi-add. A Sale option shows the per-warehouse stock (out /
 * low / ok) and the sale price; a Supply option shows the supply (cost) price.
 */
export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
	direction,
	products,
	warehouseId,
	inCart,
	inputRef,
	onAdd,
}) => {
	const isSale = direction === "Sale";
	const { t } = useTranslation();
	const [inputValue, setInputValue] = useState("");

	const options = useMemo(() => {
		const available = products.filter((p) => !inCart.has(p.id));
		return isSale ? inStockFirst(available, warehouseId) : available;
	}, [products, inCart, isSale, warehouseId]);

	return (
		<Autocomplete
			options={options}
			value={null}
			inputValue={inputValue}
			onInputChange={(_, v, reason) => {
				if (reason !== "reset") {
					setInputValue(v);
				}
			}}
			onChange={(_, product) => {
				if (product) {
					onAdd(product);
					setInputValue("");
				}
			}}
			openOnFocus
			clearOnBlur
			slotProps={dropdownSlotProps}
			getOptionLabel={(p) => p.name}
			filterOptions={(opts, state) =>
				state.inputValue
					? opts.filter(
							(p) =>
								matchesSearch(p.name, state.inputValue) || matchesSearch(p.sku, state.inputValue),
						)
					: opts
			}
			noOptionsText={t("transaction.new.search.empty")}
			renderInput={(params) => (
				<TextField
					{...params}
					inputRef={inputRef}
					placeholder={t("transaction.new.search.placeholder")}
					slotProps={{
						input: {
							...params.InputProps,
							startAdornment: (
								<SearchIcon sx={{ fontSize: 20, color: "text.disabled", ml: "4px" }} />
							),
						},
					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							minHeight: 50,
							fontSize: 14.5,
							bgcolor: "background.paper",
						},
					}}
				/>
			)}
			renderOption={(props, p) => {
				const stock = stockAt(p, warehouseId);
				const out = stock === 0;
				const unit = measurementShort(t, p.measurement);
				return (
					<Box component="li" {...props} key={p.id} sx={{ gap: "12px" }}>
						<Box
							sx={{
								width: 32,
								height: 32,
								borderRadius: "8px",
								bgcolor: designTokens.gray100,
								color: designTokens.gray600,
								display: "grid",
								placeItems: "center",
								flex: "0 0 auto",
							}}
						>
							<Inventory2OutlinedIcon sx={{ fontSize: 17 }} />
						</Box>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>
								{p.name}
							</Typography>
							<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled" }} noWrap>
								{p.sku}
							</Typography>
						</Box>
						<Box sx={{ textAlign: "right", flex: "0 0 auto" }}>
							{isSale ? (
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 600,
										color: out ? "error.main" : stock < 15 ? "warning.main" : "success.main",
									}}
								>
									{out
										? t("transaction.new.search.outOfStock")
										: t("transaction.new.search.inStock", { count: stock, unit })}
								</Typography>
							) : (
								<Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.disabled" }}>
									{t("transaction.new.search.supplyPriceLabel")}
								</Typography>
							)}
							<Typography sx={{ ...numericSx, fontSize: 13, fontWeight: 600 }}>
								{t("transaction.new.search.price", {
									price: formatCurrency(isSale ? p.salePrice : p.supplyPrice),
								})}
							</Typography>
						</Box>
					</Box>
				);
			}}
		/>
	);
};

export default ProductSearchBar;
