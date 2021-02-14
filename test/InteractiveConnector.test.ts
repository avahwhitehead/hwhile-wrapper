import { expect } from "chai";
import { describe, it } from "mocha";
import { InteractiveHWhileConnector } from "../src";

async function setup() : Promise<InteractiveHWhileConnector> {
	let connector = new InteractiveHWhileConnector({
		hwhile: "hwhile"
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
});
