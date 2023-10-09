import { Octokit } from "@octokit/rest";

// Declare that this is a module
export {};

interface GitHubReleaseAsset {
	name: string;
}

interface Release {
	version: string;
	artifact: string;
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISTRO_NAME: string;
			GH_REPOSITORY: string;
			GH_ASSET_PREFIX?: string;
			GH_ASSET_SUFFIX?: string;
		}
	}
}

const distroName = process.env.DISTRO_NAME;
const [owner, repo] = process.env.GH_REPOSITORY.split("/");

(async () => {
	const octokit = new Octokit();
	const iterator = octokit.paginate.iterator(octokit.rest.repos.listReleases, {
		owner,
		repo,
	});

	const foundReleases: Array<Release> = [];

	for await (const { data: releases } of iterator) {
		for (const release of releases) {
			let matchingAsset: string = "";

			switch (distroName) {
				case "otelcol-core":
				case "otelcol-contrib":
					const assetPrefix = process.env.GH_ASSET_PREFIX;
					if (!assetPrefix) {
						throw new Error('The required "GH_ASSET_PREFIX" environment variable is not set');
					}

					const assetSuffix = process.env.GH_ASSET_SUFFIX;
					if (!assetSuffix) {
						throw new Error('The required "GH_ASSET_SUFFIX" environment variable is not set');
					}

					matchingAsset = release.assets.find(
						(asset: GitHubReleaseAsset) => asset.name?.startsWith(assetPrefix) && asset.name?.endsWith(assetSuffix)
					)?.name;
					break;
				case "adot":
					/*
					 * ADOT is linking RPM packages in the body of the release. e.g.:
					 * https://aws-otel-collector.s3.amazonaws.com/amazon_linux/amd64/v0.33.2/aws-otel-collector.rpm
					 */
					matchingAsset = [...release.body?.toString().matchAll(/https?:\/\/\S+/g)].find((value) => {
						const url = value.toString();
						return url.includes("/amazon_linux/amd64/") && url.endsWith("rpm");
					})[0];
					break;
				default:
					throw new Error(`Unknown distro name '${distroName}'`);
			}

			if (matchingAsset) {
				foundReleases.push({
					version: release.tag_name || "",
					artifact: matchingAsset,
				});
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
