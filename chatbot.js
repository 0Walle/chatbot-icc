let Chatbot = {
	stack: [],
	state: null,
	subject: 'Início'
}

function list_choice(list) {
	return list[Math.floor(list.length * Math.random())]
}

function options_reply(alist) {
	return (content) => {
		let match;
		for (const [re, state] of alist) {
			if (match = re.exec(content)) {
				return state(match);
			}
		}
		return "Não consegui entender o que disse :("
	}
}

function change_to(state, subject, reply) {
	Chatbot.stack.push([Chatbot.state, Chatbot.subject])
	Chatbot.state = state
	Chatbot.subject = subject
	return reply
}

function go_back() {
	const ret = Chatbot.stack.pop();
	if (ret) {
		Chatbot.state = ret[0]
		Chatbot.subject = ret[1]
	}
	return `Você voltou para ${Chatbot.subject}`
}

function thread(subject, alist, end_with) {
	if (alist.length == 1) {
		Chatbot.state = end_with
		return alist[0]
	}
	if (subject != Chatbot.subject) {
		Chatbot.stack.push([Chatbot.state, Chatbot.subject])
	}
	Chatbot.subject = subject;
	Chatbot.state = (content) => {
		if (/^(continuar|prosseguir|hm+|tá|ta|ok|blz|beleza|tendi|entendo|entendi|certo|vamos|sim|legal|foda|bora|verdade|vdd)/i.exec(content)) {
			return thread(subject, alist.slice(1), end_with);
		} else if (/^(cancelar|parar)[.]?/i.exec(content)) {
			const ret = Chatbot.stack.pop();
			if (ret) {
				Chatbot.state = ret[0]
				Chatbot.subject = ret[1]
			}
			return `Você voltou para ${Chatbot.subject}`
		}
		return "Não consegui entender o que disse, se quiser sair digite 'cancelar' ou 'parar'."
	}
	return alist[0]
}

const bot = options_reply([
	[/^bom dia[.!]?/i, (match) => list_choice([`Olá, bom dia.`, `Oi, bom dia.`, `Bom dia.`,])],
	[/^boa (tarde|noite)[.!]?/i, (match) => list_choice([`Boa ${match[1]}.`])],
	[/^(oi|ola|olá)[.!]?/i, (match) => list_choice([`Oi.`, `Olá.`])],
	[/^(começar|comecar|bora|vamos? (lá|la)?)[.]?/i, (match) => thread("Introdução", [
		"Então vamos começar a falar de compiladores, interpretadores e linguagens de programação!",
		"Tenho 3 temas para falar:\na) Lexing e Parsing\nb) Optimizações\nc) Paradigmas de programação\nd) Aplicações\ne) Saber mais"
	], compiler)],
	[/^(ajuda|tutorial|\?)[.]?/i, (match) => thread("Ajuda", [
		"É bom saber algumas coisas sobre mim para ter melhor interação.\nPara prosseguir mensagens você pode escrever coisas como 'ok', 'blz', 'prosseguir', 'continuar' etc.",
		"Ótimo, as vezes você terá opções de letra para escolher como por exemplo:\na) Continuar o tutorial\nb) Sair do tutorial\n\nPara escolher apenas envie a letra escolhida."
	], ajuda_options)],
])

const ajuda_options = options_reply([
	[/^a$/i, (match) => "Continuando, há momentos que você poderá fazer perguntas como 'O que é ***' ou 'Para que serve ***', sinta-se livre para fazer essas perguntas. Escreva 'encerrar' para sair do tutorial."],
	[/^b$/i, (match) => "Tem certeza? escreva 'encerrar' para acabar o tutorial."],
	[/^(encerrar|voltar)/i, (match) => go_back()],
])

