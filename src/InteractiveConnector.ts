import { ChildProcessWithoutNullStreams } from "child_process";
import { CustomDict } from "./types/CustomDict";
import { HWhileConnector, HWhileConnectorProps } from "./HwhileConnector";
import parseTree, { BinaryTree } from "./parsers/TreeParser";
import { EventEmitter } from "events";

export interface ProgramInfo {
	name: string;
	variables: Map<string, BinaryTree>;
	breakpoints: number[],
}

export type StepResultType = { cause: 'breakpoint'; line: number; note?: string; }
		| { cause: 'start' | 'done'; variable: string; value: BinaryTree }
		| { cause: 'loop-exit' };

export type RunResultType = { cause: 'breakpoint'; line: number; }
		| { cause: 'done'; variable: string; value: BinaryTree };

/**
 * Class for controlling HWhile's interactive mode
 */
export class InteractiveHWhileConnector extends EventEmitter {
	private _hWhileConnector: HWhileConnector;
	private _shell: ChildProcessWithoutNullStreams | undefined;
	//Callback queue for when HWhile finishes outputting
	private readonly _dataCallbacks: ((lines: string[], original: string) => void)[] = [];
	//Store the outputted lines across multiple 'data' events until an input prompt is detected
	private _outputHolder : string[] = [];
	//Program information store
	private _programInfo: ProgramInfo|undefined;

	//TODO: Queue commands for execution rather than sending immediately

	constructor(props: HWhileConnectorProps) {
		super();
		this._hWhileConnector = new HWhileConnector(props);
	}

