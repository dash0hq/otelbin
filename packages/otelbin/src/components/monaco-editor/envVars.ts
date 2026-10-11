// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Detection of OpenTelemetry Collector configuration variable substitutions.
 *
 * The collector resolves `${...}` sequences through its confmap providers. The
 * rules we implement here are the ones that have been stable since collector
 * v0.107.0, when the `confmap.unifyEnvVarExpansion` feature gate graduated:
 *
 *   - `${env:NAME}` resolves to the `NAME` environment variable.
 *   - `${NAME}` has no explicit scheme and therefore uses the default scheme,
 *     which is `env`. It is equivalent to `${env:NAME}`.
 *   - `$NAME` (bash style, no braces) is no longer expanded at all and is left
 *     verbatim in the configuration, so we deliberately do not detect it.
 *   - `${env:NAME:-fallback}` supplies a default used when `NAME` is unset.
 *   - `$$` is an escape for a literal `$` and never starts a substitution.
 *   - Any other scheme (`file:`, `http:`, `https:`, `yaml:`, ...) is resolved
 *     by a provider we cannot emulate during server-side validation.
 *
 * Resolution happens against the *parsed* configuration, and only over values:
 * `expandValue` walks a `map[string]any` rebuilding it as `nmap[mk] = val`, so
 * a substitution in a mapping key is copied through untouched. A substitution
 * is therefore only real when it sits inside a value, which also rules out the
 * ones written in comments, since those never reach the resolver at all.
 *
 * @see https://opentelemetry.io/docs/collector/configuration/
 */

import YAML from "yaml";

/** Environment variable names the collector accepts. */
const ENV_VAR_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * URI scheme as validated by the collector's confmap resolver: a letter
 * followed by at least one more scheme character.
 */
const SCHEME_PATTERN = /^([A-Za-z][A-Za-z0-9+.-]+):([\s\S]*)$/;

/** Matches either a `$$` escape or a `${...}` substitution. */
const SUBSTITUTION_PATTERN = /\$\$|\$\{([^}]*)\}/g;

/** Separator introducing a default value, borrowed from bash. */
const DEFAULT_VALUE_SEPARATOR = ":-";

export interface IEnvVarOccurrence {
	/** The full source text of the substitution, e.g. `${env:FOO:-bar}`. */
	source: string;
	/** 1-based line number the substitution starts on. */
	line: number;
	/** Default value declared at this occurrence, if any. */
	defaultValue?: string;
}

export interface IEnvVar {
	name: string;
	occurrences: IEnvVarOccurrence[];
}

export interface IUnsupportedProvider {
	/** The scheme that cannot be resolved during validation, e.g. `file`. */
	scheme: string;
	/** The full source text of the substitution, e.g. `${file:/etc/otel.yaml}`. */
	source: string;
	/** 1-based line number the substitution starts on. */
	line: number;
}

export interface IInvalidSubstitution {
	/** The full source text of the substitution, e.g. `${1INVALID}`. */
	source: string;
	/** 1-based line number the substitution starts on. */
	line: number;
}

/** Where a substitution sits in the configuration, for editor decorations. */
export interface ISubstitutionRange {
	/** Offset of the leading `$` within the configuration. */
	offset: number;
	/** Length of the substitution, including the `${` and `}` delimiters. */
	length: number;
	kind: "env" | "unsupported" | "invalid";
	/** The variable name, for `env` substitutions. */
	name?: string;
	/** The default declared at this occurrence, for `env` substitutions. */
	defaultValue?: string;
}

export interface ISubstitutions {
	/** Environment variables referenced by the configuration, keyed by name. */
	envVars: Record<string, IEnvVar>;
	/** Substitutions resolved by a provider we cannot emulate server-side. */
	unsupportedProviders: IUnsupportedProvider[];
	/** Substitutions the collector itself would reject. */
	invalid: IInvalidSubstitution[];
	/** Every substitution found, in source order. */
	ranges: ISubstitutionRange[];
}

/**
 * Splits a substitution body into the part addressing the value and the default
 * value, e.g. `env:FOO:-bar` into `env:FOO` and `bar`.
 *
 * The split happens on the *first* `:-` so that a default value is free to
 * contain further `:-` sequences.
 */
function splitDefaultValue(body: string): { location: string; defaultValue?: string } {
	const separatorIndex = body.indexOf(DEFAULT_VALUE_SEPARATOR);
	if (separatorIndex < 0) {
		return { location: body };
	}

	return {
		location: body.slice(0, separatorIndex),
		defaultValue: body.slice(separatorIndex + DEFAULT_VALUE_SEPARATOR.length),
	};
}

