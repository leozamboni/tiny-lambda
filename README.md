A tiny lambda calculus compiler

It works? I don't know, just try `pnpm execute`

Ast:

```js
λ:
| 'λ' sym '.' exp args
;

args:
| args
| sym
;

exp:
| exp op exp
;

op:
| '+'
| '-'
| '*'
| '/'
;
```

Examples:

```js
λx.λy.x+y λf.λz.f z λf.λz.f f z -> ((x,y)=>x+y)(1,2)
λx.λy.x -> ((x,y)=>x)
λx.λy.y -> ((x,y)=>y)

```

- Church numerals not yet implemented