const compiler = options_reply([
	[/^a$/i, (match) => thread("Lexers e Parsers", [
		"Então vamos falar de parsers e lexers.",
		"Lexers e Parsers são algoritmos usados para transformar um texto em uma estrutura de dados, eles são usados em varias situações que geralmente não são nem percebidas.\nPara ver mais sobre eles faça perguntas como 'o que é' e 'para que serve', quando estiver satisfeito escreva 'sair' para ver outras coisas."
	], lex_parse)],
	[/^b$/i, (match) => thread("Optimizações", [
		"Optimizações são muito importantes em linguagens de programação.",
		"A maneira que o computador funciona nem sempre é do mesmo que nós esperamos. Por exemplo em vez de dividir um numero inteiro por 4 é mais rápido mover o numero 2 bits para a esquerda.",
		"Compiladores fazem essas optimizações para que o código aproveite mais da capacidade do computador, sendo assim mais eficiente.",
		"Você pode explorar alguns tipos comuns de optimizações agora:\na) Loop optimization\nb) Register alocation\nc) Instruction Scheduling\nd) Tail Call Optimization\ne) Bounds Check Elimination"
	], optimize)],
	[/^c$/i, (match) => thread("Paradigmas", [
		"Paradigmas de programação são jeitos de classificar uma linguagem de programação baseado no que elas oferecem, uma linguagem pode usar vários paradigmas ao mesmo tempo.",
		"Exemplos de paradigmas comuns:\na) Imperativo\nb) Declarativo\nc) Reflexivo\nd) Concorrente"
	], paradigm)],
	[/^d$/i, (match) => "Quais são as aplicações de saber conceitos de linguagens de programação?\n\nUma bem aparente é que conhecendo melhor as linguagens de programação podemos programar melhor, e sabendo como a linguagem vai ser entendida pela máquina também ajuda a saber melhor o que está fazendo.\nOutra utilidade de saber sobre isso é poder criar suas próprias linguagens, não precisa ser uma linguagem completa, pois atualmente são muito comum DSL (Domain Specific Language) que são linguagem voltadas para uma tarefa especifica."],
	[/^e$/i, (match) => "Onde posso aprender mais sobre conceitos de linguagens de programação? Lugares que recomendo:\n\nO livro <https://craftinginterpreters.com/> ensina como fazer um interpretador e junto disso traz muitas informações de várias linguagens de programação diferentes.\nLectures sobre design de compiladores da universidade de stanford tem muitas informações úteis para design de compiladores <https://web.stanford.edu/class/archive/cs/cs143/cs143.1128/>"],
	[/^voltar/i, (match) => go_back()],
])

const lex_parse = options_reply([
	[/o que (é|e) (um |o )?parser/i, (match) => thread("O que é parser", [
		"O parser transforma uma lista de tokens (veja o que é lexer para ver mais) em uma estrutura de dados, muitas vezes essa estrutura é chamada de Abstract Syntax Tree (AST).",
		"O parser usa o lexer para conseguir a lista de tokens do texto",
		`Você pode ver um parser de expressões matemáticas formando uma AST digitando 'parse <expressão>'\nEx.:\nparse 23 + 32 * 7`
	], lex_parse)],
	[/o que (é|e) (um |o )?lexer/i, (match) => thread("O que é lexer", [
		"O lexer é responsável por transformar o texto em unidades chamadas tokens que são como \"palavras\" numa linguagem natural.",
		"O lexer é usado em conjunto com um parser.",
		`Você pode ver o trabalho de um lexer de expressões matemáticas digitando 'lexer <expressão>'\nEx.:\nlexer 23 + 32 * 7`
	], lex_parse)],
	[/pa?ra que (serve|usa) (um |o )?lexer/i, (match) => thread("Para que serve o lexer", [
		"Lexers são usados em conjunto com parsers, eles estão envolvidos em qualquer coisa que envolve transformar texto em uma estrutura de dados.",
		"Exemplos disso são: ler arquivos JSON, compilar/interpretar linguagens de programação, syntax highlight em editores de texto.",
		"É bem provável que você não vai precisar implementar um lexer ou parser, mas é bom saber que eles sempre são usados quando se programa.",
	], lex_parse)],
	[/pa?ra que (serve|usa) (um |o )?parser/i, (match) => thread("Para que serve o parser", [
		"Parsers são usados em conjunto com lexers, eles estão envolvidos em qualquer coisa que envolve transformar texto em uma estrutura de dados.",
		"Exemplos disso são: ler arquivos JSON, compilar/interpretar linguagens de programação, syntax highlight em editores de texto.",
		"É bem provável que você não vai precisar implementar um lexer ou parser, mas é bom saber que eles sempre são usados quando se programa.",
	], lex_parse)],
	[/lexer (.+)/i, (match) => math_lex(match[1])],
	[/parse (.+)/i, (match) => math_parse(match[1])],
	[/^(voltar|sair)/i, (match) => go_back()],
])

