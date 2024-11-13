// src/filter.ts
var reject_sentinel = "REJECT";

class Filter {
  filters = [];
  constructor(descs) {
    for (const desc of descs) {
      this.filters.push([new RegExp(desc[0], "g"), desc[1]]);
    }
  }
  transform(input) {
    for (const entry of this.filters)
      input = input.replaceAll(entry[0], entry[1]);
    return input;
  }
  filter(input) {
    for (const entry of this.filters) {
      input = input.replaceAll(entry[0], entry[1]);
      if (input.includes(reject_sentinel))
        return null;
    }
    return input;
  }
}
var filter_default = Filter;

// src/language.ts
class Language {
  settings;
  phones;
  ortho;
  constructor(settings, phones, ortho) {
    this.settings = settings;
    this.phones = phones;
    this.ortho = ortho;
  }
  generate(count) {
    const rand_rate = this.settings.settings.get("random-rate") || 50;
    let phones = this.phones.generate(count, rand_rate);
    return phones.map((phone) => [this.ortho.transform(phone), phone]);
  }
}
var language_default = Language;

// src/parser.ts
function parse(s) {
  const p = new Parser(s);
  return p.parse();
}
class using {
  kind = "using" /* using */;
  _modules;
  modules;
  constructor(_modules) {
    this._modules = _modules;
    this.modules = (() => {
      return _modules.map((s) => s.name);
    })();
  }
}

class settings {
  kind = "settings" /* settings */;
  _settings;
  settings;
  constructor(_settings) {
    this._settings = _settings;
    this.settings = (() => {
      return new Map(_settings.map((s) => [s.name, s.value.value]));
    })();
  }
}

class pclass {
  kind = "pclass" /* pclass */;
  name;
  first;
  rest;
  phonemes;
  constructor(name, first, rest) {
    this.name = name;
    this.first = first;
    this.rest = rest;
    this.phonemes = (() => {
      return [this.first, ...rest.map((s) => s.phoneme)];
    })();
  }
}

class words {
  kind = "words" /* words */;
  _patterns;
  patterns;
  constructor(_patterns) {
    this._patterns = _patterns;
    this.patterns = (() => {
      return _patterns.map((s) => s.pattern);
    })();
  }
}

class reject {
  kind = "reject" /* reject */;
  _patterns;
  patterns;
  constructor(_patterns) {
    this._patterns = _patterns;
    this.patterns = (() => {
      return _patterns.map((s) => [s.pattern, reject_sentinel]);
    })();
  }
}

class filter {
  kind = "filter" /* filter */;
  first;
  rest;
  patterns;
  constructor(first, rest) {
    this.first = first;
    this.rest = rest;
    this.patterns = (() => {
      return [this.first.value, ...this.rest.map((s) => s.pattern.value)];
    })();
  }
}

class spelling {
  kind = "spelling" /* spelling */;
  first;
  rest;
  patterns;
  constructor(first, rest) {
    this.first = first;
    this.rest = rest;
    this.patterns = (() => {
      return [this.first.value, ...this.rest.map((s) => s.pattern.value)];
    })();
  }
}

class filter_pat {
  kind = "filter_pat" /* filter_pat */;
  from;
  to;
  value;
  constructor(from, to) {
    this.from = from;
    this.to = to;
    this.value = (() => {
      return [this.from, this.to];
    })();
  }
}

class num {
  kind = "num" /* num */;
  _value;
  value;
  constructor(_value) {
    this._value = _value;
    this.value = (() => {
      return parseInt(this._value);
    })();
  }
}

