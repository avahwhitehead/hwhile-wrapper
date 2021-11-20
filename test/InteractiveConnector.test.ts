import { expect } from "chai";
import { describe, it } from "mocha";
import * as path from "path";
import { InteractiveHWhileConnector, ProgramInfo, RunResultType } from "../src";
import { BinaryTree, treeParser } from "@whide/tree-lang";

/**
 * Convert a number to a tree
 * @param n	The number to convert
 */
export function tn(n: number) : BinaryTree {
	if (n === 0) return null;
	return t(null, tn(n-1));
}

/**
 * Shorthand function for building a tree
 * @param l	The left-hand child
 * @param r	The right-hand child
 */
export function t(l: BinaryTree|number, r: BinaryTree|number): BinaryTree {
	return {
		left: (typeof l === 'number' ? tn(l) : l),
		right: (typeof r === 'number' ? tn(r) : r),
	};
}

async function setup() : Promise<InteractiveHWhileConnector> {
	let working_dir = path.resolve('.', "resources");
	let connector = new InteractiveHWhileConnector({
		hwhile: "hwhile",
		cwd: working_dir,
	});
	await connector.start();
	return connector;
}
async function teardown(connector: InteractiveHWhileConnector) : Promise<void> {
	await connector.stop();
}

const HELP_MESSAGE = [
	`HWhile interactive mode. Possible options:`,
	`<EXPR>         - Evaluate a while expression.`,
	`<COMM>         - Execute a while command.`,
	`:help          - Print this message.`,
	`:load p <EXPR> - Load a while program 'p' (i.e. from the file`,
	`'p.while') for execution with argument <EXPR>. Note`,
	`that this clears the current store contents.`,
	`:run           - Run the loaded program up until the next`,
	`breakpoint.`,
	`:step          - Step through a single line of the loaded program.`,
	`:store         - Print the current store contents.`,
	`:printmode m   - Set the print mode to mode 'm'. Valid modes are i,`,
	`iv, l, li, liv, L, and La. Quit interactive mode`,
	`and then run 'hwhile -h' for more info on print`,
	`modes.`,
	`:cd dir        - Change the current file search path to 'dir'.`,
	`:break n       - Add a breakpoint to line 'n' of the loaded program.`,
	`:break n p     - Add a breakpoint to line 'n' of program 'p'.`,
	`:break         - Print all breakpoints.`,
	`:delbreak n    - Delete the breakpoint on line 'n' of the loaded`,
	`program.`,
	`:delbreak n p  - Delete the breakpoint on line 'n' of program 'p'.`,
	`(Ctrl+D)       - Quit interactive mode.`
];

