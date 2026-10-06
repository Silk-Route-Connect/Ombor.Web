import React from "react";
import { useTranslation } from "react-i18next";

import { Box, Typography } from "@mui/material";

import { PRINT_RULE_COLOR, printCaptionSx } from "./printStyles";

export interface PrintSignatureBlock {
	/** Stable key and caption: «Отпустил», «Получил», «От ООО …». */
	title: string;
	/** Who signs for — a party name under the caption. */
	name?: string;
}

const SignatureLine: React.FC<{ caption: string; grow: number }> = ({ caption, grow }) => (
	<Box sx={{ flex: grow, minWidth: 0 }}>
		<Box sx={{ height: 28, borderBottom: "1px solid", borderColor: PRINT_RULE_COLOR }} />
		<Typography sx={{ fontSize: 11, color: "text.secondary", textAlign: "center", mt: "2px" }}>
			{caption}
		</Typography>
	</Box>
);

/**
 * Signature area of a printed document: one block per side, each with a
 * signature line, a name line and the «М.П.» stamp place. Kept on one page.
 */
export const PrintSignatures: React.FC<{ blocks: PrintSignatureBlock[] }> = ({ blocks }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: `repeat(${blocks.length}, minmax(0, 1fr))`,
				gap: "32px",
				mt: "24px",
				breakInside: "avoid",
			}}
		>
			{blocks.map((block) => (
				<Box key={block.title} sx={{ minWidth: 0 }}>
					<Typography sx={printCaptionSx}>{block.title}</Typography>
					{block.name && (
						<Typography sx={{ fontSize: 13, fontWeight: 600, mt: "2px" }}>{block.name}</Typography>
					)}
					<Box sx={{ display: "flex", gap: "12px", mt: "4px" }}>
						<SignatureLine caption={t("print.signature.sign")} grow={2} />
						<SignatureLine caption={t("print.signature.fullName")} grow={3} />
					</Box>
					<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "10px" }}>
						{t("print.signature.stamp")}
					</Typography>
				</Box>
			))}
		</Box>
	);
};

export default PrintSignatures;
