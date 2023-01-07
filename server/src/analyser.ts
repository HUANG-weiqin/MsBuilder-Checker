import { integer } from 'vscode-languageserver';

function Lexer(code:string) {
	const pattern = /<(.|\n)*?>/g
	let tokens = new Array()
	let m: RegExpExecArray | null;
	while (m = pattern.exec(code)) {
		let res = new Token(m.index, m[0], m.index + m[0].length)
		if (res.type != 0) {
			tokens.push(res)
		}
	}
	return tokens
}

const rule = require('../rule.json')

class Token {
	start:integer
	raw_string:string
	end:integer
	type:integer
	name:string
	constructor(start:integer, raw_string:string, end:integer) {
		this.start = start
		this.raw_string = raw_string
		this.end = end
		this.name = this._get_name()
		this.type = this._get_type()
	}

	_get_name() {
		let patten = /\b[a-z]*\b/gi
		let res = patten.exec(this.raw_string)
		if(res){
			return res[0]
		}
		return "???"
	}	

	_get_type() {
		let comment = /<!--.*-->/g
		let end = /<\//g
		let single = /\/>/g

		if (comment.test(this.raw_string)) {
			return 0
		}
		else if (single.test(this.raw_string)) {
			return 3
		}
		else if (end.test(this.raw_string)) {
			return 2
		}
		else {
			return 1
		}
	}

}

class AstNode {
	token:Token|undefined
	subNodes:Array<AstNode>
	constructor(){
		this.token = undefined
		this.subNodes = new Array()
	}

	generate(TokenList:Array<Token>):Array<Token> {
		this.token = TokenList.shift()
		
		this.check_open()

		if(this.token === undefined){
			return TokenList
		}

		if (this.token.type == 3) {
			return TokenList
		}

		while (TokenList.length > 0) {
			if (TokenList[0].type == 2) {
				break
			}
			let sub = new AstNode()
			try {
				TokenList = sub.generate(TokenList)
			}
			catch (err:any) {
				if(sub.token!==undefined)
					err.position.push({
						start: sub.token.start,
						end: sub.token.end,
						msg: "Bad sub node",
					})
				throw err
			}

			this.check_sub_node(sub)
		}

		return this.check_close(TokenList)
	}

	check_sub_node(subNode:AstNode) {
		if(subNode === undefined || this.token === undefined || subNode.token === undefined){
			return
		}

		if (this.token.name in rule && !rule[this.token.name].includes(subNode.token.name)) {
			let err = {
				msg: "bad node",
				name: subNode.token.name,
				position: [
					{
						start: this.token.start,
						end: this.token.end,
						msg: " sub node <" +subNode.token.name+ ">  not allowed !",
					},
					{
						start: subNode.token.start,
						end: subNode.token.end,
						msg: "this should not be here ",
					},
				]
			}
			throw err
		}

		this.subNodes.push(subNode)
	}

	check_open() {
		if(this.token === undefined){
			return
		}
		if (this.token.type == 2) {
			let err = {
				msg: "should not be close",
				name: this.token.name,
				position: [{
					start: this.token.start,
					end: this.token.end,
					msg: "should not be close"
				}]
			}
			throw err
		}
	}

	check_close(TokenList:Array<Token>):Array<Token> {
		if(this.token === undefined){
			return TokenList
		}
		if (TokenList.length == 0) {
			let err = {
				msg: "not yet close ",
				name: this.token.name,
				position: [{
					start: this.token.start,
					end: this.token.end,
					msg: "not yet close "
				}]
			}
			throw err
		}
		else {
			let c = TokenList.shift()
			if(c === undefined){
				return TokenList
			}
			if (c.name != this.token.name) {
				let err = {
					msg: "not the same close name",
					name: c.name,
					position: [{
						start: c.start,
						end: c.end,
						msg: "not the same close name"
					}]
				}
				throw err
			}
		}
		return TokenList
	}
}

export function check(code:string):any|undefined{
	let res = Lexer(code)
	let node = new AstNode()
	try{
		node.generate(res)
	}
	catch(e){
		return e
	}
	return undefined;
}