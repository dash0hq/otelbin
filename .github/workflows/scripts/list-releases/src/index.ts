import { Octokit } from '@octokit/rest';

// Declare that this is a module
export {};

interface Release {
    version: string;
    artifact: string;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISTRO_NAME: string;
            GH_REPOSITORY: string;
            GH_ASSET_PREFIX: string;
            GH_ASSET_SUFFIX: string;
        }
    }
}

const distroName = process.env.DISTRO_NAME;
const [ owner, repo ] = process.env.GH_REPOSITORY.split('/');
const assetPrefix = process.env.GH_ASSET_PREFIX;
const assetSuffix = process.env.GH_ASSET_SUFFIX;

(async () => {
    const octokit = new Octokit();
    const iterator = octokit.paginate.iterator(octokit.rest.repos.listReleases, {
        owner,
        repo,
    });

    const foundReleases : Array<Release> = [];

    for await (const { data: releases } of iterator) {
        for (const release of releases) {
            let matchingAsset = release.assets.find((asset) => asset.name?.startsWith(assetPrefix) && asset.name?.endsWith(assetSuffix));
            if (matchingAsset) {
                foundReleases.push({
                    version: release.tag_name || '',
                    artifact: matchingAsset.name,
                });
            }
        }
    }

    console.log(JSON.stringify({
        [distroName]: {
            releases: foundReleases
        }
    }));
})();