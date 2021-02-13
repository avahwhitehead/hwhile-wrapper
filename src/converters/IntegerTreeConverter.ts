import { BinaryTree } from "../parsers/TreeParser";

/**
 * Convert from a binary tree to an integer
 * @param tree	The tree to convert
 */
export function to_integer(tree: BinaryTree) : number {
	if (tree === null) return 0;
	return 1 + to_integer(tree.right);
}

/**
 * Convert from a binary tree to an integer
 * @param value	The number to convert
 */
export function to_tree(value: number) : BinaryTree {
	if (value < 0) throw new Error("Can't convert negative numbers to trees");
	if (value === 0) return null;
	return {
		left: null,
		right: to_tree(value - 1),
	};
}