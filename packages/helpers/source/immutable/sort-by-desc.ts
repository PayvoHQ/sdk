import { ISortBy, ISortByFunction } from "../fast-sort.js";

import { sortByDesc as baseSortByDesc } from "../sort-by-desc.js";

export const sortByDesc = <T>(
	values: T[],
	iteratees?: ISortByFunction<T> | keyof T | (ISortByFunction<T> | keyof T)[] | ISortBy<T>[] | undefined,
): T[] => baseSortByDesc([...values], iteratees);
