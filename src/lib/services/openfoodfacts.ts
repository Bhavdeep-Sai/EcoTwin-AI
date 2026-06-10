import { getCachedFood, setCachedFood } from '../db/environmentalCache';

export interface FoodProductDetails {
  barcode: string;
  product_name: string;
  eco_score: 'A' | 'B' | 'C' | 'D' | 'E' | 'Unknown';
  carbon_100g_g: number; // in grams CO2e per 100g of product
  ingredients_analysis: {
    palm_oil?: boolean;
    vegetarian?: boolean;
    vegan?: boolean;
    non_ecological_ingredients?: string[];
  };
  packaging_info: {
    packaging_materials?: string[];
    recyclable?: boolean;
    recycling_notes?: string;
  };
}

/**
 * Standard fallback carbon rates based on Agribalyse Eco-score levels
 * if the product doesn't explicitly report carbon footprint.
 * Values are in grams CO2e per 100g.
 */
const ECO_SCORE_CARBON_FALLBACK: Record<string, number> = {
  A: 60,   // Low carbon (mostly organic local vegetables, grains)
  B: 150,  // Low-medium (poultry, processed vegan foods)
  C: 300,  // Medium (pork, dairy products)
  D: 600,  // Medium-high (farmed fish, processed snacks with palm oil)
  E: 1200  // High carbon (beef, lamb, imported out-of-season air-freighted foods)
};

export async function fetchFoodProduct(barcode: string): Promise<FoodProductDetails> {
  // 1. Check local / database cache first
  const cached = await getCachedFood(barcode);
  if (cached) {
    return {
      barcode: cached.barcode,
      product_name: cached.product_name,
      eco_score: cached.eco_score as 'A' | 'B' | 'C' | 'D' | 'E' | 'Unknown',
      carbon_100g_g: Number(cached.carbon_100g_g),
      ingredients_analysis: cached.ingredients_analysis || {},
      packaging_info: cached.packaging_info || {}
    };
  }

  // 2. Fetch from OpenFoodFacts API
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
  const userAgent = 'EcoTwinAI - WebApp - Version 1.0 - contact@ecotwin.ai';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': userAgent
      },
      next: { revalidate: 2592000 } // Next.js HTTP fetch caching (30 days)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;

        // Extract Eco-Score
        let ecoScore: FoodProductDetails['eco_score'] = 'Unknown';
        if (p.ecoscore_grade) {
          ecoScore = p.ecoscore_grade.toUpperCase() as FoodProductDetails['eco_score'];
        }

        // Extract Carbon Footprint (grams CO2e per 100g)
        let carbon100g = 0;
        if (p.nutriments) {
          const rawCarbon = 
            p.nutriments['carbon-footprint-from-known-ingredients_100g'] || 
            p.nutriments['carbon-footprint_100g'] ||
            p.nutriments['carbon-footprint-from-meat-or-fish_100g'];
          
          if (rawCarbon !== undefined && rawCarbon !== null) {
            carbon100g = Number(rawCarbon);
          }
        }

        // Apply fallback if carbon is not explicitly listed, but Eco-Score is available
        if (carbon100g === 0 && ecoScore !== 'Unknown') {
          carbon100g = ECO_SCORE_CARBON_FALLBACK[ecoScore] || 300;
        } else if (carbon100g === 0) {
          carbon100g = 300; // Default baseline if absolutely unknown
        }

        // Analyze ingredients
        const palmOil = p.ingredients_analysis_tags?.includes('en:palm-oil') || false;
        const vegetarian = p.ingredients_analysis_tags?.includes('en:vegetarian') || false;
        const vegan = p.ingredients_analysis_tags?.includes('en:vegan') || false;

        const nonEco: string[] = [];
        if (palmOil) nonEco.push('palm oil');
        if (p.ingredients_tags) {
          if (p.ingredients_tags.some((tag: string) => tag.includes('beef') || tag.includes('meat'))) {
            nonEco.push('high-impact meat');
          }
        }

        // Packaging
        const packagingMaterials = p.packaging?.materials || [];
        const recyclable = p.packaging_tags?.some((tag: string) => tag.includes('recyclable') || tag.includes('recycle')) || false;

        const parsedProduct: FoodProductDetails = {
          barcode,
          product_name: p.product_name || `Unknown Product (${barcode})`,
          eco_score: ecoScore,
          carbon_100g_g: carbon100g,
          ingredients_analysis: {
            palm_oil: palmOil,
            vegetarian,
            vegan,
            non_ecological_ingredients: nonEco
          },
          packaging_info: {
            packaging_materials: Array.isArray(packagingMaterials) ? packagingMaterials : [packagingMaterials].filter(Boolean),
            recyclable,
            recycling_notes: p.packaging_text || ''
          }
        };

        // Cache the newly fetched product
        await setCachedFood(barcode, parsedProduct);
        return parsedProduct;
      }
    }
  } catch (error) {
    console.error(`Error querying OpenFoodFacts API for barcode ${barcode}:`, error);
  }

  // 3. Throw a clean error if product is not found or API is unreachable
  throw new Error(`Product details unavailable. The barcode "${barcode}" could not be resolved in the OpenFoodFacts database, or the network is offline.`);
}
