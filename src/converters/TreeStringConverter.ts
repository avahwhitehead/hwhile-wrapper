import { BinaryTree } from "../parsers/TreeParser";

/**
 * Convert a {@link BinaryTree} to its string representation.
 * @param tree	The tree to convert
 * @returns	The string form of the tree
 */
export function tree_to_string(tree : BinaryTree) : string {
	if (!tree) return 'nil';
	return `<${tree_to_string(tree.left)}.${tree_to_string(tree.right)}>`;
}
