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
		return spawn(this._props.hwhile, args);
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