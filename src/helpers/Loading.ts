export type Loadable<T> = T | "loading";

export function IsLoading<T>(...elements: Loadable<T>[]): boolean {
	return elements.some((el) => el === "loading");
}
