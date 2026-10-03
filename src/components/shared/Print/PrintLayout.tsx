import React from "react";
import { useTranslation } from "react-i18next";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { Box, GlobalStyles } from "@mui/material";

import { PRINT_PAGE_MARGIN, printSheetSx } from "./printStyles";

interface PrintLayoutProps {
	/** Screen title of the print view («Накладная на продажу №12»). */
	title: string;
	/** Where back returns on a direct load (the document's own detail page). */
	backTo: string;
	/** Screen-only controls left of «Печать» — e.g. the statement period. */
	toolbar?: React.ReactNode;
	/** The document itself, drawn on the A4 sheet. */
	children: React.ReactNode;
}

/**
 * Frame of every printable document: a screen toolbar (back, title, «Печать»,
 * the «Сохранить как PDF» hint) above an A4 sheet preview. Output is the
 * browser's own print dialog — on paper only the sheet remains (the app chrome
 * hides itself under `@media print`, see AppLayout) with A4 page margins.
 */
export const PrintLayout: React.FC<PrintLayoutProps> = ({ title, backTo, toolbar, children }) => {
	const { t } = useTranslation();

	return (
		<Box>
			<GlobalStyles
				styles={(theme) => ({
					"@page": { size: "A4", margin: PRINT_PAGE_MARGIN },
					"@media print": { body: { backgroundColor: theme.palette.common.white } },
				})}
			/>

			<Box sx={{ displayPrint: "none" }}>
				<DetailPageHeader
					backTo={backTo}
					title={title}
					meta={t("print.pdfHint")}
					primaryAction={
						<>
							{toolbar}
							<PrimaryButton icon={<PrintOutlinedIcon />} onClick={() => window.print()}>
								{t("print.action")}
							</PrimaryButton>
						</>
					}
				/>
			</Box>

			<Box sx={{ overflowX: "auto", pb: 3, "@media print": { overflow: "visible", pb: 0 } }}>
				<Box component="article" sx={printSheetSx}>
					{children}
				</Box>
			</Box>
		</Box>
	);
};

export default PrintLayout;