/**
 * The offsets spanned by every scalar the collector would expand: the values of
 * mappings and the items of sequences, but not mapping keys, and not comments,
 * which are not nodes at all.
 *
 * Returns `undefined` when the configuration does not parse, which happens
 * routinely mid-edit. Callers then fall back to accepting every substitution:
 * a configuration that does not parse cannot be validated anyway, and keeping
 * the detected variables on screen beats blanking the panel on each keystroke.
 */
function findValueRanges(config: string): [number, number][] | undefined {
	let document: YAML.Document.Parsed;
	try {
		// The failsafe schema keeps every scalar a string, so no tag resolution
		// can fail on us. We only care where the scalars are, not what they mean.
		document = YAML.parseDocument(config, { logLevel: "silent", schema: "failsafe" });
	} catch {
		return undefined;
	}

	if (document.errors.length > 0) {
		return undefined;
	}

	const ranges: [number, number][] = [];
	YAML.visit(document, {
		Scalar(key, node) {
			// `key` is "key" for a mapping key, "value" for a mapping value, and
			// the index for a sequence item.
			if (key === "key" || !node.range) {
				return;
			}
			ranges.push([node.range[0], node.range[1]]);
		},
	});

	return ranges;
}

/**
 * Finds every `${...}` substitution in the given configuration and groups them
 * into environment variable references, references to providers that cannot be
 * resolved during server-side validation, and outright invalid substitutions.
 *
 * Substitutions the collector would never expand — those in mapping keys and in
 * comments — are ignored.
 */
export function findSubstitutions(config: string): ISubstitutions {
	const envVars: Record<string, IEnvVar> = {};
	const unsupportedProviders: IUnsupportedProvider[] = [];
	const invalid: IInvalidSubstitution[] = [];
	const ranges: ISubstitutionRange[] = [];

	// Pre-compute the offset of every line start so that we can turn a match
	// index into a line number without re-scanning the config for each match.
	const lineStartOffsets = [0];
	for (let i = 0; i < config.length; i++) {
		if (config[i] === "\n") {
			lineStartOffsets.push(i + 1);
		}
	}

	function lineAt(offset: number): number {
		let low = 0;
		let high = lineStartOffsets.length - 1;
		while (low < high) {
			const mid = Math.ceil((low + high) / 2);
			if ((lineStartOffsets[mid] ?? 0) <= offset) {
				low = mid;
			} else {
				high = mid - 1;
			}
		}
		return low + 1;
	}

	const valueRanges = findValueRanges(config);

	function isExpanded(offset: number, end: number): boolean {
		// Undefined means the configuration did not parse, so we cannot tell
		// values from keys and accept everything.
		return valueRanges === undefined || valueRanges.some(([start, stop]) => offset >= start && end <= stop);
	}

	SUBSTITUTION_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = SUBSTITUTION_PATTERN.exec(config)) !== null) {
		const body = match[1];
		// A `$$` escape. It yields a literal `$` and never starts a substitution.
		if (body === undefined) {
			continue;
		}

		if (!isExpanded(match.index, match.index + match[0].length)) {
			continue;
		}

		const source = match[0];
		const line = lineAt(match.index);
		const { location, defaultValue } = splitDefaultValue(body);
		const scheme = SCHEME_PATTERN.exec(location);

		// An explicit scheme other than `env` is resolved by a provider whose
		// inputs are not available to the validation backend.
		if (scheme && scheme[1] !== "env") {
			unsupportedProviders.push({ scheme: scheme[1] ?? "", source, line });
			ranges.push({ offset: match.index, length: source.length, kind: "unsupported" });
			continue;
		}

		// Without a scheme the default one (`env`) applies, so both `${env:FOO}`
		// and `${FOO}` address the `FOO` environment variable.
		const name = scheme ? scheme[2] ?? "" : location;
		if (!ENV_VAR_NAME_PATTERN.test(name)) {
			invalid.push({ source, line });
			ranges.push({ offset: match.index, length: source.length, kind: "invalid" });
			continue;
		}

		const envVar = (envVars[name] ??= { name, occurrences: [] });
		envVar.occurrences.push({ source, line, defaultValue });
		ranges.push({ offset: match.index, length: source.length, kind: "env", name, defaultValue });
	}

	return { envVars, unsupportedProviders, invalid, ranges };
}

export interface IEnvVarBinding extends IEnvVar {
	/** The value the user bound to this variable, if any. */
	boundValue?: string;
	/**
	 * The default values declared across all occurrences, in order of first
	 * appearance. Empty when no occurrence declares one.
	 */
	defaultValues: string[];
	/**
	 * Whether no value at all is available for this variable: the user has not
	 * bound one and no occurrence declares a default. A default declared at any
	 * occurrence counts, even if other occurrences lack one — the collector
	 * resolves those to the empty string with a warning rather than failing, so
	 * holding validation back over them would cost more than it catches.
	 */
	isUnbound: boolean;
}

