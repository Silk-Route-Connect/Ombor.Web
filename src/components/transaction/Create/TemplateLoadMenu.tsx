import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { menuItemSx, menuSlotProps } from "components/shared/ActionMenuCell/menuPaper";
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
				size="small"
				startIcon={<LayersOutlinedIcon />}
				onClick={(e) => setAnchor(e.currentTarget)}
			>
				{t("transaction.new.template.load")}
			</Button>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				slotProps={{
					...menuSlotProps,
					paper: { sx: { ...menuSlotProps.paper.sx, width: 264 } },
				}}
			>
				{templates.length === 0 ? (
					<Box
						sx={{
							px: "16px",
							py: "12px",
							color: "text.secondary",
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
							sx={menuItemSx}
							onClick={() => {
								onLoad(tpl);
								setAnchor(null);
							}}
						>
							<ListItemIcon sx={{ color: "primary.main" }}>
								<LayersOutlinedIcon fontSize="small" />
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
