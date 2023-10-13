import { Octokit } from "@octokit/rest";
import { satisfies } from "semver";

// Declare that this is a module
export {};

interface GitHubReleaseAsset {
	name: string;
}

interface Release {
	version: string;
	artifact: string;
	released_at?: Date;
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISTRO_NAME: string;
			GH_REPOSITORY: string;
			GH_ASSET_PREFIX?: string;
			GH_ASSET_SUFFIX?: string;
			IGNORED_RELEASES: string;
		}
	}
}

const distroName = process.env.DISTRO_NAME;
const [owner, repo] = process.env.GH_REPOSITORY.split("/");
const ignoredReleases = process.env.IGNORED_RELEASES;

(async () => {
	const octokit = new Octokit();
	const iterator = octokit.paginate.iterator(octokit.rest.repos.listReleases, {
		owner,
		repo,
	});

	const foundReleases: Array<Release> = [];

	for await (const { data: releases } of iterator) {
		for (const release of releases) {
			if (ignoredReleases && satisfies(release.tag_name, ignoredReleases)) {
				console.error(`Skipping release '${release.tag_name}', it falls within the range of ignored releases`);
				continue;
			}

			switch (distroName) {
				case "otelcol-core":
				case "otelcol-contrib": {
					const assetPrefix = process.env.GH_ASSET_PREFIX;
					if (!assetPrefix) {
						throw new Error('The required "GH_ASSET_PREFIX" environment variable is not set');
					}

					const assetSuffix = process.env.GH_ASSET_SUFFIX;
					if (!assetSuffix) {
						throw new Error('The required "GH_ASSET_SUFFIX" environment variable is not set');
					}

					const matchingAsset = release.assets?.find(
						(asset: GitHubReleaseAsset) => asset.name?.startsWith(assetPrefix) && asset.name?.endsWith(assetSuffix)
					);

					if (matchingAsset) {
						let released_at: Date | undefined;

						const timestamp = matchingAsset.updated_at || matchingAsset.created_at;
						if (timestamp) {
							released_at = new Date(timestamp);
						}

						foundReleases.push({
							version: release.tag_name!,
							artifact: matchingAsset.name,
							released_at,
						});
					} else {
						console.error(
							`Otel ${distroName} community release '${release.name}' has no recognizable RPM asset; this release will be skipped`
						);
					}

					break;
				}
				case "adot": {
					/*
					 * ADOT is linking RPM packages in the body of the release. e.g.:
					 * https://aws-otel-collector.s3.amazonaws.com/amazon_linux/amd64/v0.33.2/aws-otel-collector.rpm
					 */
					let matchingAsset: string | undefined;
					const urlsInReleaseBody = release.body?.toString().matchAll(/https?:\/\/\S+/g);
					if (urlsInReleaseBody) {
						const amazonLinuxRpmUrls = [...urlsInReleaseBody].find((value) => {
							const url = value.toString();
							return url.includes("/amazon_linux/amd64/") && url.endsWith("rpm");
						});

						if (amazonLinuxRpmUrls?.length) {
							matchingAsset = amazonLinuxRpmUrls[0];
						}
					}

					if (matchingAsset) {
						let released_at: Date | undefined;

						const timestamp = release.published_at || release.created_at;
						if (timestamp) {
							released_at = new Date(timestamp);
						}

						foundReleases.push({
							version: release.tag_name!,
							artifact: matchingAsset,
							released_at,
						});
					} else {
						console.error(
							`ADOT release '${release.name}' has no recognizable RPM URLs for Amazon Linux 2 in the release body; this release will be skipped`
						);
					}

					break;
				}
				default:
					throw new Error(`Unknown distro name '${distroName}'`);
			}
		}
	}

	console.log(
		JSON.stringify({
			[distroName]: {
				releases: foundReleases,
			},
		})
	);
})();