/**
 * Combines the environment variables referenced by a configuration with the
 * values the user bound to them.
 */
export function bindEnvVars(
	envVars: Record<string, IEnvVar>,
	boundValues: Readonly<Record<string, string>>
): Record<string, IEnvVarBinding> {
	const bindings: Record<string, IEnvVarBinding> = {};

	for (const envVar of Object.values(envVars)) {
		const boundValue = boundValues[envVar.name];
		const defaultValues = [
			...new Set(
				envVar.occurrences
					.map((occurrence) => occurrence.defaultValue)
					.filter((defaultValue): defaultValue is string => defaultValue !== undefined)
			),
		];
		bindings[envVar.name] = {
			...envVar,
			boundValue,
			defaultValues,
			isUnbound: boundValue === undefined && defaultValues.length === 0,
		};
	}

	return bindings;
}

export interface IRenderedLine {
	/** 1-based line number. */
	line: number;
	/** The line as the collector would see it, once substitutions resolve. */
	text: string;
}

/**
 * Renders each line of the configuration that contains at least one
 * substitution we can resolve, so the editor can preview the value the
 * collector would actually read.
 *
 * Substitutions without a value, and those addressed to a provider we cannot
 * resolve, are left verbatim: the preview then shows exactly the mix of
 * resolved and unresolved text the collector would work with.
 *
 * Takes the ranges from an earlier {@link findSubstitutions} rather than
 * scanning again, so that rendering on every keystroke costs one parse of the
 * configuration rather than two.
 */
export function renderSubstitutions(
	config: string,
	ranges: ISubstitutionRange[],
	bindings: Record<string, IEnvVarBinding>
): IRenderedLine[] {
	const lines = config.split("\n");

	const lineStartOffsets: number[] = [];
	let offset = 0;
	for (const line of lines) {
		lineStartOffsets.push(offset);
		offset += line.length + 1;
	}

	function lineIndexAt(target: number): number {
		let low = 0;
		let high = lineStartOffsets.length - 1;
		while (low < high) {
			const mid = Math.ceil((low + high) / 2);
			if ((lineStartOffsets[mid] ?? 0) <= target) {
				low = mid;
			} else {
				high = mid - 1;
			}
		}
		return low;
	}

	const replacementsByLine = new Map<number, { start: number; end: number; value: string }[]>();

	for (const range of ranges) {
		if (range.kind !== "env" || range.name === undefined) {
			continue;
		}

		const value = bindings[range.name]?.boundValue ?? range.defaultValue;
		if (value === undefined) {
			continue;
		}

		const lineIndex = lineIndexAt(range.offset);
		const start = range.offset - (lineStartOffsets[lineIndex] ?? 0);
		const end = start + range.length;
		// A substitution may legally span lines. Previewing one against a single
		// line would corrupt the text, so leave those alone.
		if (end > (lines[lineIndex]?.length ?? 0)) {
			continue;
		}

		const replacements = replacementsByLine.get(lineIndex) ?? [];
		replacements.push({ start, end, value });
		replacementsByLine.set(lineIndex, replacements);
	}

	const rendered: IRenderedLine[] = [];

	for (const [lineIndex, replacements] of [...replacementsByLine.entries()].sort((a, b) => a[0] - b[0])) {
		let text = lines[lineIndex] ?? "";
		// Apply right to left so that each replacement's offsets stay valid.
		for (const replacement of [...replacements].sort((a, b) => b.start - a.start)) {
			text = text.slice(0, replacement.start) + replacement.value + text.slice(replacement.end);
		}
		rendered.push({ line: lineIndex + 1, text });
	}

	return rendered;
}

/**
 * Reasons why a configuration cannot be validated server-side. An empty array
 * means server-side validation can proceed.
 */
export function findValidationBlockers(
	bindings: Record<string, IEnvVarBinding>,
	unsupportedProviders: IUnsupportedProvider[]
): string[] {
	const blockers: string[] = [];

	const unbound = Object.values(bindings).filter((binding) => binding.isUnbound);
	if (unbound.length > 0) {
		blockers.push(
			`${unbound.length} environment ${unbound.length === 1 ? "variable is" : "variables are"} unbound: ` +
				unbound.map((binding) => binding.name).join(", ")
		);
	}

	const schemes = [...new Set(unsupportedProviders.map((provider) => provider.scheme))];
	if (schemes.length > 0) {
		const list = schemes.map((scheme) => `${scheme}:`).join(", ");
		blockers.push(
			schemes.length === 1
				? `The ${list} provider cannot be resolved during validation`
				: `The ${list} providers cannot be resolved during validation`
		);
	}

	return blockers;
}
