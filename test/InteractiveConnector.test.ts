import { expect } from "chai";
import { describe, it } from "mocha";
import { InteractiveHWhileConnector } from "../src";
import { ProgramInfo } from "../src/InteractiveConnector";
import * as path from "path";
import { CustomDict } from "../src/types/CustomDict";

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
				expect(lines).to.eql(HELP_MESSAGE);
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
					expect(programInfo.variables).to.eql(new Map());
					expect(programInfo.breakpoints).to.eql([]);
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
					.catch(m => { expect(m).to.match(/.*Can't set breakpoints without a program.*/); })
					.finally(async () => teardown(connector));
			});
		});

		describe(`#breakpoints() - prog1/prog2`, async function () {
			it('should add and store multiple breakpoints for multiple programs', async function () {
				let connector = await setup();
				try {
					//The breakpoints to add for different programs
					let expected : CustomDict<number[]> = {
						'prog1': [5,3,1],
						'prog2': [2,4,6],
					};
					//Add all the breakpoints
					for (let [prog, breakpoints] of Object.entries(expected)) {
						for (let b of breakpoints) {
							await connector.addBreakpoint(b, prog);
						}
					}

					let actual = await connector.breakpoints();
					//Check all the programs (and only these programs) exist
					expect(actual).to.have.all.keys(Object.keys(expected));
					expect(expected).to.have.all.keys(Object.keys(actual));
					//Check the breakpoints match
					for (let key of Object.keys(actual)) {
						expect(Array.from(actual[key])).to.have.same.members(expected[key]);
					}

					//Remove the breakpoints from prog1
					for (let b of expected['prog1']) await connector.delBreakpoint(b, 'prog1');
					let actual_removed = await connector.breakpoints();
					//Check prog1 has no breakpoints
					expect(actual_removed).to.not.have.key('prog1');
					//Check prog2 has not changed
					expect(actual_removed).to.have.key('prog2');
					expect(Array.from(actual_removed['prog2'])).to.deep.equal(expected['prog2']);
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
					let actual = await connector.breakpoints();
					//Check the program exists in the result and has only these breakpoints
					expect(actual).to.have.key(PROG);
					expect(Array.from(actual[PROG])).to.have.same.members(expected);

					//====
					//Test removing the breakpoints
					//====
					//Save one breakpoint
					let i = Math.floor(Math.random() * expected.length);
					let v = expected[i];
					expected.splice(i, 1);

					//Remove the remaining breakpoints
					for (let b of expected) await connector.delBreakpoint(b);
					let actual_removed = await connector.breakpoints();
					//Check the program exists in the result and has only one breakpoint
					expect(actual_removed).to.have.key(PROG);
					expect(Array.from(actual_removed[PROG])).to.deep.equal([v]);

					//Delete the remaining breakpoint
					await connector.delBreakpoint(v);
					let actual_removed_2 = await connector.breakpoints();
					expect(actual_removed_2).to.not.have.key(PROG);
				} finally {
					await teardown(connector);
				}
			});
		});
	});
});
