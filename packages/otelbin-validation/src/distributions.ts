import { readFileSync } from 'fs';
import { join } from 'path';

export interface Distributions {
  [key: string]: Distribution;
}

export interface Distribution {
  provider: string;
  description: string;
  website: string;
  repository: string;
  releases: Release[];
}

export interface Release {
  version: string;
  artifact: string;
}

/**
 * Name of the environment variable that caps how many releases per distribution are deployed.
 *
 * Unset (or empty) means "every release in supported-distributions.json", which is what
 * production must always do: the version picker in the web app is populated from whatever the
 * deployed stack serves on `/validation/supported-distributions`, so dropping releases there
 * would remove versions users can validate against.
 */
export const MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR = 'MAX_RELEASES_PER_DISTRIBUTION';

export function readSupportedDistributions(): Distributions {
  return JSON.parse(
    readFileSync(join(__dirname, 'assets', 'supported-distributions.json')).toString(),
  ) as Distributions;
}

/**
 * Reads the release cap from the environment, validating it.
 *
 * Returns `undefined` when unset or empty, meaning "no cap".
 */
export function resolveMaxReleasesPerDistribution(env: NodeJS.ProcessEnv = process.env): number | undefined {
  const raw = env[MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR];
  if (raw === undefined || raw.trim() === '') {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(
      `'${MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR}' must be a positive integer or unset, got '${raw}'`,
    );
  }

  return parsed;
}

/**
 * Keeps only the newest `maxReleases` releases of each distribution.
 *
 * The releases in supported-distributions.json are stored newest-first (that is the order
 * `discover-new-releases.yaml` writes them in), so "newest N" is the head of the array and no
 * version sorting is needed here. The input is left untouched.
 */
export function selectReleases(distributions: Distributions, maxReleases?: number): Distributions {
  if (maxReleases === undefined) {
    return distributions;
  }

  return Object.fromEntries(
    Object.entries(distributions).map(([name, distribution]) => [
      name,
      { ...distribution, releases: distribution.releases.slice(0, maxReleases) },
    ]),
  );
}
