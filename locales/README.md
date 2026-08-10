# Adding a language

You do not need a developer to add a language to this assessment. You need a text editor and
someone who speaks the language.

Everything the assessment says is in this folder, one file per language. Adding a language is
two steps: add a file, then name it in the list.

---

## Before you start

Open **`check.html`** in a browser (it sits next to `index.html` on the server). That page:

- confirms your language code and tells you whether it reads left-to-right or right-to-left
- builds you a starter file with the English already in place
- checks your finished file and explains any mistakes in plain English

Use it. It catches the things that are easy to get wrong and hard to spot.

---

## Step 1 — make the file

In `check.html`, type your language code and press **Download a starter file**. You get a file
named after the code, for example `de.json`, with every value still in English. Translate each
value, leaving the names on the left alone.

The language code is the standard short code: `de` German, `fr` French, `pt-BR` Brazilian
Portuguese, `zh-Hant` Traditional Chinese. If you are unsure, `check.html` will tell you whether
the code is recognised.

### What the file contains

```jsonc
{
  "label": "Deutsch",          // the language's own name — this is what appears in the picker
  "dir": "ltr",                // "ltr", or "rtl" for Arabic, Hebrew, Farsi, Urdu
  "numLocale": "de",           // used to format numbers and the date on a printout

  "ui":         { ... },       // every word of the interface
  "dimensions": [ ... ]        // the six dimensions and their 30 statements
}
```

Three rules that matter:

1. **Keep the six dimensions in the same order as `en.json`**, and five statements inside each.
   Scores are matched by position, not by name. Reordering them silently scrambles the results.
2. **Keep anything in curly braces exactly as it is.** `{n}` and `{total}` are replaced by
   numbers. `Part {n} of {total}` becomes "Part 3 of 6". You may move them within the sentence,
   but do not translate or delete them.
3. **Every value is plain text.** There is no markup to preserve anywhere in these files. If a
   line appears bold or italic in the assessment, the page decides that — `footerTitle` is the
   name of the assessment and always renders bold, for instance. Just translate the words.

### A different alphabet

If your language does not use the Latin or Arabic script, add a `font` block so the text renders
properly. Nothing in the code needs to change.

```json
"font": {
  "import": "https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700&family=Heebo:wght@400;600&display=swap",
  "serif": "'Frank Ruhl Libre', serif",
  "sans":  "'Heebo', system-ui, sans-serif"
}
```

`import` is a stylesheet URL — a Google Fonts link works. `serif` is used for headings, `sans`
for everything else. Leave the whole block out if the default faces are fine.

If your language reads right to left, set `"dir": "rtl"` and the entire layout mirrors. There is
nothing else to do.

---

## Step 2 — add it to the list

Open `index.json` and add the code:

```json
{
  "fallback": "en",
  "locales": ["en", "es", "ar", "de"]
}
```

`fallback` is the language used for anything a translation has not filled in yet. Leave it as
`en` unless you have a reason to change it.

Reload the assessment. The language appears in the picker.

---

## If something goes wrong

**The page says it could not load its languages.** `index.json` is missing, or it is not valid
JSON. Check it in `check.html`.

**A language is missing from the picker.** That file failed to load. Open the browser's developer
console (F12) — there is a line starting `[locale]` saying exactly why, usually a typo in the
file name or a JSON mistake. `check.html` will find it too.

**Some lines are in English.** Those exact lines are missing from your file. The assessment falls
back line by line, not all at once, so a half-finished translation still works — you can even
have two statements translated inside a dimension and the other three appear in English. Run the
file through `check.html` to see which are missing.

**A whole dimension is in English.** Your `dimensions` list is short. Positions the list does not
reach fall back to English entirely. It must hold exactly six, each with exactly five statements.

**The statements do not match the dimension they are under.** The dimensions are in a different
order from `en.json`. Scores are matched by position, so put them back in the original order.

**I fixed the file but the checker still reports the old problem.** Your browser is holding an
old copy of the page. Hard-refresh it: Cmd-Shift-R on a Mac, Ctrl-Shift-R on Windows. The
language files themselves are always re-read, so the assessment picks those up immediately.

---

## An unfinished translation is fine

You can publish a language before it is complete. Anything missing shows in English, line by
line, and the rest shows in the new language. Nothing breaks. Add the remaining lines later.
