import { z } from 'zod'

export const recipeGenerationSchema = z.object({
  ingredients: z.string().min(1, 'Enter at least one ingredient'),
  usePantryIngredients: z.boolean().default(false),
  dietaryRestrictions: z.string().optional(),
  cuisineType: z.string().optional(),
  servings: z.coerce
    .number()
    .int('Servings must be a whole number')
    .min(1, 'Servings must be at least 1')
    .max(20, 'Servings must be 20 or less'),
  cookingTime: z.enum(['quick', 'medium', 'long']).default('medium'),
})