class Parser {
  input;
  pos;
  negating = false;
  memoSafe = true;
  constructor(input) {
    this.pos = { overallPos: 0, line: 1, offset: 0 };
    this.input = input;
  }
  reset(pos) {
    this.pos = pos;
  }
  finished() {
    return this.pos.overallPos === this.input.length;
  }
  clearMemos() {
  }
  matchstart($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$lines;
      let $$res = null;
      if (($scope$lines = this.loopPlus(() => this.matchstart_$0($$dpth + 1, $$cr))) !== null && this.match$EOF($$cr) !== null) {
        $$res = { kind: "start" /* start */, lines: $scope$lines };
      }
      return $$res;
    });
  }
  matchstart_$0($$dpth, $$cr) {
    return this.choice([
      () => this.matchstart_$0_1($$dpth + 1, $$cr),
      () => this.matchstart_$0_2($$dpth + 1, $$cr),
      () => this.matchstart_$0_3($$dpth + 1, $$cr)
    ]);
  }
  matchstart_$0_1($$dpth, $$cr) {
    return this.matchstatement($$dpth + 1, $$cr);
  }
  matchstart_$0_2($$dpth, $$cr) {
    return this.matchcomment($$dpth + 1, $$cr);
  }
  matchstart_$0_3($$dpth, $$cr) {
    return this.matcheol($$dpth + 1, $$cr);
  }
  matchstatement($$dpth, $$cr) {
    return this.choice([
      () => this.matchstatement_1($$dpth + 1, $$cr),
      () => this.matchstatement_2($$dpth + 1, $$cr),
      () => this.matchstatement_3($$dpth + 1, $$cr),
      () => this.matchstatement_4($$dpth + 1, $$cr),
      () => this.matchstatement_5($$dpth + 1, $$cr),
      () => this.matchstatement_6($$dpth + 1, $$cr),
      () => this.matchstatement_7($$dpth + 1, $$cr),
      () => this.matchstatement_8($$dpth + 1, $$cr)
    ]);
  }
  matchstatement_1($$dpth, $$cr) {
    return this.matchusing($$dpth + 1, $$cr);
  }
  matchstatement_2($$dpth, $$cr) {
    return this.matchsettings($$dpth + 1, $$cr);
  }
  matchstatement_3($$dpth, $$cr) {
    return this.matchpclass($$dpth + 1, $$cr);
  }
  matchstatement_4($$dpth, $$cr) {
    return this.matchmacro($$dpth + 1, $$cr);
  }
  matchstatement_5($$dpth, $$cr) {
    return this.matchwords($$dpth + 1, $$cr);
  }
  matchstatement_6($$dpth, $$cr) {
    return this.matchreject($$dpth + 1, $$cr);
  }
  matchstatement_7($$dpth, $$cr) {
    return this.matchfilter($$dpth + 1, $$cr);
  }
  matchstatement_8($$dpth, $$cr) {
    return this.matchspelling($$dpth + 1, $$cr);
  }
  matchusing($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$_modules;
      let $$res = null;
      if (this.regexAccept(String.raw`(?:using:)`, "", $$dpth + 1, $$cr) !== null && ($scope$_modules = this.loopPlus(() => this.matchusing_$0($$dpth + 1, $$cr))) !== null && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = new using($scope$_modules);
      }
      return $$res;
    });
  }
  matchusing_$0($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$name;
      let $$res = null;
      if (this.matchws($$dpth + 1, $$cr) !== null && ($scope$name = this.matchname($$dpth + 1, $$cr)) !== null) {
        $$res = { kind: "using_$0" /* using_$0 */, name: $scope$name };
      }
      return $$res;
    });
  }
  matchsettings($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$_settings;
      let $$res = null;
      if (this.regexAccept(String.raw`(?:settings:)`, "", $$dpth + 1, $$cr) !== null && ($scope$_settings = this.loopPlus(() => this.matchsettings_$0($$dpth + 1, $$cr))) !== null && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = new settings($scope$_settings);
      }
      return $$res;
    });
  }
  matchsettings_$0($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$name;
      let $scope$value;
      let $$res = null;
      if (this.matchws($$dpth + 1, $$cr) !== null && ($scope$name = this.matchname($$dpth + 1, $$cr)) !== null && (this.matchws($$dpth + 1, $$cr) || true) && this.regexAccept(String.raw`(?:=)`, "", $$dpth + 1, $$cr) !== null && (this.matchws($$dpth + 1, $$cr) || true) && ($scope$value = this.matchvalue($$dpth + 1, $$cr)) !== null) {
        $$res = { kind: "settings_$0" /* settings_$0 */, name: $scope$name, value: $scope$value };
      }
      return $$res;
    });
  }
  matchpclass($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$name;
      let $scope$first;
      let $scope$rest;
      let $$res = null;
      if (($scope$name = this.regexAccept(String.raw`(?:[A-Z])`, "", $$dpth + 1, $$cr)) !== null && (this.matchws($$dpth + 1, $$cr) || true) && this.regexAccept(String.raw`(?:=)`, "", $$dpth + 1, $$cr) !== null && (this.matchws($$dpth + 1, $$cr) || true) && ($scope$first = this.matchphoneme($$dpth + 1, $$cr)) !== null && ($scope$rest = this.loop(() => this.matchpclass_$0($$dpth + 1, $$cr), 0, -1)) !== null && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = new pclass($scope$name, $scope$first, $scope$rest);
      }
      return $$res;
    });
  }
  matchpclass_$0($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$phoneme;
      let $$res = null;
      if (this.matchws($$dpth + 1, $$cr) !== null && ($scope$phoneme = this.matchphoneme($$dpth + 1, $$cr)) !== null) {
        $$res = { kind: "pclass_$0" /* pclass_$0 */, phoneme: $scope$phoneme };
      }
      return $$res;
    });
  }
  matchmacro($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$name;
      let $scope$value;
      let $$res = null;
      if (($scope$name = this.regexAccept(String.raw`(?:\$[A-Z])`, "", $$dpth + 1, $$cr)) !== null && (this.matchws($$dpth + 1, $$cr) || true) && this.regexAccept(String.raw`(?:=)`, "", $$dpth + 1, $$cr) !== null && (this.matchws($$dpth + 1, $$cr) || true) && ($scope$value = this.matchphoneme($$dpth + 1, $$cr)) !== null && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = { kind: "macro" /* macro */, name: $scope$name, value: $scope$value };
      }
      return $$res;
    });
  }
  matchwords($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$_patterns;
      let $$res = null;
      if (this.regexAccept(String.raw`(?:words:)`, "", $$dpth + 1, $$cr) !== null && ($scope$_patterns = this.loopPlus(() => this.matchwords_$0($$dpth + 1, $$cr))) !== null && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = new words($scope$_patterns);
      }
      return $$res;
    });
  }
  matchwords_$0($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$pattern;
      let $$res = null;
      if (this.matchws($$dpth + 1, $$cr) !== null && ($scope$pattern = this.regexAccept(String.raw`(?:[A-Z?\$]+)`, "", $$dpth + 1, $$cr)) !== null) {
        $$res = { kind: "words_$0" /* words_$0 */, pattern: $scope$pattern };
      }
      return $$res;
    });
  }
  matchreject($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$_patterns;
      let $$res = null;
      if (this.regexAccept(String.raw`(?:reject:)`, "", $$dpth + 1, $$cr) !== null && ($scope$_patterns = this.loopPlus(() => this.matchreject_$0($$dpth + 1, $$cr))) !== null && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = new reject($scope$_patterns);
      }
      return $$res;
    });
  }
  matchreject_$0($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$pattern;
      let $$res = null;
      if (this.matchws($$dpth + 1, $$cr) !== null && ($scope$pattern = this.matchphoneme($$dpth + 1, $$cr)) !== null) {
        $$res = { kind: "reject_$0" /* reject_$0 */, pattern: $scope$pattern };
      }
      return $$res;
    });
  }
  matchfilter($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$first;
      let $scope$rest;
      let $$res = null;
      if (this.regexAccept(String.raw`(?:filter:)`, "", $$dpth + 1, $$cr) !== null && this.matchws($$dpth + 1, $$cr) !== null && ($scope$first = this.matchfilter_pat($$dpth + 1, $$cr)) !== null && ($scope$rest = this.loop(() => this.matchfilter_$0($$dpth + 1, $$cr), 0, -1)) !== null && (this.regexAccept(String.raw`(?:;)`, "", $$dpth + 1, $$cr) || true) && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = new filter($scope$first, $scope$rest);
      }
      return $$res;
    });
  }
  matchfilter_$0($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$pattern;
      let $$res = null;
      if ((this.matchws($$dpth + 1, $$cr) || true) && this.regexAccept(String.raw`(?:;)`, "", $$dpth + 1, $$cr) !== null && (this.matchws($$dpth + 1, $$cr) || true) && ($scope$pattern = this.matchfilter_pat($$dpth + 1, $$cr)) !== null) {
        $$res = { kind: "filter_$0" /* filter_$0 */, pattern: $scope$pattern };
      }
      return $$res;
    });
  }
  matchspelling($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$first;
      let $scope$rest;
      let $$res = null;
      if (this.regexAccept(String.raw`(?:spelling:)`, "", $$dpth + 1, $$cr) !== null && this.matchws($$dpth + 1, $$cr) !== null && ($scope$first = this.matchfilter_pat($$dpth + 1, $$cr)) !== null && ($scope$rest = this.loop(() => this.matchspelling_$0($$dpth + 1, $$cr), 0, -1)) !== null && (this.regexAccept(String.raw`(?:;)`, "", $$dpth + 1, $$cr) || true) && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = new spelling($scope$first, $scope$rest);
      }
      return $$res;
    });
  }
  matchspelling_$0($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$pattern;
      let $$res = null;
      if ((this.matchws($$dpth + 1, $$cr) || true) && this.regexAccept(String.raw`(?:;)`, "", $$dpth + 1, $$cr) !== null && (this.matchws($$dpth + 1, $$cr) || true) && ($scope$pattern = this.matchfilter_pat($$dpth + 1, $$cr)) !== null) {
        $$res = { kind: "spelling_$0" /* spelling_$0 */, pattern: $scope$pattern };
      }
      return $$res;
    });
  }
  matchfilter_pat($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$from;
      let $scope$to;
      let $$res = null;
      if (($scope$from = this.matchphoneme($$dpth + 1, $$cr)) !== null && (this.matchws($$dpth + 1, $$cr) || true) && this.regexAccept(String.raw`(?:>)`, "", $$dpth + 1, $$cr) !== null && (this.matchws($$dpth + 1, $$cr) || true) && ($scope$to = this.matchphoneme($$dpth + 1, $$cr)) !== null) {
        $$res = new filter_pat($scope$from, $scope$to);
      }
      return $$res;
    });
  }
  matcheol($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $$res = null;
      if ((this.matchws($$dpth + 1, $$cr) || true) && this.regexAccept(String.raw`(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
        $$res = { kind: "eol" /* eol */ };
      }
      return $$res;
    });
  }
  matchws($$dpth, $$cr) {
    return this.regexAccept(String.raw`(?:[\t ]+)`, "", $$dpth + 1, $$cr);
  }
  matchcomment($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $$res = null;
      if (this.matchcomment_$0($$dpth + 1, $$cr) !== null && this.matcheol($$dpth + 1, $$cr) !== null) {
        $$res = { kind: "comment" /* comment */ };
      }
      return $$res;
    });
  }
  matchcomment_$0($$dpth, $$cr) {
    return this.choice([
      () => this.matchcomment_$0_1($$dpth + 1, $$cr),
      () => this.matchcomment_$0_2($$dpth + 1, $$cr)
    ]);
  }
  matchcomment_$0_1($$dpth, $$cr) {
    return this.regexAccept(String.raw`(?:^#.*)`, "m", $$dpth + 1, $$cr);
  }
  matchcomment_$0_2($$dpth, $$cr) {
    return this.matchws($$dpth + 1, $$cr);
  }
  matchphoneme($$dpth, $$cr) {
    return this.regexAccept(String.raw`(?:[^\s\`:;!]+)`, "", $$dpth + 1, $$cr);
  }
  matchvalue($$dpth, $$cr) {
    return this.choice([
      () => this.matchvalue_1($$dpth + 1, $$cr),
      () => this.matchvalue_2($$dpth + 1, $$cr)
    ]);
  }
  matchvalue_1($$dpth, $$cr) {
    return this.matchnum($$dpth + 1, $$cr);
  }
  matchvalue_2($$dpth, $$cr) {
    return this.matchstr($$dpth + 1, $$cr);
  }
  matchname($$dpth, $$cr) {
    return this.regexAccept(String.raw`(?:[A-Za-z][A-Za-z0-9_-]*)`, "", $$dpth + 1, $$cr);
  }
  matchnum($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$_value;
      let $$res = null;
      if (($scope$_value = this.regexAccept(String.raw`(?:[0-9]+)`, "", $$dpth + 1, $$cr)) !== null) {
        $$res = new num($scope$_value);
      }
      return $$res;
    });
  }
  matchstr($$dpth, $$cr) {
    return this.run($$dpth, () => {
      let $scope$value;
      let $$res = null;
      if (this.regexAccept(String.raw`(?:")`, "", $$dpth + 1, $$cr) !== null && ($scope$value = this.regexAccept(String.raw`(?:[^"]*)`, "", $$dpth + 1, $$cr)) !== null && this.regexAccept(String.raw`(?:")`, "", $$dpth + 1, $$cr) !== null) {
        $$res = { kind: "str" /* str */, value: $scope$value };
      }
      return $$res;
    });
  }
  test() {
    const mrk = this.mark();
    const res = this.matchstart(0);
    const ans = res !== null;
    this.reset(mrk);
    return ans;
  }
  parse() {
    const mrk = this.mark();
    const res = this.matchstart(0);
    if (res)
      return { ast: res, errs: [] };
    this.reset(mrk);
    const rec = new ErrorTracker;
    this.clearMemos();
    this.matchstart(0, rec);
    const err = rec.getErr();
    return { ast: res, errs: err !== null ? [err] : [] };
  }
  mark() {
    return this.pos;
  }
  loopPlus(func) {
    return this.loop(func, 1, -1);
  }
  loop(func, lb, ub) {
    const mrk = this.mark();
    const res = [];
    while (ub === -1 || res.length < ub) {
      const preMrk = this.mark();
      const t = func();
      if (t === null || this.pos.overallPos === preMrk.overallPos) {
        break;
      }
      res.push(t);
    }
    if (res.length >= lb) {
      return res;
    }
    this.reset(mrk);
    return null;
  }
  run($$dpth, fn) {
    const mrk = this.mark();
    const res = fn();
    if (res !== null)
      return res;
    this.reset(mrk);
    return null;
  }
  choice(fns) {
    for (const f of fns) {
      const res = f();
      if (res !== null) {
        return res;
      }
    }
    return null;
  }
  regexAccept(match, mods, dpth, cr) {
    return this.run(dpth, () => {
      const reg = new RegExp(match, "y" + mods);
      const mrk = this.mark();
      reg.lastIndex = mrk.overallPos;
      const res = this.tryConsume(reg);
      if (cr) {
        cr.record(mrk, res, {
          kind: "RegexMatch",
          literal: match.substring(3, match.length - 1),
          negated: this.negating
        });
      }
      return res;
    });
  }
  tryConsume(reg) {
    const res = reg.exec(this.input);
    if (res) {
      let lineJmp = 0;
      let lind = -1;
      for (let i = 0;i < res[0].length; ++i) {
        if (res[0][i] === "\n") {
          ++lineJmp;
          lind = i;
        }
      }
      this.pos = {
        overallPos: reg.lastIndex,
        line: this.pos.line + lineJmp,
        offset: lind === -1 ? this.pos.offset + res[0].length : res[0].length - lind - 1
      };
      return res[0];
    }
    return null;
  }
  noConsume(fn) {
    const mrk = this.mark();
    const res = fn();
    this.reset(mrk);
    return res;
  }
  negate(fn) {
    const mrk = this.mark();
    const oneg = this.negating;
    this.negating = !oneg;
    const res = fn();
    this.negating = oneg;
    this.reset(mrk);
    return res === null ? true : null;
  }
  memoise(rule, memo) {
    const $scope$pos = this.mark();
    const $scope$memoRes = memo.get($scope$pos.overallPos);
    if (this.memoSafe && $scope$memoRes !== undefined) {
      this.reset($scope$memoRes[1]);
      return $scope$memoRes[0];
    }
    const $scope$result = rule();
    if (this.memoSafe)
      memo.set($scope$pos.overallPos, [$scope$result, this.mark()]);
    return $scope$result;
  }
  match$EOF(et) {
    const res = this.finished() ? { kind: "$EOF" /* $EOF */ } : null;
    if (et)
      et.record(this.mark(), res, { kind: "EOF", negated: this.negating });
    return res;
  }
}

