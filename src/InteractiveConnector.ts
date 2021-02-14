import { ChildProcessWithoutNullStreams } from "child_process";
import { HWhileConnector, HWhileConnectorProps } from "./HwhileConnector";

/**
 * Class for controlling HWhile's interactive mode
 */
export class InteractiveHWhileConnector {
	private _hWhileConnector: HWhileConnector;
	private _shell: ChildProcessWithoutNullStreams | undefined;
	//Callback queue for when HWhile finishes outputting
	private readonly _dataCallbacks: ((lines: string[]) => void)[] = [];
	//Store the outputted lines across multiple 'data' events until an input prompt is detected
	private _outputHolder : string[] = [];

	//TODO: Queue commands for execution rather than sending immediately

	//TODO: Add an `InteractiveHWhileConnector.on("output")` in place of `... ._shell.stdout.on("data")`
	//	Would allow filtering out unnecessary info
	//	Would allow showing inputs on stdout

	constructor(props: HWhileConnectorProps) {
		this._hWhileConnector = new HWhileConnector(props);
	}

	/**
	 * Start a HWhile interactive process
 	 */
	public async start() : Promise<ChildProcessWithoutNullStreams> {
		this._shell = this._hWhileConnector.interactive();

		//Listen for output from HWhile
		this._shell.stdout.on("data", (data: Buffer) => {
			//Convert the data to a string
			const str = data.toString();
			//Split the string into lines
			let lines = str.split(/\r?\n\s*/);
			//Get the last line (will either be data or an input prompt)
			const last = lines.pop();
			//Append all but the last line to the line store
			this._outputHolder.push(...lines);
			if (last) {
				//If the last line is prompting for input
				if (last.match(/^HWhile>\s*$/)) {
					//See if there are any callbacks waiting for data
					let dataCallback: ((data: string[]) => void) | undefined = this._dataCallbacks.shift();
					//Call the callback with the output data
					if (dataCallback) dataCallback(this._outputHolder);
					//Clear the line store
					this._outputHolder = []
				} else {
					//The last line is data - add it to the output store
					this._outputHolder.push(last);
				}
			}
		});

		//Don't return the connector until the first input prompt has been received
		let shell: ChildProcessWithoutNullStreams = this._shell;
		return new Promise((resolve) => {
			this._dataCallbacks.push(() => resolve(shell));
		});
	}

	/**
	 * Stop the underlying HWhile process, if it is running
	 */
	public stop() : void {
		if (!this._shell) return;
		this._shell.kill();
	}

	// ========
	// Inputs
	// ========

	/**
	 * Evaluate a while expression or run a command.
	 * @param expr	String to evaluate
	 * @returns	The string outputted by hwhile to stdout while running, split into lines
	 */
	execute(expr: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			if (!this._shell) {
				reject("No shell to access. Try calling `this.start()`.");
				return;
			}
			if (expr.charAt(expr.length - 1) !== '\n') expr += '\n';

			this._dataCallbacks.push((data: string[]) => resolve(data));
			this._shell.stdin.write(expr);
		})
	}

	/**
	 * Print the help message.
	 */
	async help() : Promise<void> {
		await this.execute(':help');
	}

	/**
	 * Load a while program 'p' for execution with argument {@code expr}.
	 * Note that this clears the current store contents.
	 * @param p		The program to load.
	 * 				For a program 'p', this will load from the file 'p.while' in the current directory.
	 * @param expr	Argument to provide to the program {@code p}.
	 */
	load(p : string, expr : string) : void {
		if (!this._shell) return;
		this._shell.stdin.write(`:load ${p} ${expr}\n`);
	}

	/**
	 * Run the loaded program up until the next breakpoint.
	 */
	run() : void {
		if (!this._shell) return;
		this._shell.stdin.write(`:run\n`);
	}

	/**
	 * Step through a single line of the loaded program.
	 */
	step() : void {
		if (!this._shell) return;
		this._shell.stdin.write(`:step\n`);
	}

	/**
	 * Print the current store contents.
	 */
	async store() : Promise<Map<string, BinaryTree>> {
		// TODO: save variable values
		// ([program]) [VAR] = [VAL]
		// ...
		let lines = await this.execute(`:store\n`);
		const variables : Map<string, BinaryTree> = new Map<string, BinaryTree>();

		console.log("----");
		let matches = lines.map(line => line.match(/^\((.+?)\) (.+?) = (.+)$/));
		let matches_nn : RegExpMatchArray[] = matches.filter(m => !!m) as RegExpMatchArray[];
		for (let m of matches_nn) {
			let s = `${m[1]}#${m[2]}:\t${to_integer(parseTree(m[3]))}`;
			console.log(s);
			variables.set(m[2], parseTree(m[3]))
		}
		console.log("----");

		return variables;
	}

	/**
	 * Set the print mode to mode 'm'.
	 * Valid modes are i, iv, l, li, liv, L, and La.
	 * Run 'hwhile -h' for more info on print modes.
	 * @param m		The print mode to use.
	 				These are the same as the flags used by ${HWhileConnector} methods.
	 */
	setPrintMode(m: 'i'|'iv'|'l'|'li'|'liv'|'L'|'La') : void {
		//TODO: Is there a way to reset `printmode` to just 'tree'?
		if (!this._shell) return;
		this._shell.stdin.write(`:printmode ${m}\n`);
	}

	/**
	 * Change the current file search path to 'dir'.
	 * @param dir	The directory to switch to.
	 * 				This must be an absolute path.
	 */
	cd(dir: string) : void {
		if (!this._shell) return;
		this._shell.stdin.write(`:cd ${dir}\n`);
	}

	/**
	 * Print all breakpoints.
	 */
	showBreakpoints() : void {
		if (!this._shell) return;
		this._shell.stdin.write(`:break\n`);
	}

	/**
	 * Add a breakpoint to line 'n' of the loaded program.
	 * Add a breakpoint to line 'n' of program 'p'.
	 */
	addBreakpoint(n: number, p?: string) : void {
		if (!this._shell) return;
		if (p) this._shell.stdin.write(`:break ${n} ${p}\n`);
		else this._shell.stdin.write(`:break ${n}\n`);
	}

	/**
	 * Delete the breakpoint on line 'n' of the loaded
	 * Delete the breakpoint on line 'n' of program 'p'.
	 */
	delBreakpoint(n: number, p?: string) : void {
		if (!this._shell) return;
		if (p) this._shell.stdin.write(`:delbreak ${n} ${p}\n`);
		else this._shell.stdin.write(`:delbreak ${n}\n`);
	}
}
