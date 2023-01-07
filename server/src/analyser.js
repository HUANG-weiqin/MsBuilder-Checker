function Lexer(code) {
	const pattern = /<(.|\n)*?>/g
	tokens = new Array()
	while (m = pattern.exec(code)) {
		res = new Token(m.index, m[0], m.index + m[0].length)
		if (res.type != 0) {
			tokens.push(res)
		}
	}
	return tokens
}

const rule = require('../rule.json')

class Token {
	constructor(start, raw_string, end) {
		this.start = start
		this.raw_string = raw_string
		this.end = end
		this.name = this._get_name()
		this.type = this._get_type()
	}

	_get_name() {
		let patten = /\b[a-z]*\b/gi
		return patten.exec(this.raw_string)[0]
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
	generate(TokenList) {
		this.token = TokenList.shift()
		this.check_open()

		this.subNodes = new Array()

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
			catch (err) {
				err.position.push({
					start: this.token.start,
					end: this.token.end
				})
				throw err
			}

			this.check_sub_node(sub)
		}

		return this.check_close(TokenList)
	}

	check_sub_node(subNode) {
		if (this.token.name in rule && !rule[this.token.name].includes(subNode.token.name)) {
			let err = {
				msg: "this should not be here ",
				name: subNode.token.name,
				position: [
					{
						start: this.token.start,
						end: this.token.end
					},
					{
						start: subNode.token.start,
						end: subNode.token.end
					},
				]
			}
			throw err
		}

		this.subNodes.push(subNode)
	}

	check_open() {
		if (this.token.type == 2) {
			let err = {
				msg: "should not be close",
				name: this.token.name,
				position: [{
					start: this.token.start,
					end: this.token.end
				}]
			}
			throw err
		}
	}

	check_close(TokenList) {
		if (TokenList.length == 0) {
			let err = {
				msg: "not yet close ",
				name: this.token.name,
				position: [{
					start: this.token.start,
					end: this.token.end
				}]
			}
			throw err
		}
		else {
			let c = TokenList.shift()
			if (c.name != this.token.name) {
				let err = {
					msg: "not the same close name",
					name: c.name,
					position: [{
						start: this.token.start,
						end: this.token.end
					}]
				}
				throw err
			}
		}
		return TokenList
	}
}

export function check(code) {
	res = Lexer(code)
	node = new AstNode()
	try{
		node.generate(res)
	}
	catch(e){
		return e
	}
	return;
}