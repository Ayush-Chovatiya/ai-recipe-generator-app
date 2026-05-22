import { useEffect, useState } from "react";
import { ChefHat, Plus, Sparkles, Users, X } from "lucide-react";
import toast from "react-hot-toast";

import FormattedRecipeText from "@/components/FormattedRecipeText";
import { generateRecipe, getProfile, saveRecipe } from "@/lib/api";

const CUISINES = [
  "Any",
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Japanese",
  "Thai",
  "French",
  "Mediterranean",
  "American",
];
const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
];
const COOKING_TIMES = [
  { value: "quick", label: "Quick (<30 min)" },
  { value: "medium", label: "Medium (30-60 min)" },
  { value: "long", label: "Long (>60 min)" },
];

const mapRecipeToSavePayload = (recipe) => {
  if (!recipe) {
    return null;
  }

  return {
    name: recipe.name,
    description: recipe.description ?? "",
    cuisine_type: recipe.cuisineType ?? recipe.cuisine_type ?? "any",
    difficulty: recipe.difficulty ?? "easy",
    prep_time: recipe.prepTime ?? recipe.prep_time ?? null,
    cook_time: recipe.cookTime ?? recipe.cook_time ?? null,
    servings: recipe.servings ?? 1,
    instructions: recipe.instructions ?? [],
    dietary_tags: recipe.dietaryTags ?? recipe.dietary_tags ?? [],
    user_notes: recipe.user_notes ?? "",
    image_url: recipe.image_url ?? recipe.imageUrl ?? null,
    ingredients: recipe.ingredients ?? [],
    nutrition: recipe.nutrition ?? null,
  };
};

