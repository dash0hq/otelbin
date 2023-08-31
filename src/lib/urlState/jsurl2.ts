// Copied from:      https://github.com/wmertens/jsurl2
// Reason:					 jsurl2 is unmaintained and not TypeScript compatible
// Original license: MIT
// Time of copy:     2023-07-24
// Copied sha:       8fa47f6a4fad80bc8ad7e4a30d0619928ffe70f8

const hasOwnProperty = new Object().hasOwnProperty;
const stringRE = /^[a-zA-Z]/;
const numRE = /^[\d-]/;
const TRUE = "_T";
const FALSE = "_F";
const NULL = "_N";
const UNDEF = "_U";
const NAN = "_n";
const INF = "_I";
const NINF = "_J";

const dict: Record<string, any> = {
    T: true,
    F: false,
    N: null,
    U: undefined,
    n: NaN,
    I: Infinity,
    J: -Infinity,
};

const fromEscape: Record<string, string> = {
    "*": "*",
    _: "_",
    "-": "~",
    S: "$",
    P: "+",
    '"': "'",
    C: "(", // not necessary but we keep it for symmetry
    D: ")",
    L: "<",
    G: ">", // not necessary but we keep it for symmetry
    ".": "%",
    Q: "?",
    H: "#",
    A: "&",
    E: "=",
    B: "\\",
    N: "\n",
    R: "\r",
    U: "\u2028",
    V: "\u2029",
    Z: "\0",
};
const toEscape: Record<string, string> = {
    "*": "*",
    _: "_",
    "~": "-",
    $: "S",
    "+": "P",
    "'": '"',
    "(": "C",
    ")": "D",
    "<": "L",
    ">": "G",
    "%": ".",
    "?": "Q",
    "#": "H",
    "&": "A",
    "=": "E",
    "\\": "B",
    "\n": "N",
    "\r": "R",
    "\0": "Z",
    "\u2028": "U",
    "\u2029": "V",
};

function origChar(s: string) {
    if (s === "_") {
        return " ";
    }
    const c = fromEscape[s.charAt(1)];
    if (!c) {
        throw new Error("Illegal escape code: " + s);
    }
    return c;
}

function escCode(c: string) {
    if (c === " ") {
        return "_";
    }
    return "*" + toEscape[c];
}

const escapeRE = /(_|\*.)/g;

function unescape(s: string) {
    // oddly enough, testing first is faster
    return escapeRE.test(s) ? s.replace(escapeRE, origChar) : s;
}

