import { describe, expect, test } from '@jest/globals';
import {
  Distributions,
  MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR,
  readSupportedDistributions,
  resolveMaxReleasesPerDistribution,
  selectReleases,
} from './distributions';

const distribution = (versions: string[]) => ({
  provider: 'acme',
  description: 'test',
  website: 'https://example.com',
  repository: 'acme/collector',
  releases: versions.map(version => ({ version, artifact: `${version}.tar.gz` })),
});

const fixture = (): Distributions => ({
  'otelcol-core': distribution(['v0.5.0', 'v0.4.0', 'v0.3.0', 'v0.2.0']),
  'adot': distribution(['v0.9.0', 'v0.8.0']),
});

describe('selectReleases', () => {
  test('keeps every release when no cap is given', () => {
    expect(selectReleases(fixture(), undefined)).toEqual(fixture());
  });

  test('keeps the newest N releases of each distribution', () => {
    const selected = selectReleases(fixture(), 2);

    expect(selected['otelcol-core'].releases.map(r => r.version)).toEqual(['v0.5.0', 'v0.4.0']);
    expect(selected.adot.releases.map(r => r.version)).toEqual(['v0.9.0', 'v0.8.0']);
  });

  test('leaves distributions with fewer releases than the cap untouched', () => {
    expect(selectReleases(fixture(), 10)).toEqual(fixture());
  });

  test('preserves the non-release fields of each distribution', () => {
    expect(selectReleases(fixture(), 1)['otelcol-core']).toMatchObject({
      provider: 'acme',
      repository: 'acme/collector',
    });
  });

  test('does not mutate its input', () => {
    const input = fixture();
    selectReleases(input, 1);

    expect(input['otelcol-core'].releases).toHaveLength(4);
  });

  // The cap is the head of the array, so this ordering is load-bearing: if
  // discover-new-releases.yaml ever starts appending instead of prepending, preview
  // environments would silently deploy the *oldest* releases.
  test('supported-distributions.json lists releases newest-first', () => {
    const parse = (version: string) => version.replace(/^v/, '').split('.').map(Number);
    const compare = (a: number[], b: number[]) =>
      a.map((part, i) => part - (b[i] ?? 0)).find(d => d !== 0) ?? 0;

    for (const [name, dist] of Object.entries(readSupportedDistributions())) {
      const outOfOrder = dist.releases
        .map(r => r.version)
        .filter((version, i, versions) => i > 0 && compare(parse(versions[i - 1]), parse(version)) <= 0);

      expect({ [name]: outOfOrder }).toEqual({ [name]: [] });
    }
  });
});

describe('resolveMaxReleasesPerDistribution', () => {
  test('is undefined when unset', () => {
    expect(resolveMaxReleasesPerDistribution({})).toBeUndefined();
  });

  test('is undefined when empty, which is how the workflow spells "no cap"', () => {
    expect(resolveMaxReleasesPerDistribution({ [MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR]: '' })).toBeUndefined();
    expect(resolveMaxReleasesPerDistribution({ [MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR]: '  ' })).toBeUndefined();
  });

  test('parses a positive integer', () => {
    expect(resolveMaxReleasesPerDistribution({ [MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR]: '5' })).toBe(5);
  });

  test.each(['0', '-1', '2.5', 'five'])('rejects %p rather than silently deploying nothing', value => {
    expect(() => resolveMaxReleasesPerDistribution({ [MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR]: value }))
      .toThrow(MAX_RELEASES_PER_DISTRIBUTION_ENV_VAR);
  });
});
