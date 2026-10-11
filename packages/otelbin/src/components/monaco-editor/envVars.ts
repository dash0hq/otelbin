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
 * @see https://opentelemetry.io/docs/collector/configuration/
 */

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
 * Finds every `${...}` substitution in the given configuration and groups them
 * into environment variable references, references to providers that cannot be
 * resolved during server-side validation, and outright invalid substitutions.
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

	SUBSTITUTION_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = SUBSTITUTION_PATTERN.exec(config)) !== null) {
		const body = match[1];
		// A `$$` escape. It yields a literal `$` and never starts a substitution.
		if (body === undefined) {
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
		ranges.push({ offset: match.index, length: source.length, kind: "env" });
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
	 * Whether the collector would fail to resolve this variable during
	 * server-side validation: it is referenced at least once without a default
	 * value and the user has not bound a value to it.
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
		// Occurrences carrying a default resolve on their own. The variable only
		// needs a value from the user if at least one occurrence lacks a default.
		const hasOccurrenceWithoutDefault = envVar.occurrences.some((occurrence) => occurrence.defaultValue === undefined);

		bindings[envVar.name] = {
			...envVar,
			boundValue,
			defaultValues,
			isUnbound: boundValue === undefined && hasOccurrenceWithoutDefault,
		};
	}

	return bindings;
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