function RecipeGenerator() {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [usePantry, setUsePantry] = useState(false);
  const [cuisineType, setCuisineType] = useState("Any");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [servings, setServings] = useState(4);
  const [cookingTime, setCookingTime] = useState("medium");
  const [generating, setGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const result = await getProfile();
        const preferences = result?.preferences;
        if (preferences?.dietary_restrictions?.length) {
          setDietaryRestrictions(preferences.dietary_restrictions);
        }
        if (preferences?.preferred_cuisines?.length) {
          setCuisineType(preferences.preferred_cuisines[0]);
        }
        if (preferences?.default_servings) {
          setServings(preferences.default_servings);
        }
      } catch (error) {
        toast.error(
          error?.message ?? "Unable to load preferences. Please try again.",
        );
      }
    };

    loadPreferences();
  }, []);

  const addIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInputValue("");
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(ingredients.filter((item) => item !== ingredient));
  };

  const toggleDietary = (option) => {
    if (dietaryRestrictions.includes(option)) {
      setDietaryRestrictions(
        dietaryRestrictions.filter((item) => item !== option),
      );
    } else {
      setDietaryRestrictions([...dietaryRestrictions, option]);
    }
  };

  const handleGenerate = async () => {
    if (!usePantry && ingredients.length === 0) {
      toast.error("Please add at least one ingredient or use pantry items");
      return;
    }

    setGenerating(true);
    setGeneratedRecipe(null);

    try {
      const payload = {
        ingredients,
        usePantryIngredients: usePantry,
        dietaryRestrictions,
        cuisineType: cuisineType.toLowerCase(),
        servings,
        cookingTime,
      };
      const result = await generateRecipe(payload);
      setGeneratedRecipe(result.recipe);
      toast.success("Recipe generated successfully!");
    } catch (error) {
      toast.error(
        error?.message ?? "Unable to generate recipe. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) {
      return;
    }

    setSaving(true);
    try {
      const payload = mapRecipeToSavePayload(generatedRecipe);
      await saveRecipe(payload);
      toast.success("Recipe saved to your collection!");
    } catch (error) {
      toast.error(error?.message ?? "Unable to save recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="page-heading">AI Recipe Generator</h1>
        <p className="mt-2 text-gray-600">
          Let AI create delicious recipes based on your ingredients
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-6">
          <div className="responsive-card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Ingredients
            </h2>

            <div className="mb-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
              <input
                type="checkbox"
                id="use-pantry"
                checked={usePantry}
                onChange={(event) => setUsePantry(event.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <label
                htmlFor="use-pantry"
                className="text-sm font-medium text-emerald-900"
              >
                Use ingredients from my pantry
              </label>
            </div>

            <div className="mb-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyPress={(event) => event.key === "Enter" && addIngredient()}
                placeholder="Add ingredient (e.g., tomatoes)"
                className="form-control flex-1"
              />
              <button
                onClick={addIngredient}
                className="tap-target flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-white transition-colors hover:bg-emerald-600"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <span
                    key={`${ingredient}-${index}`}
                    className="inline-flex min-h-9 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="transition-colors hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="responsive-card space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cuisine Type
              </label>
              <select
                value={cuisineType}
                onChange={(event) => setCuisineType(event.target.value)}
                className="form-control"
              >
                {CUISINES.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Dietary Restrictions
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleDietary(option)}
                    className={`tap-target rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      dietaryRestrictions.includes(option)
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Servings: {servings}
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={servings}
                onChange={(event) =>
                  setServings(parseInt(event.target.value, 10))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-emerald-500"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>12</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cooking Time
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {COOKING_TIMES.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setCookingTime(time.value)}
                    className={`tap-target rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      cookingTime === time.value
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-4 font-semibold text-white transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating Recipe...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Recipe
              </>
            )}
          </button>
        </div>

        <div>
          {generatedRecipe ? (
            <div className="responsive-card space-y-6">
              <div>
                <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                  {generatedRecipe.name}
                </h2>
                <p className="text-gray-600">{generatedRecipe.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(generatedRecipe.cuisineType ||
                    generatedRecipe.cuisine_type) && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                      {generatedRecipe.cuisineType ||
                        generatedRecipe.cuisine_type}
                    </span>
                  )}
                  {generatedRecipe.difficulty && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                      {generatedRecipe.difficulty}
                    </span>
                  )}
                  {generatedRecipe.dietaryTags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    <span>
                      {(generatedRecipe.prepTime || 0) +
                        (generatedRecipe.cookTime || 0)}{" "}
                      mins
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{generatedRecipe.servings} servings</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {generatedRecipe.ingredients?.map((ing, index) => (
                    <li
                      key={`${ing.name}-${index}`}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {ing.quantity} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Instructions
                </h3>
                <ol className="space-y-3">
                  {generatedRecipe.instructions?.map((step, index) => (
                    <li key={`${index}-${step}`} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-gray-700">
                        <FormattedRecipeText text={step} />
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {generatedRecipe.nutrition && (
                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Nutrition (per serving)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <NutritionBadge
                      label="Calories"
                      value={generatedRecipe.nutrition.calories}
                      unit="kcal"
                    />
                    <NutritionBadge
                      label="Protein"
                      value={generatedRecipe.nutrition.protein}
                      unit="g"
                    />
                    <NutritionBadge
                      label="Carbs"
                      value={generatedRecipe.nutrition.carbs}
                      unit="g"
                    />
                    <NutritionBadge
                      label="Fats"
                      value={generatedRecipe.nutrition.fats}
                      unit="g"
                    />
                    <NutritionBadge
                      label="Fiber"
                      value={generatedRecipe.nutrition.fiber}
                      unit="g"
                    />
                  </div>
                </div>
              )}

              {generatedRecipe.cookingTips?.length ? (
                <div className="rounded-lg bg-emerald-50 p-4">
                  <h3 className="mb-2 font-semibold text-emerald-900">
                    Cooking Tips
                  </h3>
                  <ul className="space-y-1 text-sm text-emerald-800">
                    {generatedRecipe.cookingTips.map((tip, index) => (
                      <li key={`${index}-${tip}`}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex gap-3 border-t border-gray-200 pt-4">
                <button
                  onClick={handleSaveRecipe}
                  disabled={saving}
                  className="tap-target flex-1 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Recipe"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500 sm:p-10 lg:h-full">
              Generate a recipe to see the results here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const NutritionBadge = ({ label, value, unit }) => (
  <div className="rounded-lg bg-gray-50 p-3 text-center sm:p-4">
    <div className="text-xl font-bold text-gray-900 sm:text-2xl">
      {value}
      {unit}
    </div>
    <div className="mt-1 text-sm text-gray-600">{label}</div>
  </div>
);

export default RecipeGenerator;
