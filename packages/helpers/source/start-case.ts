import { compoundWords } from "./compound-words";
import { upperFirst } from "./upper-first";

export const startCase = (value: string): string | undefined =>
	compoundWords(
		value,
		(result: string, word: string, index: number) => result + (index ? " " : "") + upperFirst(word),
	);