class SyntaxErr {
  pos;
  expmatches;
  constructor(pos, expmatches) {
    this.pos = pos;
    this.expmatches = [...expmatches];
  }
  toString() {
    return `Syntax Error at line ${this.pos.line}:${this.pos.offset}. Expected one of ${this.expmatches.map((x) => x.kind === "EOF" ? " EOF" : ` ${x.negated ? "not " : ""}'${x.literal}'`)}`;
  }
}

class ErrorTracker {
  mxpos = { overallPos: -1, line: -1, offset: -1 };
  regexset = new Set;
  pmatches = [];
  record(pos, result, att) {
    if (result === null === att.negated)
      return;
    if (pos.overallPos > this.mxpos.overallPos) {
      this.mxpos = pos;
      this.pmatches = [];
      this.regexset.clear();
    }
    if (this.mxpos.overallPos === pos.overallPos) {
      if (att.kind === "RegexMatch") {
        if (!this.regexset.has(att.literal))
          this.pmatches.push(att);
        this.regexset.add(att.literal);
      } else {
        this.pmatches.push(att);
      }
    }
  }
  getErr() {
    if (this.mxpos.overallPos !== -1)
      return new SyntaxErr(this.mxpos, this.pmatches);
    return null;
  }
}

// src/phonology.ts
class WeightedRandom {
  phonemes;
  weights;
  total;
  constructor(phonemes) {
    this.phonemes = phonemes;
    const base = Math.log(phonemes.length + 1);
    this.weights = [];
    for (let i = 0;i < phonemes.length; i++) {
      this.weights.push(base - Math.log(i + 1));
    }
    this.total = this.weights.reduce((x, y) => x + y, 0);
  }
  choose() {
    const roll = Math.random() * this.total;
    let accumulator = 0;
    for (let i = 0;i < this.phonemes.length; i++) {
      accumulator += this.weights[i];
      if (accumulator > roll)
        return this.phonemes[i];
    }
    return this.phonemes[0];
  }
}

