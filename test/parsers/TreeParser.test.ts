import { expect } from "chai";
import { describe, it } from "mocha";
import parseTree, { BinaryTree } from "../../src/parsers/TreeParser";

describe('TreeParser', function () {
	describe(`#parseTree('')`, function () {
		it('should produce an empty tree', function () {
			expect(parseTree('')).to.eql(null);
		});
	});

	describe(`#parseTree('nil')`, function () {
		it('should produce an empty tree', function () {
			expect(parseTree('nil')).to.eql(null);
		});
	});

	describe(`#parseTree('<nil.nil>')`, function () {
		it('should produce a tree with 2 empty leaves', function () {
			expect(parseTree('<nil.nil>')).to.eql({
				left: null,
				right: null,
			});
		});
	});

	describe(`#parseTree('<<nil.nil>.<nil.nil>>')`, function () {
		it('should produce a tree of trees', function () {
			expect(parseTree('<<nil.nil>.<nil.nil>>')).to.eql({
				left: {
					left: null,
					right: null,
				},
				right: {
					left: null,
					right: null,
				}
			});
		});
	});

	describe(`#parseTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>')`, function () {
		it('should produce a complex binary tree', function () {
			const expected: BinaryTree = {
				left: {
					left: {
						left: null,
						right: {
							left: null,
							right: null
						}
					},
					right: null
				},
				right: {
					left: null,
					right: {
						left: {
							left: null,
							right: null
						},
						right: null
					}
				}
			};
			const actual: BinaryTree | null = parseTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>');
			expect(actual).to.eql(expected);
		});
	});
});
