import ohm from "ohm-js"
import fs from "fs"

const grammar = ohm.grammar(fs.readFileSync('Bella.ohm'))

const memory = {
  π: { type: "NUM", value: Math.PI, access: "RO" },
  sin: { type: "FUNC", value: Math.sin, paramCount: 1, access: "RO" },
  cos: { type: "FUNC", value: Math.cos, paramCount: 1, access: "RO" },
  sqrt: { type: "FUNC", value: Math.sqrt, paramCount: 1, access: "RO" },
  hypot: { type: "FUNC", value: Math.hypot, paramCount: 2, access: "RO" },
  print: { type: "PROC", value: args => console.log(args), paramCount: 1, access: "RO" },
}
const state = {
  inFunctionDeclaration: false,
  FunctionParameters:[]
}

function ensure(condition, message, node) {
  if (!condition) throw new Error(`${node.source.getLineAndColumnMessage()}${message}`)
}


const interpreter = grammar.createSemantics().addOperation("eval", {
  Program(statements) {
    for (const statement of statements.children) {
      statement.eval()
    }
  },
  Statement_vardec(_let, identifier, _equal, expression, _semicolon){
    const entity = memory[identifier.sourceString]
    ensure(!entity || entity?.access === "RO", `${identifier.sourceString} not writable`, identifier)
    memory[identifier.sourceString] ={ type: "NUM", value: expression.eval(), access:"RW"}
  },
  Statement_fundec(_function, identifier, _leftParen, parameters, _rightParen, _equal, expression, _semicolon){
    const entity = memory[identifier.sourceString]
    ensure(!entity || entity?.access === "RO", `${identifier.sourceString} not writable`, identifier)
    state.inFunctionDeclaration = true
    let p = parameters.eval()
    state.FunctionParameters = p
    console.log(p)
    let func = new Function(p, `return ${String(expression.eval())}`)
    let f = {
      type: "FUNC",
      value: func,
      paramCount: p.length
    }
    memory[identifier.sourceString] = f
    state.inFunctionDeclaration = false
    state.FunctionParameters = []
  },
  Statement_assign(identifier, _equal, expression, _semicolon){
    const entity = memory[identifier.sourceString]
    ensure(entity, "Cannot assign to uninitialized identifier", identifier)
    ensure(entity && entity?.type === "NUM" && entity?.access === "RW", `${identifier.sourceString} not writable`, identifier)
    memory[identifier.sourceString] =  { type: "NUM", value: expression.eval(), access:"RW"}
  },
  Statement_print(_print, expression, _semicolon) {
    memory.print.value(expression.eval())
  },
  Statement_while(_while, expression, block){
    let loop = true
    while (loop) {
      let e = expression.eval()
      ensure(e === 0 || e === 1, "Must use truthy falsey expression representation", expression)
      if (e === 1) {
        block.eval()
      } else {
        loop = false;
      }
    }
  },
  Block(_leftCurlyBrace, statements, _rightCurlyBrace) {
    for (const statement of statements.children) {
      statement.eval()
    }
  },
  Exp_unary(_negation, expression){
    let e = expression.eval()
    switch (_negation.sourceString){
      case "!":
        if (state.inFunctionDeclaration && isNaN(e)) {
          return `${e} === 0? 1 : 0`
        } else {
        // This is the case of boolean truthy falsey type values. 
        // If the value is 1 or 0 (what true and false end up as)
        // The it toggles between 1 and 0. Otherwise it will throw an error
        ensure(e === 1 || e === 0, `${e} is not a truthy or falsey variable`, expression)
        return e === 0? 1 : 0
        }
      case "-":
        return (state.inFunctionDeclaration && isNaN(e))? `-${e}`: -e;

    }
    if (state.inFunctionDeclaration === true && isNaN(e)) {
      return
    }

    return -expression.eval()
  },
  Exp_ternary(expression1, _question, expression2, _colon, expression3){
    let e1 = expression1.eval()
    let e2 = expression2.eval()
    let e3 = expression3.eval()
    if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2) || isNaN(e3))) {
      return `${e1} === 1? ${e2} : ${e3}`
    } else {
      ensure(e1 === 1 || e1 === 0, `${e1} is not a truthy or falsey variable`, expression1)
      return e1 === 1? e2 : e3
    }
  }, 
  Exp(expression){
    return expression.eval()
  }, 
  Exp1_binary(expression1, _orOp, expression2){
    let e1 = expression1.eval()
    let e2 = expression2.eval()
    if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))){
      return `(${e1} === 1 || ${e2} === 1)? 1 : 0`
    } else {
      return e1 === 1 || e2 === 1? 1 : 0
    }
  }, 
  Exp1(expression){
    return expression.eval()
  },
  Exp2_binary(expression1, _andOp, expression2){
    let e1 = expression1.eval()
    let e2 = expression2.eval()
    if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))){
      return `(${e1} === 1 && ${e2} === 1)? 1 : 0`
    } else {
      return e1 === 1 && e2 === 1? 1 : 0
    }
  },
  Exp2(expression){
    return expression.eval()
  },
  Exp3_binary(expression1, _binOp, expression2){
    let e1 = expression1.eval()
    let e2 = expression2.eval()
    switch(_binOp.sourceString) {
      case "<=":
        if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))) {
          return `${e1} <= ${e2} ? 1 : 0`
        } else {
          return e1 <= e2? 1 : 0
        }
      case "<":
        if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))) {
          return `${e1} < ${e2} ? 1 : 0`
        } else {
          return e1 < e2 ? 1 : 0
        }
      case "==":
        if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))) {
          return `${e1} === ${e2}? 1 : 0`
        } else {
          return e1 === e2? 1 : 0
        }
      case "!=":
        if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))) {
          return `${e1} !== ${e2}? 1 : 0`
        } else {
          return e1 !== e2? 1 : 0
        }
      case ">=":
        if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))) {
          return `${e1} >= ${e2}? 1 : 0`
        } else {
          return e1 >= e2? 1 : 0
        }
      case ">":
        if (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2))) {
          return `${e1} > ${e2}?1 : 0`
        } else {
          return e1 > e2? 1 : 0
        }
      default:
        return
    } 
  },
  Exp3(expression){
    return expression.eval()
  },
  Exp4_binary(expression1, _binOp, expression2){
    let e1 = expression1.eval()
    let e2 = expression2.eval()
    switch(_binOp.sourceString) {
      case "+":
        return (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2)))? 
          `${e1} + ${e2}`: e1 + e2
      case "-":
        return (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2)))? 
          `${e1} - ${e2}`: e1 - e2
      default:
        return
    } 
  },
  Exp4(expression){
    return expression.eval()
  },
  Exp5_binary(expression1, _binOp, expression2){
    let e1 = expression1.eval()
    let e2 = expression2.eval()
    switch(_binOp.sourceString) {
      case "*":
        return (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2)))?
          `${e1} * ${e2}`: e1 * e2
      case "/":
        return (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2)))?
          `${e1} / ${e2}`: e1 / e2
      case "%":
        return (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2)))?
        `${e1} % ${e2}`: e1 % e2
      default:
        return
    } 
  },
  Exp5(expression){
    return expression.eval()
  },
  Exp6_binary(expression1, _exponentiation, expression2){
    let e1 = expression1.eval();
    let e2 = expression2.eval();
    return (state.inFunctionDeclaration && (isNaN(e1) || isNaN(e2)))? `${e1} ** ${e2}`: e1 ** e2
  },
  Exp6(expression){
    return expression.eval()
  },
  Exp7(value){
    return value.eval()
  },
  Exp7_id(identifier){
    return identifier.eval()
  },
  Exp7_parens(_leftParen, expression, _rightParen){
    return expression.eval()
  },
  Call(identifier, _leftParen, args, _rightParen) {
    let entity = memory[identifier.sourceString]
    ensure (entity, `${identifier.sourceString} does not exist.`, identifier)
    ensure (entity.type === "FUNC", `${identifier.sourceString} is not a function.`, identifier)
    let a = args.eval()
    ensure (a.length === entity?.paramCount, `Invalid argument length`, args )
    return entity.value(...a)
  },
  Params(parameters) {
    return parameters.asIteration().children.map(c => c.sourceString)
  },
  Args(args) {
    return args.asIteration().children.map(c => c.eval())
  },
  true(_true) {
    return 1
  },
  false(_false) {
    return 0
  },
  num(digits, _dot, fractional, _e, _sign, exponentiation) {
    return Number(`${this.sourceString}`)
  },
  id(char, identifier) {
    let id = `${char.sourceString}${identifier.sourceString}`
    let entity = memory[id]
    ensure(entity || 
      (state.inFunctionDeclaration && state.FunctionParameters.includes(id)),
      `${id} is referenced, but has not been instantiated.`, char)
    return entity? entity.value : id
  },
})

const match = grammar.match(fs.readFileSync(process.argv[2]))

if (match.failed()) {
  console.error(match.message)
} else {
  interpreter(match).eval()
}