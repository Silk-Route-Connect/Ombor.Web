import React, { useEffect, useMemo, useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import { Category } from "models/category";

export type CategoryFormPayload = {
	name: string;
	description?: string;
};

export interface IProps {
	isOpen: boolean;
	category?: Category | null;
	onClose: () => void;
	onSave: (payload: CategoryFormPayload) => void;
}

const CategoryFormModal: React.FC<IProps> = ({ isOpen, category, onClose, onSave }) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	useEffect(() => {
		if (isOpen) {
			setName(category?.name ?? "");
			setDescription(category?.description ?? "");
		}
	}, [isOpen, category]);

	const handleSave = () => {
		if (!name.trim()) {
			return;
		}
		onSave({ name, description });
	};

	const title = useMemo(() => (category ? "Изменить категорию" : "Создать категорию"), [category]);
	const saveLabel = useMemo(() => (category ? "Сохранить" : "Создать"), [category]);

	return (
		<Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>{title}</DialogTitle>
			<DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
				<TextField
					label="Название"
					value={name}
					onChange={(e) => setName(e.target.value)}
					fullWidth
					margin="dense"
				/>
				<TextField
					label="Описание"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					margin="dense"
					minRows={3}
					maxRows={6}
					fullWidth
					multiline
				/>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose}>Отмена</Button>
				<Button onClick={handleSave} variant="contained" color="primary" disabled={!name.trim()}>
					{saveLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CategoryFormModal;