describe('Interactive HWhile Connector', function () {
	describe(`#execute(':help')`, function () {
		it('should receive the hwhile interactive help output', async function () {
			let connector = await setup();
			try {
				let lines = await connector.execute(':help');
				lines = lines.map(l => l.trim());
				expect(lines).to.eql([':help', ...HELP_MESSAGE]);
			} finally {
				await teardown(connector);
			}
		});
	});

	describe(`#load(...)`, function () {
		describe(`#load('count', '[4, 5]')`, function () {
			it('should load the `count` program', async function () {
				let connector = await setup();
				try {
					let programInfo: ProgramInfo = await connector.load('count', '[4, 5]');
					expect(programInfo.name).to.eql('count');
					expect(programInfo.line).to.eql(0);
					expect(programInfo.variables).to.eql(new Map());
					expect(programInfo.allVariables).to.eql(new Map());
					expect(programInfo.breakpoints).to.eql([]);
					expect(programInfo.allBreakpoints).to.eql(new Map());
				} finally {
					await teardown(connector);
				}
			});
		});

		describe(`#load('does_not_exist', '[4, 5]')`, function () {
			it('should throw a Not Found error', async function () {
				let connector = await setup();
				return connector.load('does_not_exist', '[4, 5]')
					.then(() => { throw new Error('was not supposed to succeed'); })
					.catch(m => { expect(m).to.match(/.*No such file or directory.*/); })
					.finally(async () => teardown(connector));
			});
		});

		describe(`#load('count', '')`, function () {
			it('should throw an Arguments Required error', async function () {
				let connector = await setup();
				return connector.load('count', '')
					.then(() => { throw new Error('was not supposed to succeed'); })
					.catch(m => { expect(m).to.match(/.*Please supply .+ an argument literal.*/); })
					.finally(async () => teardown(connector));
			});
		});

		describe(`#load('', '')`, function () {
			it('should throw an Program Required error', async function () {
				let connector = await setup();
				return connector.load('', '')
					.then(() => { throw new Error('was not supposed to succeed'); })
					.catch(m => { expect(m).to.match(/.*Please supply .+ an argument literal.*/); })
					.finally(async () => teardown(connector));
			});
		});

		describe(`#load('count', '[4, 5]') - with breakpoints`, function () {
			it('should load the `count` program with breakpoints already defined', async function () {
				let connector = await setup();
				try {
					let breakpoints = [1,2,3,4,5];
					for (let b of breakpoints) await connector.addBreakpoint(b, 'count');

					let programInfo: ProgramInfo = await connector.load('count', '[4, 5]');
					expect(programInfo.name).to.eql('count');
					expect(programInfo.variables).to.eql(new Map());
					expect(programInfo.breakpoints).to.have.same.members(breakpoints);
				} finally {
					await teardown(connector);
				}
			});
		});
	});

	describe(`#breakpoints(...)`, function () {
		describe(`#breakpoints() - no program to use`, async function () {
			it('should throw an error and fail to add the breakpoint', async function () {
				let connector = await setup();
				return connector.addBreakpoint(3)
					.then(() => { throw new Error('was not supposed to succeed'); })
					.catch(m => { expect(m).to.match(/.*Can't update breakpoints without a program.*/); })
					.finally(async () => teardown(connector));
			});
		});

		describe(`#breakpoints() - prog1/prog2`, async function () {
			it('should add and store multiple breakpoints for multiple programs', async function () {
				let connector = await setup();
				try {
					//The breakpoints to add for different programs
					let expected : Map<string,number[]> = new Map<string, number[]>([
						['prog1', [1,3,5]],
						['prog2', [2,4,6]],
					]);
					//Add all the breakpoints
					// @ts-ignore
					for (let [prog, breakpoints] of expected.entries()) {
						for (let b of breakpoints) {
							await connector.addBreakpoint(b, prog);
						}
					}

					let actual = await connector.breakpointsMap();
					//Check all the programs (and only these programs) exist
					expect(actual).to.deep.equal(expected);

					//Remove the breakpoints from prog1
					for (let b of expected.get('prog1')!) await connector.delBreakpoint(b, 'prog1');
					let actual_removed = await connector.breakpointsMap();
					expected.delete('prog1')
					expect(actual_removed).to.deep.equal(expected);
				} finally {
					await teardown(connector);
				}
			});
		});

		describe(`#breakpoints() - default`, async function () {
			it('should add and store multiple breakpoints for a single loaded program', async function () {
				let connector = await setup();

				try {
					//Load the program
					let PROG = 'count';
					await connector.load(PROG, '[1,2,3]');

					//The breakpoint lines to use
					let expected : number[] = [7,6,5,3,1];

					//====
					//Test adding the breakpoints
					//====
					for (let b of expected) await connector.addBreakpoint(b);
					//Get the stored breakpoints
					let actual = await connector.breakpointsMap();
					//Check the program exists in the result and has only these breakpoints
					expect(actual).to.deep.equal(new Map([
						[PROG, [1,3,5,6,7]]
					]));

					//====
					//Test removing the breakpoints
					//====
					//Save one breakpoint
					let i = Math.floor(Math.random() * expected.length);
					let v = expected[i];
					expected.splice(i, 1);

					//Remove the remaining breakpoints
					for (let b of expected) await connector.delBreakpoint(b);
					//Check the program exists in the result and has only one breakpoint
					expect(await connector.breakpointsMap()).to.deep.equal(new Map([[PROG, [v]]]));

					//Delete the remaining breakpoint
					await connector.delBreakpoint(v);
					expect(await connector.breakpointsMap()).to.deep.equal(new Map());
				} finally {
					await teardown(connector);
				}
			});
		});
	});

	describe(`#store(...)`, function () {
		describe(`no programs loaded`, async function () {
			it('should have no variables', async function () {
				let connector = await setup();
				try {
					expect(await connector.store()).to.deep.equal(new Map());
				} finally {
					await teardown(connector);
				}
			});
		});

		describe(`program loaded, not run`, async function () {
			it('should have no variables', async function () {
				let connector = await setup();
				try {
					await connector.load('count', '[1, 2, 3]');
					expect(await connector.store()).to.deep.equal(new Map());
				} finally {
					await teardown(connector);
				}
			});
		});

		describe(`count breaking during execution`, async function () {
			it('should have some variables set', async function () {
				let connector = await setup();
				try {
					//Load a program, and add a breakpoint
					await connector.load('count', '[1, 2]');
					await connector.addBreakpoint(8);
					await connector.run();

					let actual = await connector.store();

					let count_vars : Map<string, BinaryTree> = actual.get('count') || new Map();

					//Make sure the program exists in the result
					expect(actual).to.have.key('count');
					//Make sure 'LIST' exists in the result, and has the correct value
					expect(count_vars.get('LIST')).to.not.be.undefined;
					expect(count_vars.get('LIST')).to.deep.equal(t(tn(1), t(tn(2), null)));
					//Make sure 'SUM' exists in the result, and has the correct value
					expect(count_vars.get('SUM')).to.be.null;
				} finally {
					await teardown(connector);
				}
			});
		});
	});

	describe(`#run(...)`, function () {
		describe(`no program loaded`, async function () {
			it('should throw an error', async function () {
				let connector = await setup();
				return connector.run()
					.then(() => { throw new Error('was not supposed to succeed'); })
					.catch(m => { expect(m).to.match(/.*No program to run.*/); })
					.finally(async () => teardown(connector));
			});
		});

		describe(`run 'count [3,4,5]' completely`, async function () {
			it('should produce 12', async function () {
				let connector = await setup();
				try {
					//Load and run the program
					await connector.load('count', '[3,4,5]');
					const res: RunResultType = await connector.run();
					//Validate the result
					const variables = new Map([
						['ELEM', null],
						['LIST', null],
						['SUM', tn(12)],
					]);
					const expected = {
						name: 'count',
						cause: 'done',
						done: true,
						line: undefined,
						variable: 'SUM',
						value: tn(12),
						allVariables: new Map([['count', variables]]),
						variables: variables,
						allBreakpoints: new Map(),
						breakpoints: [],
					};
					//The objects should be equal
					for (let [k,v] of Object.entries(expected)) {
						expect(res).to.have.deep.property(k, v);
					}
					expect(expected).to.have.all.keys(Object.keys(res));
				} finally {
					await teardown(connector);
				}
			});
		});

		describe(`run 'count [3,4,5]' stopping at breakpoints`, async function () {
			it('should stop at each breakpoint, then produce 12', async function () {
				let connector = await setup();
				try {
					//Load the program
					await connector.load('count', '[3,4,5]');
					//Break on a line that's only executed once
					await connector.addBreakpoint(7, 'count');
					//Run the program
					let res = await connector.run();

					//Check the expected result
					let variables = new Map([
						['LIST', t(tn(3), t(tn(4), t(tn(5), null)))]
					]);
					const breakpoints = [7];
					const expected: RunResultType = {
						name: 'count',
						cause: 'breakpoint',
						line: 7,
						variables: variables,
						allVariables: new Map([['count', variables]]),
						breakpoints: breakpoints,
						allBreakpoints: new Map([['count', breakpoints]]),
						done: false,
					};
					//The objects should be equal
					for (let [k,v] of Object.entries(expected)) {
						expect(res).to.have.deep.property(k, v);
					}
					expect(expected).to.have.all.keys(Object.keys(res));

					//Break on a line that's executed repeatedly
					const BREAK_LINE = 10;
					await connector.addBreakpoint(BREAK_LINE, 'count');
					//Validate the result
					res = await connector.run();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', BREAK_LINE);

					res = await connector.run();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', BREAK_LINE);

					res = await connector.run();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', BREAK_LINE);

					//Run to completion
					variables = new Map([
						['ELEM', null],
						['LIST', null],
						['SUM', tn(12)],
					]);
					expect(await connector.run()).to.deep.equal({
						name: 'count',
						cause: 'done',
						done: true,
						line: undefined,
						variable: 'SUM',
						value: tn(12),
						breakpoints: [7, 10],
						allBreakpoints: new Map([
							['count', [7,10]]
						]),
						allVariables: new Map([['count', variables]]),
						variables: variables,
					});
				} finally {
					await teardown(connector);
				}
			});
		});
	});

	describe(`#step(...)`, function () {
		describe(`no program loaded`, async function () {
			it('should throw an error', async function () {
				let connector = await setup();
				return connector.step()
					.then(() => { throw new Error('was not supposed to succeed'); })
					.catch(m => { expect(m).to.match(/.*No program to run.*/); })
					.finally(async () => teardown(connector));
			});
		});

		describe(`run 'count [1,2]' completely`, async function () {
			it('should produce 3', async function () {
				let connector = await setup();
				try {
					//Load the program
					await connector.load('add', '[1,2]');
					//First step reads the input
					let res = await connector.step();
					expect(res).to.have.property('cause', 'start');
					expect(res).to.have.property('variable', 'XY');
					expect(res).to.have.deep.property('value', treeParser('<<nil.nil>.<<nil.<nil.nil>>.nil>>'));

					//Step through the program
					res = await connector.step();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', 6);
					expect(res).to.have.property('note', 'X = <nil.nil>');

					res = await connector.step();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', 7);
					expect(res).to.have.property('note', 'Y = <<nil.<nil.nil>>.nil>');

					res = await connector.step();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', 8);
					expect(res).to.have.property('note', 'Entered or re-entered while-loop.');

					res = await connector.step();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', 9);
					expect(res).to.have.property('note', 'Y = <nil.<<nil.<nil.nil>>.nil>>');

					res = await connector.step();
					expect(res).to.have.property('cause', 'breakpoint');
					expect(res).to.have.property('line', 10);
					expect(res).to.have.property('note', 'X = nil');

					//Program leaves the loop
					res = await connector.step();
					expect(res).to.have.property('cause', 'loop-exit');
					//Program finishes
					res = await connector.step();
					expect(res).to.have.property('cause', 'done');
					expect(res).to.have.property('variable', 'Y');
					expect(res).to.have.deep.property('value', treeParser('<nil.<<nil.<nil.nil>>.nil>>'));
				} finally {
					await teardown(connector);
				}
			});
		});
	});
});
