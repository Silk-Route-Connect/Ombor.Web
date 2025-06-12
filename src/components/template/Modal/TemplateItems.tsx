import React, { useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	Box,
	Button,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { translate } from "i18n/i18n";
import { TemplateItem } from "models/template";
import { useStore } from "stores/StoreContext";

type LocalItem = TemplateItem & { localId: string };

// generate incremental local IDs
const useLocalId = () => {
	const counter = useRef(1);
	return () => String(counter.current++);
};

interface Props {
	items: TemplateItem[];
	onChange: (items: TemplateItem[]) => void;
}

const TemplateItemsField: React.FC<Props> = ({ items, onChange }) => {
	const generateLocalId = useLocalId();
	const { productStore } = useStore();

	const [localItems, setLocalItems] = useState<LocalItem[]>([]);

	useEffect(() => {
		setLocalItems(
			items.map((it) => ({
				...it,
				localId: generateLocalId(),
			})),
		);
	}, [items, generateLocalId]);

	useEffect(() => {
		onChange(localItems.map(({ ...rest }) => rest));
	}, [localItems, onChange]);

	useEffect(() => {
		productStore.loadProducts();
	}, [productStore]);

	const products = Array.isArray(productStore.allProducts) ? productStore.allProducts : [];

	const handleAdd = () => {
		const newItem: LocalItem = {
			localId: generateLocalId(),
			id: 0,
			productId: 0,
			productName: "",
			quantity: 0,
			unitPrice: 0,
			discount: 0,
		};
		setLocalItems((prev) => [...prev, newItem]);
	};

	const handleRemove = (localId: string) => {
		setLocalItems((prev) => prev.filter((it) => it.localId !== localId));
	};

	const handleUpdate = <K extends keyof TemplateItem>(
		localId: string,
		field: K,
		value: TemplateItem[K],
	): void => {
		setLocalItems((prev) =>
			prev.map((it) =>
				it.localId === localId
					? ({
							...it,
							[field]: value,
						} as LocalItem)
					: it,
			),
		);
	};

	return (
		<Box>
			<Box mb={1} display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="subtitle1">{translate("items")}</Typography>
				<Button startIcon={<AddIcon />} onClick={handleAdd} disabled={!products.length}>
					{translate("addItem")}
				</Button>
			</Box>

			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>{translate("product")}</TableCell>
						<TableCell>{translate("quantity")}</TableCell>
						<TableCell>{translate("unitPrice")}</TableCell>
						<TableCell>{translate("discount")}</TableCell>
						<TableCell />
					</TableRow>
				</TableHead>

				<TableBody>
					{localItems.map((item, idx) => (
						<TableRow key={`${item.localId}-${idx}`}>
							<TableCell>
								<Autocomplete
									options={products}
									getOptionLabel={(opt) => opt.name}
									value={products.find((p) => p.id === item.productId) || null}
									onChange={(_, opt) => {
										handleUpdate(item.localId, "productId", opt?.id ?? 0);
										handleUpdate(item.localId, "productName", opt?.name ?? "");
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label={translate("product")}
											margin="dense"
											fullWidth
											slotProps={{ input: { autoComplete: "off" } }}
										/>
									)}
								/>
							</TableCell>

							<TableCell>
								<TextField
									type="number"
									label={translate("quantity")}
									value={item.quantity}
									onChange={(e) => handleUpdate(item.localId, "quantity", Number(e.target.value))}
									margin="dense"
									fullWidth
								/>
							</TableCell>

							<TableCell>
								<TextField
									type="number"
									label={translate("unitPrice")}
									value={item.unitPrice}
									onChange={(e) => handleUpdate(item.localId, "unitPrice", Number(e.target.value))}
									margin="dense"
									fullWidth
								/>
							</TableCell>

							<TableCell>
								<TextField
									type="number"
									label={translate("discount")}
									value={item.discount}
									onChange={(e) => handleUpdate(item.localId, "discount", Number(e.target.value))}
									margin="dense"
									fullWidth
								/>
							</TableCell>

							<TableCell>
								<IconButton size="small" onClick={() => handleRemove(item.localId)}>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Box>
	);
};

export default TemplateItemsField;
