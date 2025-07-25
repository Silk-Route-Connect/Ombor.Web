import React from "react";
import { Typography } from "@mui/material";
import { Partner } from "models/partner";

export interface IPhoneNumbersListProps {
	partner: Partner;
}

const PhoneNumbersList: React.FC<IPhoneNumbersListProps> = ({ partner }) => {
	if (!partner.phoneNumbers || partner.phoneNumbers.length === 0) {
		return <Typography>——</Typography>;
	}

	return (
		<>
			{partner.phoneNumbers.map((phoneNumber, index) => (
				<Typography key={`${phoneNumber}-${index}`}>{phoneNumber}</Typography>
			))}
		</>
	);
};

export default PhoneNumbersList;
