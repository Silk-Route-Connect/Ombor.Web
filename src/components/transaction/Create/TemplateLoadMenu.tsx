import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Template } from "models/template";
import { TransactionDirection } from "utils/transactionUtils";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";

interface TemplateLoadMenuProps {
	direction: TransactionDirection;
	templates: Template[];
	onLoad: (template: Template) => void;
}

/**
 * «Загрузить шаблон» — loads one of the selected partner's saved templates of the
 * current direction into the cart. Templates are partner-specific (mvp-plan §12);
 * the parent only renders this when a partner is chosen.
 */
export const TemplateLoadMenu: React.FC<TemplateLoadMenuProps> = ({
	direction,
	templates,
	onLoad,
}) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	return (
		<>
			<Button
				variant="text"
				startIcon={<LayersOutlinedIcon sx={{ fontSize: "18px !important" }} />}
				onClick={(e) => setAnchor(e.currentTarget)}
				sx={{ fontSize: 13 }}
			>
				{t("transaction.new.template.load")}
			</Button>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				slotProps={{ paper: { sx: { width: 264 } } }}
			>
				{templates.length === 0 ? (
					<Box
						sx={{
							px: "16px",
							py: "14px",
							color: "text.disabled",
							fontSize: 13,
							textAlign: "center",
						}}
					>
						{t(`transaction.new.template.none.${direction}`)}
					</Box>
				) : (
					templates.map((tpl) => (
						<MenuItem
							key={tpl.id}
							onClick={() => {
								onLoad(tpl);
								setAnchor(null);
							}}
						>
							<ListItemIcon>
								<LayersOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
							</ListItemIcon>
							<ListItemText
								primary={tpl.name}
								secondary={
									<Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
										{t("transaction.new.template.count", { count: tpl.items.length })}
									</Typography>
								}
								slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}
							/>
						</MenuItem>
					))
				)}
			</Menu>
		</>
	);
};

export default TemplateLoadMenu;
