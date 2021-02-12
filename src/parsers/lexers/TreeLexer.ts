export type TOKEN_NIL = 'nil';
export type TOKEN_OPEN = '<';
export type TOKEN_CLOSE = '>';
export type TOKEN_DOT = '.';
export type TOKEN = TOKEN_NIL|TOKEN_OPEN|TOKEN_CLOSE|TOKEN_DOT;

export const NIL: TOKEN_NIL = 'nil';
export const OPEN: TOKEN_OPEN = '<';
export const CLOSE: TOKEN_CLOSE = '>';
export const DOT: TOKEN_DOT = '.';

/**
 * Lex a tree string into a token list
 * @param str	The string to lex
 */
export default function lexTree(str: string) : TOKEN[] {
	//Convert the string into a token list
	let tokens: TOKEN[] = [];
	while (str) {
		let found = false;
		//Check the start of the string against each of the tokens
		for (let token of [NIL, OPEN, CLOSE, DOT]) {
			if (str.substring(0, token.length) === token) {
				tokens.push(token);
				//Remove the token from the start of the string
				str = str.substr(token.length);
				//Mark the token as found
				found = true;
				break;
			}
		}
		//Error if the token didn't match
		if (!found) throw new Error(`Lexing error: Unrecognised value at '${str}'`);
	}

	return tokens;
}