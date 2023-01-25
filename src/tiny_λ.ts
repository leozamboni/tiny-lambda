const File: { in: string; out: string; err: string } = {
  in: process.argv[2],
  out: "",
  err: "",
};
enum T {
  λ = 1,
  dot,
  op,
  sym,
  lb,
  numb,
  comma,
  colon,
  assig,
  lparen,
  rparen,
  call,
}
const Err = {
  unex_token: (token) => `Unexpected ${token.k} in line ${token.l}\n`,
  unex_eof: () => `Unexpected EOF\n`,
};
type Token_t = { k: string; t: T; l: number };
const Token = {
  create: (k, t, l): Token_t => Object.create({ k, t, l }),
  type: (k): T => {
    if (/[0-9]/.test(k)) return T.numb;
    switch (k) {
      case "+":
      case "-":
      case "*":
      case "/":
        return T.op;
      case ".":
        return T.dot;
      case ":":
        return T.colon;
      case ",":
        return T.comma;
      case "λ":
        return T.λ;
      case "(":
        return T.lparen;
      case ")":
        return T.rparen;
      case "\n":
        return T.lb;
      default:
        return T.sym;
    }
  },
};
const Scanner = {
  i: 0,
  l: 0,
  t: 0,
  k: "",
  token: {} as Token_t,
  inc: () => Scanner.i++,
  dec: () => Scanner.i--,
  isEOF: () => !Boolean(File.in[Scanner.i]),
  sym: () => {
    let val = "";
    do {
      if (File.in[Scanner.i] !== " ") {
        val += File.in[Scanner.i];
      }
      Scanner.inc();
    } while (File.in[Scanner.i] && Token.type(File.in[Scanner.i]) === T.sym);
    Scanner.dec();
    return val;
  },
  assig: () => {
    if (File.in[Scanner.i + 1] === "=") {
      Scanner.inc();
      Scanner.t = T.assig;
      return ":=";
    }
    return Scanner.k;
  },
  call: () => {
    if (File.in[Scanner.i + 1] === "(") {
      Scanner.t = T.call;
    }
    return Scanner.k;
  },
  scan: () => {
    if (Scanner.isEOF()) return null;
    Scanner.k = File.in[Scanner.i];
    if (Scanner.k === " ") {
      Scanner.inc();
      return Scanner.scan();
    }
    Scanner.t = Token.type(Scanner.k);
    switch (Scanner.t) {
      case T.colon:
        Scanner.k = Scanner.assig();
        break;
      case T.sym:
        Scanner.k = Scanner.sym();
        Scanner.k = Scanner.call();
        break;
      case T.lb:
        Scanner.l++;
        break;
    }
    Scanner.token = Token.create(Scanner.k, Scanner.t, Scanner.l);
    Parser.out.push(Scanner.token);
    return Scanner.token;
  },
};
const Ast = {
  λ: (token) => {
    token = N(token, T.λ);
    token = N(token, T.sym);
    if (token?.t === T.comma) {
      token = N(token, T.comma);
    } else {
      token = N(token, T.dot);
    }
    return token;
  },
  exp: (token) => {
    token = N(token, T.sym);
    if (token?.t === T.op) {
      token = N(token, T.op);
      token = N(token, T.sym);
    } else if (token?.t === T.assig) {
      token = N(token, T.assig);
    }
    return token;
  },
  args: (token) => {
    token = N(token, T.lparen);
    token = N(token, T.sym);
    token = N(token, T.rparen);
    if (token?.t === T.lparen) {
      token = Ast.args(token);
    }
    return token;
  },
  call: (token) => {
    token = N(token, T.call);
    token = Ast.args(token);
    return token;
  },
};
const Parser = {
  out: [] as Token_t[],
  parse: (token, type) => {
    if (!token) {
      File.err += Err.unex_eof();
    } else if (token?.t !== type) {
      File.err += Err.unex_token(token);
    }
    Scanner.inc();
    return Scanner.scan();
  },
  run: (token) => {
    if (!token || Scanner.isEOF()) return;
    switch (token?.t) {
      default:
        token = undefined;
        Scanner.inc();
        break;
      case T.λ:
        token = Ast.λ(token);
        break;
      case T.sym:
        token = Ast.exp(token);
        break;
      case T.call:
        token = Ast.call(token);
        break;
    }
    if (!token) token = Scanner.scan();
    Parser.run(token);
  },
};
const N = Parser.parse;
const Gen = {
  i: 0,
  inc: () => Gen.i++,
  checkBehind: (i: number): Token_t | undefined => Parser?.out[Gen.i - i],
  checkAhead: (i: number): Token_t | undefined => Parser?.out[Gen.i + i],
  run: () => {
    if (!Parser.out[Gen.i]) return;
    switch (Parser.out[Gen.i].t) {
      case T.numb:
      case T.op:
      case T.lb:
      case T.lparen:
      case T.rparen:
      case T.sym:
      case T.call:
        File.out += Parser.out[Gen.i].k;
        break;
      case T.λ:
        if (Gen.checkBehind(1)?.t !== T.assig) {
          File.out += "=>";
        }
        break;
      case T.assig:
        File.out += "=";
        break;
      case T.dot:
        File.out += "=>";
        break;
      case T.comma:
        if (Gen.checkAhead(1)?.t !== T.λ) {
          File.out += ",";
        }
        break;
    }
    Gen.inc();
    Gen.run();
  },
};
(() => {
  Parser.run(Scanner.scan());
  Gen.run();
  console.log(File);
})();
export {};
