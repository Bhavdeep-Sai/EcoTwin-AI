import { describe, it, expect } from 'vitest'
import {
  TRANSPORT_FACTORS,
  ENERGY_FACTORS,
  FOOD_FACTORS,
  SHOPPING_FACTORS,
  WASTE_FACTORS,
  RECYCLING_MULTIPLIER,
} from '@/lib/services/carbonFactors'
import { calculateStreak } from '@/lib/actions/activities'

// ---------------------------------------------------------------------------
// Carbon Factor Tests — validates that scientific coefficients match sources
// ---------------------------------------------------------------------------

describe('Carbon Factors — Scientific Accuracy', () => {

  describe('Transport Factors (EPA/DEFRA 2024)', () => {
    it('petrol car emits 0.170 kg CO₂e per km', () => {
      expect(TRANSPORT_FACTORS['Car (Petrol)'].factor).toBe(0.170)
    })

    it('diesel car emits 0.165 kg CO₂e per km', () => {
      expect(TRANSPORT_FACTORS['Car (Diesel)'].factor).toBe(0.165)
    })

    it('electric vehicle emits 0.045 kg CO₂e per km', () => {
      expect(TRANSPORT_FACTORS['Electric Vehicle (EV)'].factor).toBe(0.045)
    })

    it('walking/cycling emits 0 kg CO₂e', () => {
      expect(TRANSPORT_FACTORS['Walking / Bicycle'].factor).toBe(0.000)
    })

    it('bus emits less than petrol car per passenger-km', () => {
      expect(TRANSPORT_FACTORS['Bus (Public Transport)'].factor).toBeLessThan(
        TRANSPORT_FACTORS['Car (Petrol)'].factor
      )
    })

    it('all transport factors have valid reference URLs', () => {
      Object.values(TRANSPORT_FACTORS).forEach(f => {
        expect(f.reference_url).toMatch(/^https?:\/\//)
      })
    })

    it('calculates petrol car trip correctly', () => {
      const distanceKm = 25
      const factor = TRANSPORT_FACTORS['Car (Petrol)'].factor
      const emissions = distanceKm * factor
      expect(emissions).toBeCloseTo(4.25, 2)
    })
  })

  describe('Energy Factors (EPA eGRID / DEFRA / CEA 2024)', () => {
    it('US average grid emits 0.370 kg CO₂e per kWh', () => {
      expect(ENERGY_FACTORS['US Average Grid'].factor).toBe(0.370)
    })

    it('India grid emits more than US average (coal-heavy)', () => {
      expect(ENERGY_FACTORS['India Average Grid'].factor).toBeGreaterThan(
        ENERGY_FACTORS['US Average Grid'].factor
      )
    })

    it('solar/clean sourcing emits significantly less than grid', () => {
      expect(ENERGY_FACTORS['Solar / Clean Sourcing'].factor).toBeLessThan(
        ENERGY_FACTORS['US Average Grid'].factor * 0.2
      )
    })

    it('calculates 10 kWh on US grid correctly', () => {
      const kwh = 10
      const factor = ENERGY_FACTORS['US Average Grid'].factor
      expect(kwh * factor).toBeCloseTo(3.70, 2)
    })
  })

  describe('Food Factors (Our World In Data / Poore & Nemecek)', () => {
    it('vegan meal emits less than non-vegetarian meal', () => {
      expect(FOOD_FACTORS['Vegan / Plant-based'].factor).toBeLessThan(
        FOOD_FACTORS['Non-Vegetarian'].factor
      )
    })

    it('non-vegetarian meal emits 2.80 kg CO₂e', () => {
      expect(FOOD_FACTORS['Non-Vegetarian'].factor).toBe(2.80)
    })

    it('vegan meal emits 0.50 kg CO₂e', () => {
      expect(FOOD_FACTORS['Vegan / Plant-based'].factor).toBe(0.50)
    })

    it('all food factors cite valid reference year', () => {
      Object.values(FOOD_FACTORS).forEach(f => {
        expect(f.year).toBeGreaterThanOrEqual(2018)
      })
    })
  })

  describe('Shopping Factors (DEFRA Spend-Based 2024)', () => {
    it('electronics have higher factor than groceries', () => {
      expect(SHOPPING_FACTORS['Electronics'].factor).toBeGreaterThan(
        SHOPPING_FACTORS['Groceries'].factor
      )
    })

    it('calculates ₹500 clothing spend correctly', () => {
      const spend = 500
      const factor = SHOPPING_FACTORS['Clothing'].factor / 1000
      expect(spend * factor).toBeCloseTo(0.9, 2)
    })
  })

  describe('Waste Factors (EPA WARM Model)', () => {
    it('recycling multiplier reduces waste emissions by 90%', () => {
      expect(RECYCLING_MULTIPLIER).toBe(0.10)
    })

    it('plastic waste has highest factor', () => {
      expect(WASTE_FACTORS['Plastic'].factor).toBeGreaterThan(
        WASTE_FACTORS['Organic'].factor
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Streak Calculation Tests — validates real streak logic
// ---------------------------------------------------------------------------

describe('calculateStreak — Real Consecutive Day Streak', () => {
  // Helper: get local YYYY-MM-DD string matching activity_date storage format
  const localDateStr = (daysOffset: number): string => {
    const d = new Date()
    d.setDate(d.getDate() - daysOffset)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const daysAgo = (n: number) => localDateStr(n)

  it('returns 0 for empty activities', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 1 for a single activity logged today', () => {
    const activities = [{ activity_date: daysAgo(0) }]
    expect(calculateStreak(activities)).toBe(1)
  })

  it('returns 2 for activities on today and yesterday', () => {
    const activities = [
      { activity_date: daysAgo(0) },
      { activity_date: daysAgo(1) }
    ]
    expect(calculateStreak(activities)).toBe(2)
  })

  it('returns 0 if last activity was 2 days ago (gap in streak)', () => {
    const activities = [{ activity_date: daysAgo(2) }]
    expect(calculateStreak(activities)).toBe(0)
  })

  it('counts streak correctly with gap', () => {
    // 5 days ago through 3 days ago + today = NOT consecutive from today
    const activities = [
      { activity_date: daysAgo(0) },
      { activity_date: daysAgo(1) },
      { activity_date: daysAgo(2) },
      // gap at 3 days ago
      { activity_date: daysAgo(4) },
      { activity_date: daysAgo(5) },
    ]
    expect(calculateStreak(activities)).toBe(3)
  })

  it('handles multiple activities on the same day correctly', () => {
    const activities = [
      { activity_date: daysAgo(0) },
      { activity_date: daysAgo(0) }, // duplicate same day
      { activity_date: daysAgo(1) }
    ]
    expect(calculateStreak(activities)).toBe(2)
  })

  it('never returns a fabricated or inflated value', () => {
    // The old code did Math.min(activities.length + 2, 8)
    // This test confirms we don't add artificial bonuses
    const activities = [{ activity_date: daysAgo(0) }]
    const streak = calculateStreak(activities)
    // Should be 1, NOT 1+2=3
    expect(streak).toBe(1)
    expect(streak).not.toBe(3)
  })
})

// ---------------------------------------------------------------------------
// AI Insight Sanitization — validates content safety
// ---------------------------------------------------------------------------

describe('AI Output Sanitization Logic', () => {
  // Mirror the sanitize function from ai.ts for testing
  function sanitizeInsight(text: string): string | null {
    if (!text || text.trim().length < 5) return null
    let cleaned = text.trim().replace(/^["']|["']$/g, '')
    cleaned = cleaned.replace(/<[^>]*>/g, '')
    if (/^(error|failed|exception|traceback)/i.test(cleaned)) return null
    return cleaned.slice(0, 300)
  }

  it('strips wrapping double quotes from AI output', () => {
    const result = sanitizeInsight('"Try walking more often to reduce your footprint."')
    expect(result).toBe('Try walking more often to reduce your footprint.')
  })

  it('strips wrapping single quotes from AI output', () => {
    const result = sanitizeInsight("'Switch to a plant-based diet.'")
    expect(result).toBe('Switch to a plant-based diet.')
  })

  it('strips HTML tags from AI output', () => {
    const result = sanitizeInsight('Try <b>cycling</b> instead of driving.')
    expect(result).toBe('Try cycling instead of driving.')
  })

  it('rejects error messages from being stored as insights', () => {
    expect(sanitizeInsight('Error: 429 Too Many Requests')).toBeNull()
    expect(sanitizeInsight('Failed to process request')).toBeNull()
  })

  it('rejects very short content', () => {
    expect(sanitizeInsight('Hi')).toBeNull()
    expect(sanitizeInsight('')).toBeNull()
  })

  it('truncates content to 300 characters', () => {
    const longText = 'a'.repeat(400)
    const result = sanitizeInsight(longText)
    expect(result?.length).toBe(300)
  })

  it('passes valid insight content unchanged', () => {
    const text = 'Consider cycling instead of driving to reduce your transport footprint by 100%.'
    expect(sanitizeInsight(text)).toBe(text)
  })
})