const optimize = options_reply([
	[/^a$/i, (match) => thread("Loop Optimization", [
		"Loops são coisas que repetem, e coisas que repetem precisam ser rápidas.",
		"Por isso foram criados vários tipos de optimizações envolvendo eles, essas optimizações consistem principalmente de transformar coisas que parecem constantes em constantes e prever repetições antes de acontecerem.\n\nVocê pode ver outra opção agora.",
	], optimize)],
	[/^b$/i, (match) => thread("Register Alocation", [
		"Alocação de registradores acontece na hora de transformar código em Assembly.",
		"A alocação de registradores busca usar a menor quantidade de registradores da maquina, porque o numero de registradores é muitas vezes limitado e eles são usados para múltiplos propósitos.",
		"Fazer isso também requer saber usar a memoria de maneira eficiente quando há falta de registradores.\n\nVocê pode ver outra opção agora."
	], optimize)],
	[/^c$/i, (match) => thread("Instruction Scheduling", [
		"Instruction Scheduling é uma optimização que veio com os processadores modernos, esses processadores podem ler um instrução a frente da que está executando e executar coisas em menos ciclos.",
		"Agendamento de instruções são técnicas que tentam aproveitar disso ao máximo.",
		"Isso é feito alterando a ordem de instruções do processador para evitar ciclos parados sem mudar o funcionamento do código.\n\nVocê pode ver outra opção agora."
	], optimize)],
	[/^d$/i, (match) => thread("Tail Call Optimization", [
		"Tail call é uma optimização muito importante para linguagens de programação funcional.",
		"Chamar funções ocupa espaço na stack do processador, tail call optimization evita que esse espaço seja alocado em situações especiais.",
		"Com isso funções recursivas funcionam da mesma forma que loops sem perigo de causar um stack overflow.\n\nVocê pode ver outra opção agora."
	], optimize)],
	[/^e$/i, (match) => thread("Bounds Check Elimination", [
		"Bounds Check Elimination é uma técnica para eliminar a necessidade de checar o tamanho de arrays ou listas.",
		"Isso é possível quando o tamanho da lista ou array é conhecido no tempo de compilação e assim é possível saber se acessos a ele são válidos ou não.\\Você pode ver outra opção agora."
	], optimize)],
	[/^voltar/i, (match) => go_back()],
])

const paradigm = options_reply([
	[/^a$/i, (match) => thread("Imperativo", [
		"Em programação imperativa você escreve o programa como uma série de ordens para o computador, há dois paradigmas principais derivados dele.",
		"Procedural:\n\nO paradigma procedural deriva da programação estruturada, nele as instruções ficam em procedimentos",
		"Com isso código pode ser reutilizado, fica mais organizado e modular.",
		"Orientação a objetos:\n\nA orientação em objetos tem como propósito juntar dados e instruções na forma de um objeto e fazer um objeto interagir com outro por mensagens (ou métodos).",
		"Muitas vezes também associado ao polimorfismo por herança ele permite modularização do código e organização fácil para projetos.",
	], paradigm)],,
	[/^b$/i, (match) => thread("Declarativo", [
		"Em programação declarativa você descreve o que o programa faz, há dois paradigmas principais derivados dele.",
		"Funcional:\n\nEm programação funcional as funções são elementos de primeira classe e todas retornam um valor assim como a definição matemática, ela também valoriza a imutabilidade.",
		"Esse paradigma divide o programa em varias funções pequenas tornando-o muito modular e poder usar funções como argumento garante muita flexibilidade e composição. Por conta da imutabilidade também é comumente usado junto a programação concorrente.",
		"Logico:\n\nProgramação lógica é baseada em logica formal, o programa é escrito como uma sequencia de sentenças lógicas.",
		"Ele é vantajoso para tratar de coisas com logica complexa ou inteligências artificiais."
	], paradigm)],
	[/^c$/i, (match) => "O paradigma de programação reflexivo permite que a linguagem trate de coisas dela mesmo enquanto o código executa."],
	[/^d$/i, (match) => "Em programação concorrente o código não é executado em sequencia, então pode ter duas funções executando ao mesmo tempo ou que aparentam estar, é útil para tarefas que podem ser realizadas em paralelo, como a verificação de dados de vários usuários num banco de dados."],
	[/^voltar/i, (match) => go_back()],
])

Chatbot.state = bot;

function chatbot_reply(content) {
	return Chatbot.state(content)
}

