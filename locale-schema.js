/* ============================================================================
   LOCALE SCHEMA — the single description of what a language file must contain.
   Loaded by index.html (warns in the console) and by check.html (reports to a
   translator). Keep the two in step by changing this file only.
   ============================================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LocaleSchema = factory();
})(typeof self !== "undefined" ? self : this, function () {

  var DIMS = 6;        // dimensions in the assessment
  var PER = 5;         // statements per dimension
  var SCALE = 5;       // points on the rating scale

  /* Every key the interface reads. Every value is plain text — no markup anywhere, so a
     translator never has to preserve a tag. Where the design needs emphasis, the page builds
     it (see footerTitle, which renders bold ahead of footer1).
     list:   this value is an array of exactly N strings
     vars:   placeholders that must survive translation                              */
  var UI = {
    heroEyebrow:    {},
    heroTitle:      {},
    heroLede:       {},
    legend:         {},
    scaleKey:       { list: SCALE },
    begin:          {},
    reveal:         {},
    resultsEyebrow: {},
    resultsTitle:   {},
    print:          {},
    reset:          {},
    footerTitle:    {},
    footer1:        {},
    footer2:        {},
    langLabel:      {},
    partOf:         { vars: ["n", "total"] },
    back:           {},
    next:           {},
    relStrength:    {},
    growthLabel:    {},
    langChoose:     {}
  };

  function isStr(v) { return typeof v === "string" && v.trim() !== ""; }

  function textIssues(where, s) {
    var out = [];
    if (/[“”‘’]/.test(s))
      out.push({ level: "warn", where: where, msg: "Contains curly quotes pasted from a word processor. Use straight quotes." });
    if (/ /.test(s))
      out.push({ level: "warn", where: where, msg: "Contains a non-breaking space." });
    if (s !== s.trim())
      out.push({ level: "warn", where: where, msg: "Has leading or trailing spaces." });
    return out;
  }

  /* No value anywhere may contain markup. One complaint per value, not one per angle bracket. */
  function tagIssues(where, s) {
    var m = /<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)[^>]*>/.exec(s);
    if (!m) return [];
    return [{
      level: "error", where: where,
      msg: "Contains <" + m[1].toLowerCase() + ">. Every line here is plain text — remove the tags and " +
           "keep the words. If a line needs bold, that is set by the page, not the translation."
    }];
  }

  function varIssues(where, s, vars) {
    var out = [];
    (vars || []).forEach(function (v) {
      if (s.indexOf("{" + v + "}") === -1)
        out.push({ level: "error", where: where, msg: "Must keep the placeholder {" + v + "} — it is replaced by a number." });
    });
    (s.match(/\{(\w+)\}/g) || []).forEach(function (found) {
      var name = found.slice(1, -1);
      if ((vars || []).indexOf(name) === -1)
        out.push({ level: "warn", where: where, msg: found + " is not a placeholder this line understands; it will print literally." });
    });
    return out;
  }

  /* Returns a flat list of {level, where, msg}. level is "error" (the language will not
     work properly) or "warn" (it will work, but check it). An empty list means good. */
  function validate(loc, code) {
    var out = [];
    var err = function (where, msg) { out.push({ level: "error", where: where, msg: msg }); };
    var warn = function (where, msg) { out.push({ level: "warn", where: where, msg: msg }); };

    if (!loc || typeof loc !== "object") { err("(file)", "The file did not contain a JSON object."); return out; }

    if (!isStr(loc.label)) err("label", 'Missing. This is the language name as it appears in the picker, written in that language (e.g. "Deutsch").');
    if (loc.dir !== "ltr" && loc.dir !== "rtl") err("dir", 'Must be "ltr" (left-to-right) or "rtl" (right-to-left, e.g. Arabic or Hebrew).');
    if (!isStr(loc.numLocale)) err("numLocale", 'Missing. A BCP-47 code used to format numbers and dates, e.g. "de" or "pt-BR".');
    else {
      try {
        new Intl.NumberFormat(loc.numLocale);
        // Structurally valid is not the same as real — "klingon" parses fine but has no data.
        if (!Intl.NumberFormat.supportedLocalesOf([loc.numLocale]).length)
          warn("numLocale", '"' + loc.numLocale + '" is a well-formed code, but this browser has no number ' +
               "and date formats for it. The assessment still works; the date on a printout just uses a " +
               "default format. Worth checking the code is the one you meant.");
      } catch (e) {
        err("numLocale", '"' + loc.numLocale + '" is not a valid language code. Use a form like "de", ' +
            '"pt-BR" or "zh-Hant" — letters and hyphens, never underscores.');
      }
    }
    if (loc.font && typeof loc.font !== "object") err("font", "If present, must be an object with import, serif and sans.");

    /* ---- ui ---- */
    if (!loc.ui || typeof loc.ui !== "object") { err("ui", "Missing. This holds every interface string."); }
    else {
      Object.keys(UI).forEach(function (k) {
        var spec = UI[k], v = loc.ui[k], where = "ui." + k;

        if (spec.list) {
          if (!Array.isArray(v)) return err(where, "Missing. Must be a list of " + spec.list + " labels, from strongly disagree to strongly agree.");
          if (v.length !== spec.list) err(where, "Has " + v.length + " labels; it needs exactly " + spec.list + ".");
          v.forEach(function (s, i) {
            if (!isStr(s)) return err(where + "[" + i + "]", "Empty.");
            out = out.concat(textIssues(where + "[" + i + "]", s), tagIssues(where + "[" + i + "]", s));
          });
          return;
        }

        if (!isStr(v)) return err(where, "Missing or empty.");
        out = out.concat(textIssues(where, v), tagIssues(where, v), varIssues(where, v, spec.vars));
      });

      Object.keys(loc.ui).forEach(function (k) {
        if (!UI[k]) warn("ui." + k, "Not a key this tool reads; it will be ignored. Check the spelling.");
      });
    }

    /* ---- dimensions ---- */
    if (!Array.isArray(loc.dimensions)) err("dimensions", "Missing. Must be a list of " + DIMS + " dimensions.");
    else {
      if (loc.dimensions.length !== DIMS) err("dimensions", "Has " + loc.dimensions.length + " dimensions; it needs exactly " + DIMS + ", in the same order as the English file.");
      loc.dimensions.forEach(function (d, i) {
        var where = "dimensions[" + i + "]";
        if (!d || typeof d !== "object") return err(where, "Not an object.");
        ["title", "desc"].forEach(function (k) {
          if (!isStr(d[k])) return err(where + "." + k, "Missing or empty.");
          out = out.concat(textIssues(where + "." + k, d[k]), tagIssues(where + "." + k, d[k]));
        });
        if (!Array.isArray(d.items)) return err(where + ".items", "Missing. Must be a list of " + PER + " statements.");
        if (d.items.length !== PER) err(where + ".items", "Has " + d.items.length + " statements; it needs exactly " + PER + ", in the same order as the English file.");
        d.items.forEach(function (s, j) {
          if (!isStr(s)) return err(where + ".items[" + j + "]", "Empty.");
          out = out.concat(textIssues(where + ".items[" + j + "]", s), tagIssues(where + ".items[" + j + "]", s));
        });
      });
    }

    return out;
  }

  return {
    DIMS: DIMS, PER: PER, SCALE: SCALE,
    UI_KEYS: UI,
    validate: validate
  };
});