class PhoneMap extends Map {
  replace(input, rand_rate) {
    let self = this;
    function replacer(match, className, questionMark, offset, str) {
      if (questionMark && Math.random() * 100 > rand_rate)
        return "";
      let choices = self.get(className);
      return self.replace(choices.choose());
    }
    return input.replaceAll(/([A-Z])(\?)?/g, replacer);
  }
}

class Phonology extends filter_default {
  patterns;
  classes;
  constructor(patterns, classes, filters) {
    super(filters);
    this.patterns = new WeightedRandom(patterns);
    this.classes = new PhoneMap;
    for (const [name, phones] of classes)
      this.classes.set(name, new WeightedRandom(phones));
  }
  generate(count, rand_rate) {
    return Array.from({ length: count }, () => {
      let result = this.classes.replace(this.patterns.choose(), rand_rate);
      return this.filter(result);
      const form = this.patterns.choose().split(/([A-Z]\??)/).filter((s) => {
        if (s.endsWith("?"))
          return Math.random() * 100 <= rand_rate;
        return !!s;
      }).map((s) => {
        const pclass2 = s.substring(0, 1);
        const ph = this.classes.get(pclass2);
        if (!ph) {
          const all = [...this.classes.keys()].map((k) => `'${k}'`).join(", ");
          throw new Error(`Unknown phoneme class '${pclass2}' in ${all}`);
        }
        return ph.choose();
      }).join("");
      return form;
    }).filter((s) => typeof s === "string");
  }
}
var phonology_default = Phonology;

