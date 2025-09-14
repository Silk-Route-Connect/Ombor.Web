import React from "react";
import { translate } from "i18n/i18n";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Tooltip } from "@mui/material";

export interface ProductFormImageTileProps {
	src: string;
	alt: string;
	selected: boolean;
	disabled?: boolean;
	onMakeMain?: () => void;
	onRemove?: () => void;
}

const ProductFormImageTile: React.FC<ProductFormImageTileProps> = ({
	src,
	alt,
	selected,
	disabled,
	onMakeMain,
	onRemove,
}) => {
	return (
		<Box
			sx={{
				position: "relative",
				width: 96,
				height: 96,
				borderRadius: 1,
				cursor: disabled ? "default" : "pointer",
				border: (theme) =>
					`2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
				outline: (theme) =>
					`4px solid ${selected ? theme.palette.primary.light : theme.palette.background.paper}`,
				outlineOffset: "-6px",
				overflow: "hidden",
			}}
			onClick={() => !disabled && onMakeMain?.()}
			role="image"
			tabIndex={0}
			onKeyDown={(e) => {
				if (!disabled && (e.key === "Enter" || e.key === " ")) {
					onMakeMain?.();
					e.preventDefault();
				}
			}}
			aria-pressed={selected}
			aria-label={translate("product.images.makeMain")}
		>
			{onRemove && (
				<Tooltip title={translate("product.images.remove")}>
					<IconButton
						size="small"
						sx={{
							position: "absolute",
							top: 6,
							right: 6,
							bgcolor: "background.paper",
							boxShadow: 1,
							"&:hover": { bgcolor: "background.paper" },
							zIndex: 1,
						}}
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						disabled={disabled}
						aria-label={translate("product.images.remove")}
					>
						<CloseIcon fontSize="small" color="error" />
					</IconButton>
				</Tooltip>
			)}

			<Box
				component="img"
				src={src}
				alt={alt}
				sx={{ width: "100%", height: "100%", objectFit: "cover" }}
			/>
		</Box>
	);
};

export default ProductFormImageTile;
