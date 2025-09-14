import React from "react";
import { translate } from "i18n/i18n";
import { TransactionType } from "models/transaction";
import { TRANSACTION_ROUTES } from "routing";

import { Link } from "@mui/material";

interface TransactionLinkProps {
	id: number;
	type: TransactionType;
}

const TransactionLink: React.FC<TransactionLinkProps> = ({ id, type }) => {
	const path = `${TRANSACTION_ROUTES[type]}/${id}`;
	const typeLabel = translate(`transaction.type.${type}`);

	return (
		<Link
			href={path}
			underline="none"
			sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}
		>
			{`${typeLabel} #${id}`}
		</Link>
	);
};

export default TransactionLink;
