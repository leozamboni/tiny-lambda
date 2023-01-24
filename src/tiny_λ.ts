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
      case "λ":
        return T.λ;
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
      val += Scanner.k;
      Scanner.inc();
      Scanner.k = File.in[Scanner.i];
    } while (Scanner.k && Token.type(Scanner.k) === T.sym);
    Scanner.dec();
    return val;
  },
  scan: () => {
    if (Scanner.isEOF()) return null;
    Scanner.k = File.in[Scanner.i];
    Scanner.t = Token.type(Scanner.k);
    switch (Scanner.t) {
      case T.sym:
        Scanner.k = Scanner.sym();
        break;
      case T.lb:
        Scanner.l++;
        break;
    }
    Scanner.k = Scanner.k.replace(/\s+/g, "");
    Scanner.token = Token.create(Scanner.k, Scanner.t, Scanner.l);
    Parser.out.push(Scanner.token);
    return Scanner.token;
  },
};
const Ast = {
  λ: (token) => {
    token = N(token, T.λ);
    token = N(token, T.sym);
    token = N(token, T.dot);
    return token;
  },
  exp: (token) => {
    token = N(token, T.sym);
    if (token?.t === T.op) {
      token = N(token, T.op);
      token = N(token, T.sym);
    }
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
        token = Ast["λ"](token);
        break;
      case T.sym:
        token = Ast["exp"](token);
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
        if (!Gen.checkAhead(1) || Gen.checkAhead(1)?.t === T.lb) {
          File.out += `${Parser.out[Gen.i].k})`;
        } else if (Gen.checkBehind(1)?.t === T.sym) {
          File.out += `)(${Parser.out[Gen.i].k},`;
        } else {
          File.out += `${Parser.out[Gen.i].k},`;
        }
        break;
      case T.λ:
        if (!Gen.checkBehind(1) || Gen.checkBehind(1)?.t === T.lb) {
          File.out += "((";
        } else {
          File.out += ",";
        }
        break;
      case T.op:
        File.out += Parser.out[Gen.i].k;
        break;
      case T.lb:
        if (Gen.checkBehind(1)?.t === T.numb) {
          File.out += `\n`;
        } else {
          File.out += `)\n`;
        }
        break;
      case T.sym:
        if (!Gen.checkAhead(1) && Gen.checkBehind(1)?.t === T.dot) {
          File.out += `)=>${Parser.out[Gen.i].k})`;
        } else if (!Gen.checkAhead(1)) {
          File.out += `${Parser.out[Gen.i].k})`;
        } else if (Gen.checkBehind(1)?.t === T.dot) {
          File.out += `)=>${Parser.out[Gen.i].k}`;
        } else if (Gen.checkBehind(1)?.t !== T.λ) {
          File.out += Parser.out[Gen.i].k;
        }
        break;
      case T.dot:
        if (!Gen.checkAhead(1)) {
          File.out += `${Parser.out[Gen.i - 1].k}))`;
        } else {
          File.out += Parser.out[Gen.i - 1].k;
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
