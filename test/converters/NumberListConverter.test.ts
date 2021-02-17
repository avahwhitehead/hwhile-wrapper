import { expect } from "chai";
import { describe, it } from "mocha";
import { list_to_tree, tree_to_list } from "../../src/converters/NumberListConverter";
import { BinaryTree } from "../../src/parsers/TreeParser";
import { to_tree } from "../../src/converters/IntegerTreeConverter";

describe('TreeListConverter', function () {
	function tree(left: BinaryTree, right: BinaryTree) {
		return { left, right };
	}
	const ONE = tree(null, null);

	describe('#tree_to_list()', function () {
		describe('n', function () {
			it('should produce an empty list', function () {
				expect(tree_to_list(null)).to.deep.equal([]);
			});
		});
		describe('<n.n>', function () {
			it('should produce the list [0]', function () {
				expect(tree_to_list(ONE)).to.deep.equal([0]);
			});
		});
		describe('<10.n>', function () {
			it('should produce the list [10]', function () {
				expect(tree_to_list(
					tree(to_tree(10), null)
				)).to.deep.equal([10]);
			});
		});
	});

	describe('#list_to_tree()', function () {
		describe('[]', function () {
			it('should produce `nil`', function () {
				expect(list_to_tree([])).to.deep.equal(null);
			});
		});
		describe('[0]', function () {
			it('should produce the tree <n.n>', function () {
				expect(list_to_tree([0])).to.deep.equal(ONE);
			});
		});
		describe('[10]', function () {
			it('should produce the list <10.n>', function () {
				expect(list_to_tree([10]))
					.to.deep.equal(tree(to_tree(10), null));
			});
		});
	});

	describe('Bidirectional tests', function () {
		describe('[]', function () {
			it('should produce the original array', function () {
				const original : number[] = [];
				expect(tree_to_list(list_to_tree(original))).to.deep.equal(original);
			});
		});
		describe('[0]', function () {
			it('should produce the original array', function () {
				const original : number[] = [0];
				expect(tree_to_list(list_to_tree(original))).to.deep.equal(original);
			});
		});
		describe('[0,1,...,5]', function () {
			it('should produce the original array', function () {
				const original : number[] = [];
				for (let i = 0; i <= 5; i++) {
					original.push(i);
				}
				expect(tree_to_list(list_to_tree(original))).to.deep.equal(original);
			});
		});
		describe('[10,9,...,0]', function () {
			it('should produce the original array', function () {
				const original : number[] = [];
				for (let i = 10; i >= 0; i--) {
					original.push(i);
				}
				expect(tree_to_list(list_to_tree(original))).to.deep.equal(original);
			});
		});
	});
});
