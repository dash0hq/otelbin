/**
 * Prints the integration-test matrix as a JSON array of `<distribution>/<version>` entries.
 *
 * `ci.yaml` feeds this straight into the `run-itests` matrix. It shares `selectReleases` with
 * the stack so the matrix can never ask for a release the deployed stack does not expose: both
 * read supported-distributions.json and apply the same MAX_RELEASES_PER_DISTRIBUTION cap.
 */
import { readSupportedDistributions, resolveMaxReleasesPerDistribution, selectReleases } from './distributions';

export function buildTestMatrix(maxReleasesPerDistribution?: number): string[] {
  const distributions = selectReleases(readSupportedDistributions(), maxReleasesPerDistribution);

  return Object.entries(distributions).flatMap(
    ([name, distribution]) => distribution.releases.map(release => `${name}/${release.version}`),
  );
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(buildTestMatrix(resolveMaxReleasesPerDistribution())));
}
