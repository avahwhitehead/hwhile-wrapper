import { BinaryTree } from "../parsers/TreeParser";

/**
 * Convert from a binary tree to a list of binary trees
 * @param tree	The tree to convert
 */
export function tree_to_list(tree: BinaryTree) : BinaryTree[] {
	let res : BinaryTree[] = [];
	while (tree) {
		res.push(tree.left);
		tree = tree.right;
	}
	return res;
}

/**
 * Convert from a list of binary trees to a single tree
 * @param list	The list of trees to convert
 */
export function list_to_tree(list: BinaryTree[]) : BinaryTree {
	let res : BinaryTree = null;
	for (let i = list.length - 1; i >= 0; i--) {
		res = {
			left: list[i],
			right: res
		};
	}
	return res;
}