"use client"

import { useState } from "react"
import { Apple, Search, Loader2, Leaf, AlertTriangle, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { SubmitButton } from "./submit-button"
import { logActivity } from "@/lib/actions/activities"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FOOD_FACTORS } from "@/lib/services/carbonFactors"
import { CalculationInspector } from "@/components/ui/calculation-inspector"

export function FoodForm() {
  const [meal, setMeal] = useState("Lunch")
  const [diet, setDiet] = useState("Non-Vegetarian")
  const [calcMode, setCalcMode] = useState<'quick' | 'product'>('quick')
  const [barcode, setBarcode] = useState("")
  const [productData, setProductData] = useState<{
    barcode: string;
    product_name: string;
    eco_score: string;
    carbon_100g_g: number;
    ingredients_analysis: Record<string, unknown>;
    packaging_info: { packaging_materials: string[]; recyclable: boolean };
  } | null>(null)
  const [searching, setSearching] = useState(false)
  const [quantityGrams, setQuantityGrams] = useState(100)

  const getEstimatedImpact = () => {
    if (calcMode === 'quick') {
      const activeFactorData = FOOD_FACTORS[diet]
      return activeFactorData ? activeFactorData.factor : 0
    }
    if (productData) {
      return ((productData.carbon_100g_g / 100) * quantityGrams) / 1000
    }
    return 0
  }
  const estimatedImpact = getEstimatedImpact()

  const activeFactorData = calcMode === 'quick'
    ? FOOD_FACTORS[diet]
    : productData 
      ? {
          factor: productData.carbon_100g_g,
          unit: "g CO₂e / 100g",
          source: "OpenFoodFacts (Agribalyse LCA)",
          year: 2024,
          reference_url: "https://world.openfoodfacts.org/",
          assumptions: `Lifecycle assessment for "${productData.product_name}" based on ingredients and packaging analysis.`,
          formula: `Emissions (kg CO₂e) = (g CO₂e per 100g / 100) × Quantity (g) / 1000`
        }
      : undefined

  async function searchProduct(codeToSearch?: string) {
    const activeBarcode = codeToSearch || barcode
    if (!activeBarcode.trim()) {
      toast.error("Please enter a valid product barcode.")
      return
    }

    setSearching(true)
    setProductData(null)

    try {
      const res = await fetch(`/api/datasets/food?barcode=${encodeURIComponent(activeBarcode)}`)
      if (!res.ok) throw new Error("Failed to load product details")
      const result = await res.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setProductData(result)
      toast.success("Product details loaded successfully!")
    } catch (err: unknown) {
      toast.error("Food lookup failed", { description: err instanceof Error ? err.message : "Ensure barcode is in OpenFoodFacts database." })
    } finally {
      setSearching(false)
    }
  }


  const getEcoScoreColor = (score: string) => {
    switch (score?.toUpperCase()) {
      case 'A': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'B': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
      case 'C': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
      case 'D': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
      case 'E': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      default: return 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
    }
  }

  async function action() {
    let impactKg = 0
    let title = ""
    const details: Record<string, unknown> = { meal_type: meal }

    if (calcMode === 'quick') {
      impactKg = estimatedImpact
      title = `${diet} ${meal}`
      details.diet_category = diet
    } else {
      if (!productData) {
        toast.error("Please select or search a product first.")
        return
      }
      if (quantityGrams <= 0) {
        toast.error("Please specify a valid quantity in grams.")
        return
      }
      impactKg = estimatedImpact
      title = `${productData.product_name} (${quantityGrams}g) for ${meal}`
      
      details.barcode = productData.barcode
      details.product_name = productData.product_name
      details.eco_score = productData.eco_score
      details.carbon_100g_g = productData.carbon_100g_g
      details.ingredients_analysis = productData.ingredients_analysis
      details.packaging_info = productData.packaging_info
      details.logged_quantity_grams = quantityGrams
    }

    try {
      await logActivity("food", title, Number(impactKg.toFixed(2)), details)
      toast.success("Food activity logged successfully!", {
        description: `Estimated impact: ${impactKg.toFixed(2)} kg CO₂e`,
      })
      if (calcMode === 'product') {
        setBarcode("")
        setProductData(null)
        setQuantityGrams(100)
      }
    } catch (err: unknown) {
      toast.error("Failed to log food activity", { description: err instanceof Error ? err.message : "Unknown error" })
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Mode Toggle Tabs */}
      <div className="flex bg-muted border border-border/60 p-1 rounded-lg w-full max-w-sm">
        <button
          type="button"
          onClick={() => setCalcMode('quick')}
          className={`flex-1 text-xs py-1.5 font-bold rounded-md transition-all cursor-pointer ${calcMode === 'quick' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Quick Meal Log
        </button>
        <button
          type="button"
          onClick={() => setCalcMode('product')}
          className={`flex-1 text-xs py-1.5 font-bold rounded-md transition-all cursor-pointer ${calcMode === 'product' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Scan/Search Barcode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="meal-type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Meal Type
          </label>
          <Select value={meal} onValueChange={(val) => { if (val) setMeal(val) }}>
            <SelectTrigger id="meal-type" className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground">
              <SelectValue placeholder="Select meal" />
            </SelectTrigger>
            <SelectContent className="rounded-md shadow-lg border-border">
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
              <SelectItem value="Snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {calcMode === 'quick' ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="diet-category" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Diet Category
            </label>
            <Select value={diet} onValueChange={(val) => { if (val) setDiet(val) }}>
              <SelectTrigger id="diet-category" className="w-full h-11 rounded-md bg-background border-border shadow-sm hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all px-4 text-xs font-medium text-foreground">
                <SelectValue placeholder="Select diet" />
              </SelectTrigger>
              <SelectContent className="rounded-md shadow-lg border-border">
                <SelectItem value="Non-Vegetarian">Non-Vegetarian (Meat/Dairy)</SelectItem>
                <SelectItem value="Indian Vegetarian (Dairy-heavy)">Indian Vegetarian (Dairy-heavy)</SelectItem>
                <SelectItem value="Vegan / Plant-based">Vegan / Plant-based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-col gap-4 col-span-1 md:col-span-2">            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="product-barcode" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Barcode (UPC/EAN)</label>
                <div className="relative">
                  <Input 
                    id="product-barcode"
                    type="text" 
                    placeholder="Enter EAN barcode (e.g. 3017670149713)" 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full h-11 rounded-md bg-background border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 px-4 pl-10 text-xs font-medium text-foreground"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="food-weight" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight consumed</label>
                <div className="relative">
                  <Input 
                    id="food-weight"
                    type="number" 
                    min="1" 
                    placeholder="100" 
                    value={quantityGrams}
                    onChange={(e) => setQuantityGrams(Number(e.target.value))}
                    className="w-full h-11 rounded-md bg-background border-border shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 px-4 text-xs font-medium text-foreground"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                    g
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={searching}
              onClick={() => searchProduct()}
              className="w-full h-10 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-border/85"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Querying OpenFoodFacts...
                </>
              ) : (
                "Query Product Data"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Carbon Nutrition Label Details */}
      {calcMode === 'product' && productData && (
        <div className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col gap-4 transition-all">
          <div className="flex items-start justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-sm font-black text-foreground">{productData.product_name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Barcode: {productData.barcode}</p>
            </div>
            
            <div className={`flex flex-col items-center border rounded-xl px-2.5 py-1 ${getEcoScoreColor(productData.eco_score)}`}>
              <span className="text-[9px] uppercase font-black tracking-wider leading-none">Eco-Score</span>
              <span className="text-base font-black leading-none mt-1">{productData.eco_score}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Ingredients Analysis */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Environment Indicators</span>
              
              <div className="flex items-center gap-2">
                {productData.ingredients_analysis?.palm_oil ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    Contains Palm Oil
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    No Palm Oil
                  </span>
                )}
                
                {Boolean(productData.ingredients_analysis?.vegan) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <Leaf className="h-3 w-3" />
                    Vegan
                  </span>
                )}
                
                {Boolean(productData.ingredients_analysis?.vegetarian) && !Boolean(productData.ingredients_analysis?.vegan) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 bg-primary/10 text-primary">
                    <Apple className="h-3 w-3" />
                    Vegetarian
                  </span>
                )}
              </div>
            </div>

            {/* Packaging */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Packaging Details</span>
              <div className="text-[11px] text-foreground/80 font-medium">
                {productData.packaging_info?.packaging_materials?.length > 0 ? (
                  <span className="capitalize">{productData.packaging_info.packaging_materials.join(", ")}</span>
                ) : (
                  <span>Unspecified packaging</span>
                )}
                {productData.packaging_info?.recyclable !== undefined && (
                  <span className={`inline-block ml-2 text-[9px] font-bold px-1.5 py-0.2 rounded border ${productData.packaging_info.recyclable ? 'border-primary/25 bg-primary/10 text-primary' : 'border-muted-foreground/25 bg-muted-foreground/10 text-muted-foreground'}`}>
                    {productData.packaging_info.recyclable ? 'Recyclable' : 'Non-Recyclable'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Footprint rate</span>
              <span className="text-xs font-semibold text-foreground/80">{productData.carbon_100g_g}g CO₂e / 100g</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Total Carbon impact</span>
              <span className="text-base font-black text-primary">{estimatedImpact.toFixed(3)} kg CO₂e</span>
            </div>
          </div>
        </div>
      )}

      <CalculationInspector 
        factorData={activeFactorData}
        quantityText={calcMode === 'quick' ? "1 meal" : `${quantityGrams}g`}
      />
      <SubmitButton />
    </form>
  )
}
