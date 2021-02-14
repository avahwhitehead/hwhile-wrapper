import { ChildProcessWithoutNullStreams } from "child_process";
import { HWhileConnector, HWhileConnectorProps } from "./HwhileConnector";

/**
 * Class for controlling HWhile's interactive mode
 */
export class InteractiveHWhileConnector {
	private _hWhileConnector: HWhileConnector;
	private _shell: ChildProcessWithoutNullStreams | undefined;

	constructor(props: HWhileConnectorProps) {
		this._hWhileConnector = new HWhileConnector(props);
	}

	public start() : ChildProcessWithoutNullStreams {
		this._shell = this._hWhileConnector.interactive();
		return this._shell;
	}

	// ========
	// Inputs
	// ========

	/**
	 * Evaluate a while expression.
	 * @param expr	Expression to evaluate
	 */
	expression(expr: string): void {
		if (!this._shell) return;
		this._shell.stdin.write(expr + '\n');
	}
	/**
	 * Execute a while command.
	 * @param comm	Command to execute
	 */
	command(comm: string) : void {
		if (!this._shell) return;
		this._shell.stdin.write(comm + '\n');
	}
	/**
	 * Print the help message.
	 */
	help() : void {
		if (!this._shell) return;
		this._shell.stdin.write(":help\n");
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
	store() : void {
		if (!this._shell) return;
		this._shell.stdin.write(`:store\n`);
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
