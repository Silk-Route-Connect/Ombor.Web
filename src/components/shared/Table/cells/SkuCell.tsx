import React from "react";
import { figuresSx } from "theme";

import { CopyableCell } from "../CopyableCell";
import NoValue from "./NoValue";

/** SKU (артикул) cell: click-to-copy, 13/500 secondary, tabular, one line. */
export const SkuCell: React.FC<{ sku: string | null | undefined }> = ({ sku }) =>
	sku ? (
		<CopyableCell
			value={sku}
			sx={{
				...figuresSx,
				fontSize: 13,
				fontWeight: 500,
				color: "text.secondary",
				whiteSpace: "nowrap",
			}}
		>
			{sku}
		</CopyableCell>
	) : (
		<NoValue />
	);

export default SkuCell;
