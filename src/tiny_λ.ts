const File: { in: string; out: string; err: string } = {
  in: "λx.λy.x+",
  out: "",
  err: "",
};
enum T { λ = 1, dot, op, sym, lb, }
const Err = { 
  unex_token: (token) => `Unexpected ${token.k} in line ${token.l}\n`,
  unex_eof: () => `Unexpected EOF\n`
}
type Token_t = { k: string; t: T; l: number; };
const Token = {
  create: (k, t, l): Token_t => Object.create({ k, t, l }),
  type: (k): T => {
    switch (k) {
      case "+":
      case "-":
      case "*":
      case "/": return T.op;
      case ".": return T.dot;
      case "λ": return T.λ;
      case "\n": return T.lb;
      default: return T.sym;
    }
  },
};
const Scanner = {
  i: 0,
  l: 0,
  t: 0,
  k: '',
  inc: () => Scanner.i++,
  dec: () => Scanner.i--,
  isEOF: () => !Boolean(File.in[Scanner.i]),
  sym: () => {
      let val = "";
      do {
          val += Scanner.k;
          Scanner.inc();
          Scanner.k = File.in[Scanner.i];
      } while (Scanner.k && Token.type(Scanner.k) === T.sym);
      Scanner.dec();
      return val;
  },
  scan: () => {
    if (Scanner.isEOF()) return null
    Scanner.k = File.in[Scanner.i]
    Scanner.t = Token.type(Scanner.k);
    switch (Scanner.t) {
        case T.sym:
            Scanner.k = Scanner.sym()
            break
        case T.lb:
            Scanner.inc();
            Scanner.scan();
            break;
    }
    return Token.create(Scanner.k, Scanner.t, Scanner.l);
  },
};
const Ast = {
  λ: (token) => {
      token = N(token, T.λ);
      token = N(token, T.sym);
      return N(token, T.dot);
  },
  exp: (token) => {
      token = N(token, T.sym);
      if (token?.t === T.op) {
          token = N(token, T.op);
          return N(token, T.sym);
      }
      return token
  }
};
const Parser = {
  parse: (token, type) => {
    if (!token) {
      File.err += Err.unex_eof()
    }
    else if (token?.t !== type) {
      File.err += Err.unex_token(token)
    }
    Scanner.inc();
    return Scanner.scan();
},
  run: (token) => {
    if (!token || Scanner.isEOF()) return;
    switch (token?.t) {
        default: token = undefined; Scanner.inc(); break
        case T.λ: token = Ast['λ'](token); break;
        case T.sym: token = Ast['exp'](token); break;
    }
    if (!token) token = Scanner.scan();
    Parser.run(token);
}
};
const N = Parser.parse;
Parser.run(Scanner.scan());
console.error(File.err);

export {};
