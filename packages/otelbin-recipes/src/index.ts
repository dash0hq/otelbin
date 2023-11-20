import "dotenv/config";

import { getRecipes } from "./recipes";
import { validateRecipes } from "./validation";
import fs from "fs/promises";
import path from "path";

main()
  .catch(e => {
    console.error("Uncaught error in main()", e);
    process.exit(1);
  });

async function main() {
  console.info('Collecting recipes');
  const recipes = await getRecipes();
  console.info(`Found %d recipes`, recipes.length)

  const validatedRecipes = await validateRecipes(recipes);

  await fs.writeFile(path.join(__dirname, '..', 'result.json'), JSON.stringify(validatedRecipes))
  console.log('Output written to result.json');
}