// src/definition.ts
function build_language(definition) {
  const result = parse(definition);
  if (!result.ast) {
    const error = new Error(result.errs.toString());
    throw error;
  }
  let settings_vars = new Map;
  let using_modules = [];
  let word_patterns = [];
  let filter_patterns = [];
  let classes = new Map;
  let macros = [];
  let spelling2 = [];
  for (const line of result.ast.lines) {
    switch (line.kind) {
      case "using" /* using */:
        using_modules.push(line.modules);
        break;
      case "settings" /* settings */:
        for (const key of line.settings.keys())
          settings_vars.set(key, line.settings.get(key));
        break;
      case "pclass" /* pclass */:
        classes.set(line.name, line.phonemes);
        break;
      case "macro" /* macro */:
        macros.push(["\\" + line.name, line.value]);
        break;
      case "words" /* words */:
        word_patterns.push(line.patterns);
        break;
      case "reject" /* reject */:
      case "filter" /* filter */:
        for (const pattern of line.patterns)
          filter_patterns.push(pattern);
        break;
      case "spelling" /* spelling */:
        for (const pattern of line.patterns)
          spelling2.push(pattern);
        break;
    }
  }
  let macro_filter = new filter_default(macros);
  let final_patterns = word_patterns.flat().map((p) => macro_filter.transform(p));
  return new language_default({ modules: using_modules.flat(), settings: settings_vars }, new phonology_default(final_patterns, classes, filter_patterns), new filter_default(spelling2));
}
var definition_default = build_language;
export {
  definition_default as default,
  build_language
};

//# debugId=D972C38CFD90765264756E2164756E21