// First half: encoding chars; second half: URI and script chars
const replaceRE = /([*_~$+'() <>%?#&=\\\n\r\0\u2028\u2029])/g;

function escape(s: string) {
    // oddly enough, testing first is faster
    return replaceRE.test(s) ? s.replace(replaceRE, escCode) : s;
}

function eat(a: any) {
    let j, c;
    for (
        j = a.i;
        j < a.l && ((c = a.s.charAt(j)), c !== "~" && c !== ")");
        j++
    ) {}
    const w = a.s.slice(a.i, j);
    if (c === "~") {
        j++;
    }
    a.i = j;
    return w;
}

function peek(a: any) {
    return a.s.charAt(a.i);
}

function eatOne(a: any) {
    a.i++;
}

const EOS = {}; // unique symbol
function decode(a: any) {
    let out: any, k, t;
    let c = peek(a);
    if (!c) {
        return EOS;
    }
    if (c === "(") {
        eatOne(a);
        out = {};
        while (((c = peek(a)), c && c !== ")")) {
            k = unescape(eat(a));
            c = peek(a);
            if (c && c !== ")") {
                t = decode(a);
            } else {
                t = true;
            }
            out[k] = t;
        }
        if (c === ")") {
            eatOne(a);
        }
    } else if (c === "!") {
        eatOne(a);
        out = [];
        while (((c = peek(a)), c && c !== "~" && c !== ")")) {
            out.push(decode(a));
        }
        if (c === "~") {
            eatOne(a);
        }
    } else if (c === "_") {
        eatOne(a);
        k = unescape(eat(a));
        if (k.charAt(0) === "D") {
            out = new Date(k.slice(1));
        } else if (k in dict) {
            out = dict[k];
        } else {
            throw new Error("Unknown dict reference: " + k);
        }
    } else if (c === "*") {
        eatOne(a);
        out = unescape(eat(a));
    } else if (c === "~") {
        eatOne(a);
        out = true;
    } else if (numRE.test(c)) {
        out = Number(eat(a));
        if (isNaN(out)) {
            throw new Error("Not a number", c);
        }
    } else if (stringRE.test(c)) {
        out = unescape(eat(a));
    } else {
        throw new Error("Cannot decode part " + [t].concat(a).join("~"));
    }
    return out;
}

function encode(v: any, out: any, rich: any, depth: any) {
    let t,
        T = typeof v;

    if (T === "number") {
        out.push(
            isFinite(v)
                ? v.toString()
                : rich
                ? isNaN(v)
                    ? NAN
                    : v > 0
                    ? INF
                    : NINF
                : NULL
        );
    } else if (T === "boolean") {
        out.push(v ? "" : FALSE);
    } else if (T === "string") {
        t = escape(v);
        if (stringRE.test(t)) {
            out.push(t);
        } else {
            out.push("*" + t);
        }
    } else if (T === "object") {
        if (!v) {
            out.push(NULL);
        } else if (rich && v instanceof Date) {
            out.push("_D" + v.toJSON().replace("T00:00:00.000Z", ""));
        } else if (typeof v.toJSON === "function") {
            encode(v.toJSON(), out, rich, depth);
        } else if (Array.isArray(v)) {
            out.push("!");
            for (let i = 0; i < v.length; i++) {
                t = v[i];
                // Special case: only use full -T~ in arrays
                if (t === true) {
                    out.push(TRUE);
                } else {
                    encode(t, out, rich, depth + 1);
                }
            }
            out.push("");
        } else {
            out.push("(");
            for (const key in v) {
                if (hasOwnProperty.call(v, key)) {
                    t = v[key];
                    if (t !== undefined && typeof t !== "function") {
                        out.push(escape(key));
                        encode(t, out, rich, depth + 1);
                    }
                }
            }
            while (out[out.length - 1] === "") {
                out.pop();
            }
            out.push(")");
        }
    } else {
        // function or undefined
        out.push(rich || depth === 0 ? UNDEF : NULL);
    }
}

const antiJSON: Record<string, string> = {
    true: "*true",
    false: "*false",
    null: "*null",
};
export function stringify(v: any, options?: any): string {
    let out: any = [],
        t,
        str = "",
        len,
        sep = false,
        short = options && options.short,
        rich = options && options.rich;
    encode(v, out, rich, 0);
    // until where we have to stringify
    len = out.length - 1;
    while (((t = out[len]), t === "" || (short && t === ")"))) {
        len--;
    }
    // extended join('~')
    for (let i = 0; i <= len; i++) {
        t = out[i];
        if (sep && t !== ")") {
            str += "~";
        }
        str += t;
        sep = !(t === "!" || t === "(" || t === ")");
    }
    if (short) {
        if (str.length < 6) {
            t = antiJSON[str];
            if (t) str = t;
        }
    } else {
        str += "~";
    }
    return str;
}

function clean(s: any) {
    let out = "";
    let i = 0;
    let j = 0;
    let c;
    while (i < s.length) {
        c = s.charCodeAt(i);
        if (c === 37) {
            // %
            if (i > j) out += s.slice(j, i);
            i++;
            while (c === 37) {
                c = parseInt(s.slice(i, i + 2), 16);
                i += 2;
            }
            if (c > 32) {
                // not a control character or space
                out += String.fromCharCode(c);
            }
            j = i;
        } else if (c <= 32) {
            if (i > j) out += s.slice(j, i);
            i++;
            j = i;
        } else {
            i++;
        }
    }
    if (i > j) out += s.slice(j, i);
    return out;
}

const JSONRE = /^({|\[|"|true$|false$|null$)/;
export function parse(s: string, options?: any): any {
    if (options && options.deURI) s = clean(s);
    if (JSONRE.test(s)) return JSON.parse(s);
    const l = s.length;
    const r = decode({ s: s, i: 0, l: l });
    return r === EOS ? true : r;
}
