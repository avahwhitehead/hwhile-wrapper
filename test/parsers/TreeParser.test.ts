import { expect } from "chai";
import { describe, it } from "mocha";
import parseTree, { BinaryTree } from "../../src/parsers/TreeParser";

describe('TreeParser (valid)', function () {
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

describe('TreeParser (invalid syntax)', function () {
	//Unmatched brackets
	const test1_1 = '<';
	describe(`#parseTree('${test1_1}')`, function () {
		it('should detect an unmatched opening bracket', function () {
			expect(() => parseTree(test1_1)).to.throw(Error, /^unexpected end of statement/i);
		});
	});
	const test1_2 = '<nil.<nil.nil>';
	describe(`#parseTree('${test1_2}')`, function () {
		it('should detect an unmatched opening bracket', function () {
			expect(() => parseTree(test1_2)).to.throw(Error, /^unexpected end of statement/i);
		});
	});
	const test1_3 = '>';
	describe(`#parseTree('${test1_3}')`, function () {
		it('should detect an unmatched closing bracket', function () {
			expect(() => parseTree(test1_3)).to.throw(Error, /^unexpected token/i);
		});
	});
	const test1_4 = 'nil.nil';
	describe(`#parseTree('${test1_4}')`, function () {
		it('should detect tree without brackets', function () {
			expect(() => parseTree(test1_4)).to.throw(Error, /^unexpected token/i);
		});
	});


	//Missing tree element
	const test2_1 = '<nil>';
	describe(`#parseTree('${test2_1}')`, function () {
		it('should detect a tree with only one child', function () {
			expect(() => parseTree(test2_1)).to.throw(Error, /^unexpected token/i);
		});
	});
	const test2_2 = '<<nil.nil>>';
	describe(`#parseTree('${test2_2}')`, function () {
		it('should detect a tree with only one child', function () {
			expect(() => parseTree(test2_2)).to.throw(Error, /^unexpected token/i);
		});
	});
	const test2_3 = '<<nil>.nil>';
	describe(`#parseTree('${test2_3}')`, function () {
		it('should detect a nested tree with only one child', function () {
			expect(() => parseTree(test2_3)).to.throw(Error, /^unexpected token/i);
		});
	});
	const test2_4 = '<.nil>';
	describe(`#parseTree('${test2_4}')`, function () {
		it('should detect a tree with an empty child', function () {
			expect(() => parseTree(test2_4)).to.throw(Error, /^unexpected token/i);
		});
	});
	const test2_5 = '<nil.>';
	describe(`#parseTree('${test2_5}')`, function () {
		it('should detect a tree with an empty child', function () {
			expect(() => parseTree(test2_5)).to.throw(Error, /^unexpected token/i);
		});
	});
	const test2_6 = '<.<nil.nil>>';
	describe(`#parseTree('${test2_6}')`, function () {
		it('should detect a tree with an empty child', function () {
			expect(() => parseTree(test2_6)).to.throw(Error, /^unexpected token/i);
		});
	});

	//Too many tree elements
	const test3_1 = '<nil.nil.nil>';
	describe(`#parseTree('${test3_1}')`, function () {
		it('should detect a tree with too many elements', function () {
			expect(() => parseTree(test3_1)).to.throw(Error, /^unexpected token/i);
		});
	});
	const test3_2 = '<nil.<nil.nil.nil>>';
	describe(`#parseTree('${test3_2}')`, function () {
		it('should detect a nested tree with too many elements', function () {
			expect(() => parseTree(test3_2)).to.throw(Error, /^unexpected token/i);
		});
	});
});
