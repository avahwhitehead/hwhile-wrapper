import { ChildProcessWithoutNullStreams, spawn } from "child_process";

/**
 * Constructor properties for {@link HWhileConnector}
 */
interface HWhileConnectorProps {
	/**
	 * Path to the installed hwhile program.
	 * @example "hwhile"
	 */
	hwhile: string,
	/**
	 * The directory to run hwhile in.
	 * Defaults to the current directory.
 	 */
	cwd?: string,
}

/**
 * Base class for connecting to HWhile's command line
 */
export class HWhileConnector {
	private _props: HWhileConnectorProps;

	/**
	 *
 	 * @param props	Constructor properties. See {@link HWhileConnectorProps}.
	 */
	constructor(props: HWhileConnectorProps) {
		this._props = props;
	}

	/**
	 * Run the help command.
	 * Equivalent to {@code hwhile -h}.
	 */
	help() : ChildProcessWithoutNullStreams {
		return this.run_custom('', 'h');
	}

	/**
	 * Start the interactive mode.
	 * Equivalent to {@code hwhile -r}.
	 */
	interactive() : ChildProcessWithoutNullStreams {
		return this.run_custom('', 'r');
	}

	/**
	 * Run the version number command.
	 * Equivalent to {@code hwhile -v}.
	 */
	version() : ChildProcessWithoutNullStreams {
		return this.run_custom('', 'v');
	}

	/**
	 * Run a while program, getting the output as a while tree.
	 * Equivalent to {@code hwhile <file> <expr>}.
	 * @param file		Path to the while program file
	 * @param expr		Expression to pass as input to the program
	 * @param debug_log	Whether to show the debugging log (equivalent to adding `d` to the flags)
	 */
	run(file: string, expr?: string, debug_log = false) : ChildProcessWithoutNullStreams {
		return this.run_custom(file, this._build_flags('', debug_log), expr);
	}

	/**
	 * Run a while program, getting the output as an integer.
	 * Equivalent to {@code hwhile -i <file> <expr>}.
	 * @param file			Path to the while program file
	 * @param expr			Expression to pass as input to the program
	 * @param show_invalid	`true` to show invalid values as while trees, false to show them as `E`
	 * @param debug_log		Whether to show the debugging log (equivalent to adding `d` to the flags)
	 */
	run_int(file: string, expr?: string, show_invalid = false, debug_log = false) : ChildProcessWithoutNullStreams {
		return this.run_custom(file, this._build_flags('i', debug_log, show_invalid), expr);
	}

	/**
	 * Run a while program, getting the output as a list of while trees.
	 * Equivalent to {@code hwhile -l <file> <expr>}.
	 * @param file			Path to the while program file
	 * @param expr			Expression to pass as input to the program
	 * @param show_invalid	`true` to show invalid values as while trees, false to show them as `E`
	 * @param debug_log		Whether to show the debugging log (equivalent to adding `d` to the flags)
	 */
	run_tree_list(file: string, expr?: string, show_invalid = false, debug_log = false) : ChildProcessWithoutNullStreams {
		return this.run_custom(file, this._build_flags('l', debug_log, show_invalid), expr);
	}

	/**
	 * Run a while program, getting the output as a list of integers.
	 * Equivalent to {@code hwhile -li <file> <expr>}.
	 * @param file			Path to the while program file
	 * @param expr			Expression to pass as input to the program
	 * @param show_invalid	`true` to show invalid values as while trees, false to show them as `E`
	 * @param debug_log		Whether to show the debugging log (equivalent to adding `d` to the flags)
	 */
	run_integer_list(file: string, expr?: string, show_invalid = false, debug_log = false) : ChildProcessWithoutNullStreams {
		return this.run_custom(file, this._build_flags("li", debug_log, show_invalid), expr);
	}

	/**
	 * Run a while program, getting the output as a nested list of integers
	 * Equivalent to {@code hwhile -L <file> <expr>}.
	 * @param file			Path to the while program file
	 * @param expr			Expression to pass as input to the program
	 * @param show_invalid	`true` to show invalid values as while trees, false to show them as `E`
	 * @param debug_log		Whether to show the debugging log (equivalent to adding `d` to the flags)
	 */
	run_nested_integer_list(file: string, expr?: string, show_invalid = false, debug_log = false) : ChildProcessWithoutNullStreams {
		return this.run_custom(file, this._build_flags('L', debug_log, show_invalid), expr);
	}

	/**
	 * Run a while program, getting the output as a nested list of atoms and integers
	 * Equivalent to {@code hwhile -La <file> <expr>}.
	 * @param file			Path to the while program file
	 * @param expr			Expression to pass as input to the program
	 * @param show_invalid	`true` to show invalid values as while trees, false to show them as `E`
	 * @param debug_log		Whether to show the debugging log (equivalent to adding `d` to the flags)
	 */
	run_nested_atom_list(file: string, expr?: string, show_invalid = false, debug_log = false) : ChildProcessWithoutNullStreams {
		return this.run_custom(file, this._build_flags("La", debug_log, show_invalid), expr);
	}

	/**
	 * Run the unparser on a file
	 * Equivalent to {@code hwhile -u <file>}.
	 * @param file			Path to the while program file
	 */
	run_unparser(file: string) : ChildProcessWithoutNullStreams {
		return this.run_custom(file, 'u');
	}

	/**
	 * Run a while program, getting the output as a nested list of atoms and integers
	 * Equivalent to {@code hwhile [-<flags>] <file> <expr>}.
	 * @param file		Path to the while program file
	 * @param flags		The flags to provide to hwhile
	 * @param expr		Expression to pass as input to the program
	 */
	run_custom(file: string, flags?: string, expr?: string) : ChildProcessWithoutNullStreams {
		let args: string[] = [];
		//Add all the program arguments to a list
		if (flags) args.push(`-${flags}`)
		args.push(file);
		if (expr) args.push(expr);

		//Start the process
		return spawn(this._props.hwhile, args, {
			cwd: this._props.cwd,
		});
	}

	/**
	 * Util function to simplify flag creation
	 * @param root			The middle/"root" flag(s) to use ('i'/'l'/'La'/...)
	 * @param debug_log		Whether to add a 'd' at the start of the flags
	 * @param show_invalid	Whether to add a 'v' at the end of the flags
	 */
	_build_flags(root = '', debug_log = false, show_invalid = false) : string {
		return (debug_log ? 'd' : '') + root + (show_invalid ? 'v' : '')
	}
}

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
		this._shell?.stdin.write(expr + '\n');
	}
	/**
	 * Execute a while command.
	 * @param comm	Command to execute
	 */
	command(comm: string) : void {
		if (!this._shell) return;
		this._shell?.stdin.write(comm + '\n');
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
