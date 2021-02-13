import { expect } from "chai";
import { describe, it } from "mocha";
import { to_integer, to_tree } from "../../src/converters/IntegerTreeConverter";

describe('IntegerTreeConverter', function () {
	describe('#to_integer(null)', function () {
		it('should produce 0', function () {
			expect(to_integer(null)).to.eql(0);
		});
	});

	describe('#to_integer(<n.n>)', function () {
		it('should produce 1', function () {
			expect(to_integer({
				left: null,
				right: null,
			})).to.eql(1);
		});
	});

	describe('#to_integer(<n.<n.n>>)', function () {
		it('should produce 2', function () {
			expect(to_integer({
				left: null,
				right: {
					left: null,
					right: null,
				},
			})).to.eql(2);
		});
	});

	describe('#to_tree(-1)', function () {
		it('should throw an error', function () {
			expect(() => to_tree(-1)).to.throw(
				Error,
				"Can't convert negative numbers to trees"
			);
		});
	});

	describe('#to_tree(0)', function () {
		it('should produce nil', function () {
			expect(to_tree(0)).to.eql(null);
		});
	});

	describe('#to_tree(2)', function () {
		it('should produce <nil.<nil.nil>>', function () {
			expect(to_tree(2)).to.eql({
				left: null,
				right: {
					left: null,
					right: null
				}
			});
		});
	});


	describe('#to_integer(to_tree(0))', function () {
		it('should produce 0', function () {
			expect(to_integer(to_tree(0))).to.eql(0);
		});
	});

	describe('#to_integer(to_tree(1))', function () {
		it('should produce 1', function () {
			expect(to_integer(to_tree(1))).to.eql(1);
		});
	});

	describe('#to_integer(to_tree(10))', function () {
		it('should produce 10', function () {
			expect(to_integer(to_tree(10))).to.eql(10);
		});
	});
});
