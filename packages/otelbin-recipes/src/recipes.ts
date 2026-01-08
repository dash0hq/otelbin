import z from "zod";
import fs from "fs/promises";
import path from "path";
import { load } from "js-yaml";

export const recipeSchema = z.object({
  title: z.string(),
  author: z.string(),
  description: z.string(),
  // We keep the config as a string so that recipe authors can embed comments.
  config: z.string()
})
export type Recipe = z.infer<typeof recipeSchema>

export async function getRecipes(): Promise<Recipe[]> {
  const directoryEntries = await fs.readdir(path.join(__dirname, '..', 'recipes'), {
    withFileTypes: true
  });

  return Promise.all(directoryEntries
    .filter(entry => entry.isFile())
    .map(entry => getRecipe(path.join(entry.path, entry.name))));
}

async function getRecipe(absolutePath: string): Promise<Recipe> {
  const fileContent = await fs.readFile(absolutePath, {encoding: 'utf8'});
  return recipeSchema.parse(load(fileContent));
}
