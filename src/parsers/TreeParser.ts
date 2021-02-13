import lexTree, { CLOSE, DOT, NIL, OPEN, TOKEN } from "./lexers/TreeLexer";
import { SyntaxException } from "../exceptions/SyntaxException";

export type BinaryTree = {
	left: BinaryTree,
	right: BinaryTree,
} | null;

function _expectToken(token : TOKEN|undefined, ...expected: TOKEN[]) : TOKEN {
	//No tokens left
	if (token === undefined) throw new SyntaxException(`Unexpected end of statement: Expected '${DOT}'`);
	//Wrong token received
	if (expected.indexOf(token) === -1) {
		let expectedString: string;
		if (expected.length === 1) expectedString = `'${expected[0]}'`;
		else expectedString = `one of ['${expected.join("', '")}']`;
		throw new SyntaxException(`Unexpected token: Expected ${expectedString} but got '${token}'`);
	}
	//Return the token
	return token;
}

function _tokensToTree(tokenList: TOKEN[]) : BinaryTree {
	//Get the first token in the list
	const token : TOKEN|undefined = tokenList.shift();
	//Treat empty string as `nil`
	if (token === undefined) return null;
	//Require the first token to be '<' or 'nil'
	_expectToken(token, OPEN, NIL);

	//Of format "OPEN [TREE] DOT [TREE] CLOSE" ("<nil.nil>")
	if (token === OPEN) {
		//Parse the left tree
		const left : BinaryTree = _tokensToTree(tokenList);

		//Check for the dot separating the subtrees
		_expectToken(tokenList.shift(), DOT);

		//Parse the right tree
		const right : BinaryTree = _tokensToTree(tokenList);

		//Check the opening symbol has a matching closing symbol
		_expectToken(tokenList.shift(), CLOSE);

		//Return the created tree
		return {
			left: left,
			right: right,
		};
	}
	//Otherwise `nil` - represented by `null`
	return null;
}

export default function parseTree(str: string) : BinaryTree {
	//Run the lexer to convert to a token list
	const tokenList: TOKEN[] = lexTree(str);
	//Parse into a binary tree
	const tree : BinaryTree = _tokensToTree(tokenList);

	//Shouldn't be any unparsed tokens
	if (tokenList.length > 0) {
		throw new SyntaxException(`Unexpected token: Expected end of statement but got '${tokenList.shift()}'`);
	}
	//Return the tree
	return tree;
}