	/**
	 * Start a HWhile interactive process
 	 */
	public async start() : Promise<void> {
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
					let dataCallback: ((data: string[], original: string) => void) | undefined = this._dataCallbacks.shift();
					//Call the callback with the output data
					if (dataCallback) dataCallback(this._outputHolder.filter(s => !!s), str);
					//Clear the line store
					this._outputHolder = []
				} else {
					//The last line is data - add it to the output store
					this._outputHolder.push(last);
				}
			}
		});

		//Don't return until the first input prompt has been received
		return new Promise<void>((resolve) => {
			this._dataCallbacks.push(() => resolve());
		});
	}

	/**
	 * Stop the underlying HWhile process, if it is running
	 */
	public stop() : void {
		if (!this._shell) return;
		this._shell.kill();
	}

	/**
	 *
	 */
	get shell(): ChildProcessWithoutNullStreams | undefined {
		return this._shell;
	}

	// ========
	// Inputs
	// ========

	/**
	 * Evaluate a while expression or run a command.
	 * USE WITH CAUTION.
	 * @param expr		String to evaluate
	 * @param output	Whether to emit the HWhile output string to listeners
	 * @returns	The string outputted by hwhile to stdout while running, split into lines
	 */
	async execute(expr: string, output = true): Promise<string[]> {
		return new Promise((resolve, reject) => {
			if (!this._shell) {
				reject("No shell to access. Try calling `this.start()`.");
				return;
			}
			if (expr.charAt(expr.length - 1) !== '\n') expr += '\n';

			this._dataCallbacks.push((data: string[], str: string) => {
				if (output) this.emit('output', str);
				resolve(data)
			});
			this._shell.stdin.write(expr);
		})
	}

	/**
	 * Print the help message.
	 * @param output	Whether to emit the HWhile output string to listeners
	 */
	async help(output = true) : Promise<void> {
		await this.execute(':help', output);
	}

	/**
	 * Load a while program 'p' for execution with argument {@code expr}.
	 * Note that this clears the current store contents.
	 * @param p		The program to load.
	 * 				For a program 'p', this will load from the file 'p.while' in the current directory.
	 * @param expr	Argument to provide to the program {@code p}..
	 * @param output	Whether to emit the HWhile output string to listeners
	 */
	async load(p : string, expr : string, output = true) : Promise<ProgramInfo> {
		//Run the command
		let lines : string[] = await this.execute(`:load ${p} ${expr}`, output);
		let result = lines.shift();

		if (result && result.match(/^Program '(.+)' loaded/)) {
			this._programInfo = {
				name: p,
				variables: new Map<string, BinaryTree>(),
				breakpoints: [],
			};
			// Check for existing breakpoints
			let breakpoints: CustomDict<Set<number>> = await this.breakpoints();
			if (breakpoints[p]) this._programInfo.breakpoints = Array.from(breakpoints[p]);
			return this._programInfo;
		} else {
			throw new Error(`Unexpected output: "${result}"`);
		}
	}

	/**
	 * Run the loaded program up until the next breakpoint, or the end of the program (whichever is first)..
	 * @param output	Whether to emit the HWhile output string to listeners
	 */
	async run(output = true) : Promise<RunResultType> {
		if (!this._programInfo) throw new Error("No program to run");

		//Run the program
		let lines: string[] = await this.execute(':run', output);

		//Get the first line of the output
		let first: string | undefined = lines.shift();
		//Shouldn't happen
		if (!first) throw new Error("Expected output, received nothing");

		//Object to return
		let result : RunResultType;

		let match;
		if ((match = first.match(/^wrote (.+?) = (.+)$/))) {
			//Program executed completely
			result = {
				cause: 'done',
				variable: match[1],
				value: parseTree(match[2]),
			};
		} else if (first === 'Hit breakpoint.') {
			//Program stopped at breakpoint
			let line = lines.shift();
			//Shouldn't ever happen
			if (!line) throw new Error('Unexpected end to output');

			//Get the program name/line number from the output
			let match = line.match(/^(.+), line (\d+):/);
			//Shouldn't ever happen
			if (!match) throw new Error(`Unexpected output: "${line}"`);
			//Stopped on a breakpoint
			result = {
				cause: 'breakpoint',
				line: Number.parseInt(match[2]),
			};
		} else {
			throw new Error(`Unexpected output: "${first}"`);
		}

		//Update the stored variables
		await this.store(false);

		return result;
	}

	/**
	 * Step through a single line of the loaded program..
	 * @param output	Whether to emit the HWhile output string to listeners
	 */
	async step(output = true) : Promise<StepResultType> {
		if (!this._programInfo) throw new Error("No program to run");

		//Run the next line
		let lines : string[]  = await this.execute(`:step`, output);

		//Get the first line of the output
		let first: string | undefined = lines.shift();
		//Shouldn't happen
		if (!first) throw new Error("Expected output, received nothing");

		//Object to return
		let result : StepResultType;

		let match;
		if ((match = first.match(/^read (.+?) = (.+)$/))) {
			//Got input
			result = {
				cause: 'start',
				variable: match[1],
				value: parseTree(match[2]),
			};
		} else if ((match = first.match(/^wrote (.+?) = (.+)$/))) {
			//Program finished executing
			result = {
				cause: 'done',
				variable: match[1],
				value: parseTree(match[2]),
			};
		} else if ((match = first.match(/^(.+), line (\d+):/))) {
			lines.shift();
			//Stopped after executing the line
			result = {
				cause: 'breakpoint',
				line: Number.parseInt(match[2]),
				note: lines.shift(),
			};
		} else if (first === 'Skipped or exited while-loop.') {
			result = {
				cause: 'loop-exit',
			}
		} else {
			throw new Error(`Unexpected output: "${first}"`);
		}

		//Update the stored variables
		await this.store(false);

		return result;
	}

	/**
	 * Get the current store contents.
	 * Returns a dictionary of dictionaries, first indexed by program, then by variable.
	 * Also updates the stored variable values for the loaded program.
	 * @param output	Whether to emit the HWhile output string to listeners
	 * @returns		A mapping of programs to a map of variables to values..
	 */
	async store(output = true) : Promise<Map<string, Map<string, BinaryTree>>> {
		let lines = await this.execute(`:store`, output);
		const variables : Map<string, Map<string, BinaryTree>> = new Map();

		//Get all the lines matching the output format "(prog) VARIABLE = [OUTPUT_VAL]"
		let matches = this._runMatch(lines,/^\((.+?)\) (.+?) = (.+)$/);
		for (let match of matches) {
			//Get the program's variables
			let p = variables.get(match[1]) || new Map();
			//Add this variable to the list
			p.set(match[2], parseTree(match[3]));
			//Save the updated variables
			variables.set(match[1], p);
		}

		//If a program is loaded, update the variable values
		if (this._programInfo) {
			this._programInfo.variables = variables.get(this._programInfo.name) || new Map();
		}

		return variables;
	}

	/**
	 * Change the current file search path to 'dir'.
	 * @param dir		The directory to switch to.
	 * 					This must be an absolute path..
	 * @param output	Whether to emit the HWhile output string to listeners
	 */
	async cd(dir: string, output = true) : Promise<void> {
		await this.execute(`:cd ${dir}`, output);
	}

	/**
	 * Get all the breakpoints.
	 */
	async breakpoints(output = true) : Promise<CustomDict<Set<number>>> {
		let lines = await this.execute(`:break`, output);
		let matches = this._runMatch(lines, /^Program '(.+)', line (\d+)\.$/);
		let breakpoints: CustomDict<Set<number>> = {};
		for (let match of matches) {
			let p: string = match[1];
			let b: Set<number> = breakpoints[p] || new Set<number>();
			b.add(Number.parseInt(match[2]));
			breakpoints[p] = b;
		}
		return breakpoints;
	}

	/**
	 * Add a breakpoint on line 'n' of the program 'p', or the loaded program if `p` is not provided.
	 * @param n	Line number to add the break point
	 * @param p	Optional program to add the breakpoint to.
	 * @param output	Whether to emit the HWhile output string to listeners
	 */
	async addBreakpoint(n: number, p?: string, output = true) : Promise<void> {
		//Error if HWhile won't be able to set the breakpoint
		if (!p && !this._programInfo) throw new Error("Can't set breakpoints without a program. Please load a program, or specify one explicitly.");

		let lines: string[] = await this.execute(`:break ${n} ${p || ''}`, output);
		let last = lines.shift();
		if (!last || !last.match(/^Breakpoint set in program .+ at line \d+\.$/)) {
			throw new Error(`Unexpected output: "${last}"`);
		}
	}

	/**
	 * Delete the breakpoint on line 'n' of the program 'p', or the loaded program if `p` is not provided.
	 * @param n	Line number to remove the break point
	 * @param p	Optional program to remove the breakpoint from.
	 * @param output	Whether to emit the HWhile output string to listeners
	 */
	async delBreakpoint(n: number, p?: string, output = true) : Promise<void> {
		//Error if HWhile won't be able to clear the breakpoint
		if (!p && !this._programInfo) throw new Error("Can't set breakpoints without a program. Please load a program, or specify one explicitly.");

		let lines: string[] = await this.execute(`:delbreak ${n} ${p || ''}`, output);
		let last = lines.shift();
		if (!last || !last.match(/^Breakpoint removed from program .+ at line \d+\.$/)) {
			throw new Error(`Unexpected output: "${last}"`);
		}
	}

	// ========
	// Utils
	// ========

	/**
	 * Run a reject match against all elements of a list, removing non-matching items
	 * @param lines		The list to run the matcher on
	 * @param matcher	RegEx matcher pattern
	 */
	private _runMatch(lines: string[], matcher: string|RegExp) : RegExpMatchArray[] {
		let matches = lines.map(line => line.match(matcher));
		return matches.filter(m => !!m) as RegExpMatchArray[];
	}
}
