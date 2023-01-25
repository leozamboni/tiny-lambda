A tiny lambda calculus compiler

It works? I don't know, just try `pnpm execute`

Ast:

```js
λ:
| 'λ' sym sepator
| 'λ' sym sepator exp
;

sepator:
| ','
| '.'
;

call:
| sym '()'
| sym args
;

args:
| '(' sym ')'
| '(' sym ')' args
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
FUNC := λx,λy.x+y -> FUNC=x=>y=>x+y
TRUE := λx,λy.x -> TRUE=x=>y=>x
FALSE := λx,λy.y -> FALSE=x=>y=>y
AND := λx,λy.FALSE(x)(y) -> AND=x=>y=>FALSE(x)(y)

```

TODO: - Church numerals
