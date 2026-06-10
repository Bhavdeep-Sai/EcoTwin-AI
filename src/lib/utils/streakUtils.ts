/**
 * Calculates the number of consecutive days the user has logged at least one activity,
 * counting backward from today. Returns 0 if no activity was logged today or yesterday.
 */
export function calculateStreak(activities: { activity_date: string }[]): number {
  if (!activities || activities.length === 0) return 0

  // Collect unique logged dates (stored as YYYY-MM-DD local time strings)
  const loggedDates = new Set(activities.map((a: { activity_date: string }) => a.activity_date))

  // Helper: get local YYYY-MM-DD string for a Date offset by N days from now
  const localDateStr = (daysOffset: number): string => {
    const d = new Date()
    d.setDate(d.getDate() - daysOffset)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const todayStr = localDateStr(0)
  const yesterdayStr = localDateStr(1)

  // Only count a streak if the user logged today or yesterday (avoids stale streaks)
  if (!loggedDates.has(todayStr) && !loggedDates.has(yesterdayStr)) return 0

  // Start counting from whichever is more recent
  let streak = 0
  let offset = loggedDates.has(todayStr) ? 0 : 1

  while (true) {
    const checkStr = localDateStr(offset)
    if (!loggedDates.has(checkStr)) break
    streak++
    offset++
  }

  return streak
}
