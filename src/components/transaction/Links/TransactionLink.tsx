import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionType } from "models/transaction";
import { TRANSACTION_ROUTES } from "routing";

import { Link } from "@mui/material";

interface TransactionLinkProps {
	id: number;
	type: TransactionType;
}

const TransactionLink: React.FC<TransactionLinkProps> = ({ id, type }) => {
	const { t } = useTranslation();

	const path = `${TRANSACTION_ROUTES[type]}/${id}`;
	const typeLabel = t(`transaction.type.${type}`);

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
