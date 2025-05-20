import { makeAutoObservable, runInAction } from "mobx";

import { Loadable } from "../helpers/helpers";
import { Sale } from "../models/sale";

export interface ISaleStore {
	allSales: Loadable<Sale[]>;
	filteredSales: Loadable<Sale[]>;

	loadSales(params: { productId: number; from: string; to: string }): Promise<void>;
}

export class SaleStore {
	allSales: Loadable<Sale[]> = [];

	constructor() {
		makeAutoObservable(this);
	}

	get filteredSales(): Loadable<Sale[]> {
		return this.allSales;
	}

	async loadSales({ productId, from, to }: { productId: number; from: string; to: string }) {
		console.log(from, to);
		this.allSales = "loading";

		await new Promise((res) => setTimeout(res, 500));

		const mock: Sale[] = [
			{
				id: 1,
				customerName: "Ivan Ivanov",
				customerId: 201,
				date: new Date("2025-05-10"),
				items: [
					{ id: 11, productId, quantity: 2, unitPrice: 5000 },
					{ id: 12, productId: 999, quantity: 1, unitPrice: 3000 },
				],
			},
			{
				id: 2,
				customerName: "Maria Petrova",
				customerId: 202,
				date: new Date("2025-05-12"),
				items: [{ id: 13, productId, quantity: 3, unitPrice: 3500 }],
			},
			{
				id: 3,
				customerName: "John Doe",
				customerId: 203,
				date: new Date("2025-05-15"),
				items: [
					{ id: 14, productId, quantity: 1, unitPrice: 15000 },
					{ id: 15, productId, quantity: 2, unitPrice: 8000 },
				],
			},
		];

		const filtered = mock.filter((sale) => sale.items.some((item) => item.productId === productId));

		runInAction(() => {
			this.allSales = filtered;
		});
	}
}

export default SaleStore;
