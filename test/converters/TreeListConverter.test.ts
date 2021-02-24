import { expect } from "chai";
import { describe, it } from "mocha";
import { BinaryTree, IntegerTreeConverter as IntegerConverter, TreeListConverter } from "../../src";

const tree_to_list = TreeListConverter.tree_to_list;
const list_to_tree = TreeListConverter.list_to_tree;

describe('TreeListConverter', function () {
	function tree(left: BinaryTree, right: BinaryTree) {
		return { left, right }
	}
	const ONE = tree(null, null);

	describe('#tree_to_list(...)', function () {
		describe('nil', function () {
			it('should produce []', function () {
				expect(tree_to_list(null)).to.deep.equal([]);
			});
		});

		describe('<n.n>', function () {
			it('should produce [n]', function () {
				expect(tree_to_list(ONE)).to.deep.equal([null]);
			});
		});

		describe('<n.<n.n>>', function () {
			it('should produce [n,n]', function () {
				expect(
					tree_to_list(tree(null, ONE))
				).to.deep.equal([null, null]);
			});
		});

		describe('<<n.n>.<n.n>>', function () {
			it('should produce [<n.n>, n]', function () {
				expect(
					tree_to_list(tree(ONE, ONE))
				).to.deep.equal([ONE, null]);
			});
		});
	});

	describe('#list_to_tree(...)', function () {
		describe('[]', function () {
			it('should produce nil', function () {
				expect(list_to_tree([])).to.be.null;
			});
		});

		describe('[n]', function () {
			it('should produce <n.n>', function () {
				expect(list_to_tree([null])).to.deep.equal(ONE);
			});
		});

		describe('[n,n]', function () {
			it('should produce <n.<n.n>>', function () {
				expect(
					list_to_tree([null, null])
				).to.deep.equal(tree(null, ONE));
			});
		});

		describe('<<n.n>.<n.n>>', function () {
			it('should produce [<n.n>, n]', function () {
				expect(
					list_to_tree([ONE, null])
				).to.deep.equal(tree(ONE, ONE));
			});
		});
	});

	describe('#Bidirectional tests', function () {
		describe('[0,1,...,5]', function () {
			it('', function () {
				const original : BinaryTree[] = [];
				for (let i = 0; i <= 5; i++) {
					original.push(IntegerConverter.to_tree(i));
				}
				expect(tree_to_list(list_to_tree(original))).to.deep.equal(original);
			});
		});
		describe('[10,9,...,0]', function () {
			it('', function () {
				const original : BinaryTree[] = [];
				for (let i = 10; i >= 0; i--) {
					original.push(IntegerConverter.to_tree(i));
				}
				expect(tree_to_list(list_to_tree(original))).to.deep.equal(original);
			});
		});
	});
});
