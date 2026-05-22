import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in environment variables");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const retryableErrors = [429, 500, 503];
const defaultModels = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const geminiModels = (process.env.GEMINI_MODELS || "")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const models = geminiModels.length > 0 ? geminiModels : defaultModels;

export class GeminiUnavailableError extends Error {
  constructor(
    message = "Recipe AI is temporarily busy. Please try again in a minute.",
  ) {
    super(message);
    this.name = "GeminiUnavailableError";
    this.statusCode = 503;
  }
}

const callGeminiModel = async (prompt, model, retries = 3, backoff = 2000) => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Empty response received from Gemini");
    }

    return text.trim();
  } catch (error) {
    const status = error.status || 500;

    console.error(`Gemini API error (${model}):`, status, error.message);

    if (retries > 0 && retryableErrors.includes(status)) {
      console.log(`Retrying Gemini ${model}... (${retries} left)`);

      await delay(backoff);

      return callGeminiModel(prompt, model, retries - 1, backoff * 2);
    }

    throw error;
  }
};

const callGemini = async (prompt) => {
  let lastError;

  for (const model of models) {
    try {
      return await callGeminiModel(prompt, model);
    } catch (error) {
      lastError = error;
      const status = error.status || 500;

      if (!retryableErrors.includes(status)) {
        throw error;
      }

      console.warn(`Gemini model ${model} unavailable. Trying fallback...`);
    }
  }

  throw new GeminiUnavailableError(lastError?.message);
};

/**
 * Clean and parse JSON safely
 */
const parseJSON = (text) => {
  try {
    // Remove markdown fences
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON object/array
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

    if (!match) {
      throw new Error("No valid JSON found");
    }

    return JSON.parse(match[0]);
  } catch (error) {
    console.error("JSON parse failed:", error.message);

    throw new Error("Invalid AI response format");
  }
};

// Basic sanitization
const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";

  return input.replace(/[{}$<>`]/g, "").trim();
};

// generate recipe

export const generateRecipe = async ({
  ingredients,
  dietaryRestrictions = [],
  cuisineType = "any",
  servings = 4,
  cookingTime = "medium",
}) => {
  const safeIngredients = ingredients.map(sanitizeInput);

  const safeDietaryRestrictions = dietaryRestrictions.map(sanitizeInput);

  const timeGuide = {
    quick: "under 30 minutes",
    medium: "30-60 minutes",
    long: "over 60 minutes",
  };

  const dietaryInfo =
    safeDietaryRestrictions.length > 0
      ? `Dietary restrictions: ${safeDietaryRestrictions.join(", ")}`
      : "No dietary restrictions";

  const prompt = `
Generate a detailed recipe.

Ingredients:
${safeIngredients.join(", ")}

${dietaryInfo}

Cuisine type: ${sanitizeInput(cuisineType)}
Servings: ${servings}
Cooking time: ${timeGuide[cookingTime] || "any"}

Return ONLY valid JSON.
Do not use Markdown formatting, bold markers, asterisks, or bullet symbols inside string values.

{
  "name": "Recipe name",
  "description": "Brief description",
  "cuisineType": "type",
  "difficulty": "easy",
  "prepTime": 10,
  "cookTime": 20,
  "servings": 4,
  "ingredients": [
    {
      "name": "ingredient",
      "quantity": 1,
      "unit": "cup"
    }
  ],
  "instructions": [
    "Step 1"
  ],
  "dietaryTags": [
    "vegetarian"
  ],
  "nutrition": {
    "calories": 300,
    "protein": 10,
    "carbs": 20,
    "fats": 15,
    "fiber": 5
  },
  "cookingTips": [
    "Tip 1"
  ]
}
`;

  try {
    const text = await callGemini(prompt);

    const recipe = parseJSON(text);

    // Basic validation
    if (!recipe.name || !Array.isArray(recipe.ingredients)) {
      throw new Error("Malformed recipe response");
    }

    return recipe;
  } catch (error) {
    console.error("Recipe generation failed:", error.message);

    if (error instanceof GeminiUnavailableError) {
      throw error;
    }

    throw new Error("Failed to generate recipe");
  }
};

// pantry suggestions

export const generatePantrySuggestions = async (
  pantryItems,
  expiringItems = [],
) => {
  try {
    const ingredients = pantryItems
      .map((item) => sanitizeInput(item.name))
      .join(", ");

    const expiringText =
      expiringItems.length > 0
        ? `Priority ingredients: ${expiringItems.join(", ")}`
        : "";

    const prompt = `
Suggest 3 recipe ideas.

Ingredients:
${ingredients}

${expiringText}

Return ONLY JSON array.

[
  "Idea 1",
  "Idea 2",
  "Idea 3"
]
`;

    const text = await callGemini(prompt);

    const suggestions = parseJSON(text);

    return Array.isArray(suggestions)
      ? suggestions
      : ["Simple mixed ingredient dish"];
  } catch (error) {
    console.error("Pantry suggestion failed:", error.message);

    return ["Try making a quick stir fry!"];
  }
};

/**
 * Cooking tips
 */
export const generateCookingTips = async (recipe) => {
  try {
    const prompt = `
Recipe: ${sanitizeInput(recipe.name)}

Provide 3 cooking tips.

Return ONLY JSON array.

[
  "Tip 1",
  "Tip 2",
  "Tip 3"
]
`;

    const text = await callGemini(prompt);

    const tips = parseJSON(text);

    return Array.isArray(tips) ? tips : ["Taste as you cook."];
  } catch (error) {
    console.error("Cooking tips failed:", error.message);

    return ["Cook patiently and taste often."];
  }
};

export default {
  generateRecipe,
  generatePantrySuggestions,
  generateCookingTips,
};
