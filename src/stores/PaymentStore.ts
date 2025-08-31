import { SortOrder } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import { Partner } from "models/partner";
import { CreatePaymentRequest, Payment, PaymentDirection } from "models/payment";
import PaymentApi from "services/api/PaymentApi";

import { NotificationStore } from "./NotificationStore";

export interface IPaymentStore {
	allPayments: Loadable<Payment[]>;
	incomes: Loadable<Payment[]>;
	expenses: Loadable<Payment[]>;
	filteredPayments: Loadable<Payment[]>;
	selectedPayment: Loadable<Payment> | null;
	isSaving: boolean;

	// client-side controls
	searchTerm: string;
	filterPartner: Partner | null;
	filterDirection: PaymentDirection | null;
	sortField: keyof Payment | null;
	sortOrder: SortOrder;

	// actions
	getAll(): Promise<void>;
	getById(paymentId: number): Promise<void>;
	create(request: CreatePaymentRequest): Promise<void>;

	// setters for filters & sorting
	setSearch(searchTerm: string): void;
	setFilterPartner(partner: Partner | null): void;
	setFilterDirection(direction: PaymentDirection | null): void;
	setSort(field: keyof Payment, order: SortOrder): void;
	setSelectedPayment(payment: Payment | null): void;
}

export class PaymentStore implements IPaymentStore {
	private readonly notificationStore: NotificationStore;

	allPayments: Loadable<Payment[]> = [];
	selectedPayment: Loadable<Payment> | null = null;
	isSaving: boolean = false;
	searchTerm: string = "";
	filterPartner: Partner | null = null;
	filterDirection: PaymentDirection | null = null;
	sortField: keyof Payment | null = null;
	sortOrder: SortOrder = "asc";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	get filteredPayments(): Loadable<Payment[]> {
		if (this.allPayments === "loading") {
			return "loading";
		}

		let payments = this.allPayments;

		const searchTerm = this.searchTerm.trim().toLowerCase();
		if (searchTerm) {
			payments = payments.filter(
				(el) =>
					el.notes?.toLocaleLowerCase().includes(searchTerm) ||
					el.partnerName?.toLocaleLowerCase().includes(searchTerm) ||
					el.id.toString() === searchTerm,
			);
		}

		const partnerId = this.filterPartner?.id;
		if (partnerId) {
			payments = payments.filter((el) => el.partnerId === partnerId);
		}

		if (this.filterDirection) {
			payments = payments.filter((el) => el.direction === this.filterDirection);
		}

		return payments;
	}

	get incomes(): Loadable<Payment[]> {
		if (this.filteredPayments === "loading") {
			return "loading";
		}

		return this.filteredPayments.filter((el) => el.direction === "Income");
	}

	get expenses(): Loadable<Payment[]> {
		if (this.filteredPayments === "loading") {
			return "loading";
		}

		return this.filteredPayments.filter((el) => el.direction === "Expense");
	}

	async getAll(): Promise<void> {
		if (this.allPayments === "loading") {
			return;
		}

		runInAction(() => (this.allPayments = "loading"));
		const result = await tryRun(() => PaymentApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("payments.error.getAll"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allPayments = data));
	}

	async getById(paymentId: number): Promise<void> {
		if (this.selectedPayment === "loading") {
			return;
		}

		runInAction(() => (this.selectedPayment = "loading"));
		const result = await tryRun(() => PaymentApi.getById(paymentId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("payments.error.getById"));
		}

		const data = result.status === "fail" ? null : result.data;
		runInAction(() => (this.selectedPayment = data));
	}

	async create(request: CreatePaymentRequest): Promise<void> {
		const result = await tryRun(() => PaymentApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("payments.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allPayments === "loading") {
				return;
			}

			this.allPayments = [result.data, ...this.allPayments];
			this.selectedPayment = result.data;
			this.notificationStore.success("payments.success.create");
		});
	}

	setSelectedPayment(payment: Payment | null): void {
		this.selectedPayment = payment;
	}

	setSearch(searchTerm: string): void {
		this.searchTerm = searchTerm;
	}

	setFilterPartner(partner: Partner | null): void {
		if (!partner) {
			this.filterPartner = null;
		} else {
			this.filterPartner = partner;
		}
	}

	setFilterDirection(direction: PaymentDirection | null): void {
		this.filterDirection = direction;
	}

	setSort(field: keyof Payment, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
	}
}
