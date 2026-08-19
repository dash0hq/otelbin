import z from "zod";
import { Recipe } from "./recipes";
import cliProgress from "cli-progress";

type ValidationResult = "valid" | "invalid" | "unknown";

interface DistributionCompatibility {
  // Short distribution identifies as returned by the support-distribution endpoint.
  // Sample: otelcol-core, otelcol-contrib and adot
  distribution: string;
  // The version of the distribution.
  version: string;
  result: ValidationResult;
  // The error returned by the validation endpoint – if any.
  error?: string;
}

export interface RecipeWithDistributionCompatibility extends Recipe {
  compatibility: DistributionCompatibility[];
}

export async function validateRecipes(recipes: Recipe[]): Promise<RecipeWithDistributionCompatibility[]> {
  console.info("Retrieving supported distributions");
  const supportedDistributions = await getSupportedDistributions();
  const uniqueDistributionAndVersionCount = getUniqueDistributionAndVersionCount(supportedDistributions);
  console.info(`Retrieved ${Object.keys(supportedDistributions).length} supported distributions. In total ${uniqueDistributionAndVersionCount} distro/version permutations.`);

  console.info('Starting validation of recipes.');
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  try {
    let numberOfExecutedValidationCalls = 0;
    progressBar.start(recipes.length * uniqueDistributionAndVersionCount, numberOfExecutedValidationCalls);

    const result: RecipeWithDistributionCompatibility[] = [];


    // We could do a combination of Promise.all(recipes.map(...)) to run this
    // fully asynchronously, but this would just result in us immediately
    // hitting the rate limit and then running into timeouts/rate limiting failures.
    // So we do this in series. This also has the benefit that we can leverage
    // the server-side lease acquisition timeout.
    //
    // An alternative would do use a Bluebird like Promise.map(promises, {concurrency: 5}),
    // but this is not worth another dependency and the complexity that this brings to
    // this system.
    for (const recipe of recipes) {
      const compatibilities: DistributionCompatibility[] = [];

      for (const [distributionName, { releases }] of Object.entries(supportedDistributions)) {
        for (const { version: distributionVersion } of releases) {
          const compatibility = await validateRecipe(recipe, distributionName, distributionVersion);
          compatibilities.push(compatibility);
          numberOfExecutedValidationCalls++;
          progressBar.update(numberOfExecutedValidationCalls)
        }
      }
      result.push({
        ...recipe,
        compatibility: compatibilities
      });
    }

    return result;
  } finally {
    progressBar.stop();
  }
}

const supportedDistributionsSchema = z.record(z.object({
  releases: z.array(z.object({
    version: z.string()
  }))
}));
type SupportedDistributions = z.infer<typeof supportedDistributionsSchema>;

async function getSupportedDistributions(): Promise<SupportedDistributions> {
  const response = await fetch(`${process.env.API_ORIGIN}/validation/supported-distributions`);
  if (!response.ok) {
    throw new Error("Failed to retrieve list of supported distributions");
  }
  const body = await response.json();
  return supportedDistributionsSchema.parse(body);
}

async function validateRecipe(recipe: Recipe, distribution: string, version: string): Promise<DistributionCompatibility> {
  const response = await fetch(`${process.env.API_ORIGIN}/validation?distro=${encodeURIComponent(distribution)}&version=${encodeURIComponent(version)}`, {
    method: "POST",
    body: recipe.config
  });

  if (!response.ok) {
    throw new Error(`Failed to validate distribution configuration for ${distribution} ${version}`);
  }

  let result: ValidationResult = "valid";
  let error: string | undefined = undefined;
  const body = await response.json() as any;
  if ("error" in body && typeof body.error==="string") {
    result = "invalid";
    error = body.error;
  }

  return {
    distribution,
    version,
    result,
    error
  };
}

function getUniqueDistributionAndVersionCount(distributions: SupportedDistributions): number {
  return Object.values(distributions)
    .reduce((agg, distribution) => agg + distribution.releases.length, 0)
}