var TokenKind;
(function (TokenKind) {
    TokenKind[TokenKind["Paren"] = 1] = "Paren";
    TokenKind[TokenKind["Op"] = 2] = "Op";
    TokenKind[TokenKind["Number"] = 3] = "Number";
})(TokenKind || (TokenKind = {}));
const op_regex = /^[+*-/^=]/;
const parens_regex = /^[()]/;
const num_regex = /^(\d+)(\.\d+)?/;
function consume_token(reader) {
    if (reader.lk == undefined)
        return;
    reader.source = reader.source
        .slice(reader.lk.advance)
        .replace(/^\s+/, '');
}
function peek_token(reader) {
    const text = reader.source;
    const tokens_list = [
        [parens_regex, TokenKind.Paren],
        [op_regex, TokenKind.Op],
        [num_regex, TokenKind.Number],
    ];
    for (const [re, kind] of tokens_list) {
        const match = re.exec(text);
        if (match) {
            const tk = {
                kind,
                val: match[0],
                advance: match[0].length
            };
            reader.lk = tk;
            return tk;
        }
    }
    return null;
}

const operator = {
    '+': { prec: 2, right: false },
    '-': { prec: 2, right: false },
    '*': { prec: 3, right: false },
    '/': { prec: 3, right: false },
    '^': { prec: 4, right: false },
};
function parse_binary(reader, lhs, min_prec) {
    let lk = peek_token(reader);
    while (lk && lk.kind == TokenKind.Op && operator[lk.val].prec >= min_prec) {
        let op = lk.val;
        consume_token(reader);
        let rhs = parse_primary(reader);
        if (typeof rhs == 'string') {
            return rhs;
        }
        lk = peek_token(reader);
        while (lk && lk.kind == TokenKind.Op && (operator[lk.val].prec > operator[op].prec)) {
            rhs = parse_binary(reader, rhs, operator[lk.val].prec);
            if (typeof rhs == 'string') {
                return rhs;
            }
            lk = peek_token(reader);
        }
        lhs = { kind: TokenKind.Op, op: op, lhs: lhs, rhs: rhs };
    }
    return lhs;
}
function parse_primary(reader) {
    let tk = peek_token(reader);
    if (!tk) {
        return `Unexpected token or end of input parsing primary expression: "${reader.source}"`;
    }

    if (tk.kind == TokenKind.Op && tk.val == '-') {
        consume_token(reader);
        const lhs = parse_primary(reader);
        if (typeof lhs == 'string') {
            return lhs;
        }
        return { kind: TokenKind.Op, op: 'neg', lhs: lhs };
    }
    if (tk.kind == TokenKind.Paren && tk.val == '(') {
        return parse_paren(reader);
    }
    if (tk.kind != TokenKind.Number) {
        return "Invalid Expression, expected number";
    }
    consume_token(reader);
    let lhs = tk.kind == TokenKind.Number ?
        { kind: TokenKind.Number, val: parseFloat(tk.val) }
        : { kind: TokenKind.Var, val: tk.val };
    tk = peek_token(reader);
    
    while (tk && tk.kind == TokenKind.Paren && tk.val == '(') {
        const rhs = parse_paren(reader);
        if (typeof rhs == 'string') {
            return rhs;
        }
        lhs = { kind: TokenKind.Op, op: '*', lhs: lhs, rhs: rhs };
        tk = peek_token(reader);
    }
    return lhs;
}
function parse_paren(reader) {
    consume_token(reader);
    let lhs = parse_expression(reader);
    if (typeof lhs == 'string') {
        return lhs;
    }
    let tk = peek_token(reader);
    if (tk && tk.kind == TokenKind.Paren && tk.val == ')') {
        consume_token(reader);
        return lhs;
    }
    return "Expected `,` or `)`";
}
function parse_expression(reader) {
    const first = parse_primary(reader);
    if (typeof first == 'string') {
        return first;
    }
    const result = parse_binary(reader, first, 0);
    return result;
}

function print_ast(ast, depth = 0) {
	if (ast == undefined) return "⠀⠀⠀".repeat(depth) + `-`
	if (ast.kind == TokenKind.Op) {
		return "⠀⠀⠀".repeat(depth) + `[${ast.op}]:\n${print_ast(ast.lhs, depth+1)}\n${print_ast(ast.rhs, depth+1)}`
	}
	return "⠀⠀⠀".repeat(depth) + `${ast.val}`
}

function math_parse(text) {
	let reader = {
		source: text.trim(),
		lk: null
	}
	let result = parse_expression(reader);
	return print_ast(result)
}

function math_lex(text) {
	let reader = {
		source: text.trim(),
		lk: null
	}
	let list = [];
	let tk = null;
	while(tk = peek_token(reader)) {
		list.push(tk)
		consume_token(reader)
	}
	return "Lista de tokens dessa expressão:\n" + list.map(i => `${TokenKind[i.kind]}: ${i.val}`).join('\n')
}
