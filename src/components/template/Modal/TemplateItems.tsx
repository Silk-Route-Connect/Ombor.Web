import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TemplateItem } from "models/template";
import { useStore } from "stores/StoreContext";

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
	const { t } = useTranslation();
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
		productStore.getAll();
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
				<Typography variant="subtitle1">{t("items")}</Typography>
				<Button startIcon={<AddIcon />} onClick={handleAdd} disabled={!products.length}>
					{t("addItem")}
				</Button>
			</Box>

			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>{t("product")}</TableCell>
						<TableCell>{t("quantity")}</TableCell>
						<TableCell>{t("unitPrice")}</TableCell>
						<TableCell>{t("discount")}</TableCell>
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
											label={t("product")}
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
									label={t("quantity")}
									value={item.quantity}
									onChange={(e) => handleUpdate(item.localId, "quantity", Number(e.target.value))}
									margin="dense"
									fullWidth
								/>
							</TableCell>

							<TableCell>
								<TextField
									type="number"
									label={t("unitPrice")}
									value={item.unitPrice}
									onChange={(e) => handleUpdate(item.localId, "unitPrice", Number(e.target.value))}
									margin="dense"
									fullWidth
								/>
							</TableCell>

							<TableCell>
								<TextField
									type="number"
									label={t("discount")}
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
