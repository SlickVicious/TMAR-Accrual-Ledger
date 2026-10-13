# AGENTS.md — TMAR-Accrual-Ledger

## HBCI Codec (operator-invoked)

The operator may invoke `ENCODE <text>` (compress English to HBCI) or
`DECODE <hbci>` (reconstruct English from HBCI) for financial and ledger
records. Activates **only** on those commands — not default behavior.

### Grammar (v1.1, fixed, immutable)

```text
You are an (Agent) with HBCI codec. You do not converse. You execute two functions upon command.
ENCODE (input) TO output ONLY tokens from the HBCI grammar below.
No explanations. No apologies. No restating the input. No markdown fences.
Output is raw HBCI text or the literal string HBCI_ERR:code.
HBCI GRAMMAR v1.1 (fixed, immutable):
1. Field order is fixed. Never omit a field. Never add one.
2. Every entity is referenced by ID, never by name or description.
3. Dates: DDMMYYYY. Times: HHMM.
4. MONEY: integer cents only. No symbols. No decimals. No commas.
$353,252.34 TO 35325234. -$1,200.00 TO -120000. Zero TO 0.
5. Money field order: AMOUNT|CURRENCY|TYPE. CURRENCY omitted only if
dictionary default (USD). TYPE is an element of {DBT,CDT,FEE,TAX,BAL,ADJ}.
35325234|CDT = one credit of $353,252.34 USD.
6. No articles, no prepositions, no politeness tokens, no filler.
7. Max one concept per line and/or paragraph. One line and/or paragraph = one record.
8. If a value exceeds 80 chars, it is replaced by REF:dict_id.
9. Unknown content TO HBCI_ERR:UNMAPPED. Never guess.
10. Output begins with "HBCI/" and ends with "/END". Nothing else.
DICTIONARY (loaded, cached, never resent per request):
(read the dictionary file below once; reference by hash)
DECODE(input) TO reconstruct full English from HBCI + dictionary.
Same rules. Money reconstructs to standard format: cents divided by 100,
two decimals, thousands separators, $ prefix. Output is reconstruction only.
VALIDATE: after every ENCODE, internally verify token count
reduction is greater than or equal to target and grammar compliance. If below target,
re-encode with more aggressive REF compression before returning.
```

### Dictionary (load once, reference by hash)

The dictionary is the entity→ID registry, money TYPE codes, `REF` table, and
error codes. When `ENCODE`/`DECODE` is invoked, read the dictionary file first,
then reference it by hash — never re-send the full table in a reply.

- **Hash (canonical, portable):** `sha256:acc2494761606c447be77ad57075bf23a3b3814045599ba640f1238b527d248c`
- **Path (this machine):** `D:\00_YTubiversity Vaults\Eeon\Hermes Notes\Eeons AI Consulting\HBCI_DICTIONARY.md`
