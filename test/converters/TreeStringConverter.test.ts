import { expect } from "chai";
import { describe, it } from "mocha";

import { tree_to_string } from "../../src/converters/TreeStringConverter";
import { to_tree } from "../../src/converters/IntegerTreeConverter";
import { list_to_tree } from "../../src/converters/NumberListConverter";
import parseTree, { BinaryTree } from "../../src/parsers/TreeParser";

describe('TreeStringConverter', function () {
	function tree(left: BinaryTree, right: BinaryTree) {
		return { left, right }
	}
	const ONE = tree(null, null);

	describe(`#treeToString(null)`, function () {
		it('should produce nil', function () {
			expect(tree_to_string(null)).to.eql('nil');
		});
	});

	describe(`#treeToString(<n.n>)`, function () {
		it('should produce <n.n>', function () {
			expect(tree_to_string(ONE)).to.eql('<nil.nil>');
		});
	});

	describe(`#treeToString(<<n.n>.<n.n>>)`, function () {
		it('should produce <<n.n>.<n.n>>', function () {
			expect(tree_to_string(tree(ONE, ONE))).to.eql('<<nil.nil>.<nil.nil>>');
		});
	});

	describe(`Parser tests`, function () {
		describe(`#treeToString(7)`, function () {
			it('should produce the tree of `7`', function () {
				const expected: BinaryTree = to_tree(7);
				expect(
					parseTree(tree_to_string(expected))
				).to.eql(expected);
			});
		});

		describe(`#treeToString([4,5])`, function () {
			it('should produce the tree of `[4,5]`', function () {
				const expected: BinaryTree = list_to_tree([4,5])
				expect(
					parseTree(tree_to_string(expected))
				).to.eql(expected);
			});
		});
	});
});
