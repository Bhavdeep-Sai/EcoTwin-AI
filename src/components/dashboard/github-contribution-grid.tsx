"use client"

import React, { useState, useMemo, useRef } from 'react'

interface ContributionGridProps {
  activities: any[]
}

interface DayData {
  isPlaceholder: boolean;
  date: Date | null;
  dateString: string;
  count: number;
  carbonAvoided: number;
  sources: string[];
}

const categoryLabels: Record<string, string> = {
  transport: 'Transportation',
  food: 'Food',
  electricity: 'Energy',
  shopping: 'Shopping',
  waste: 'Waste'
};

// Helper to format Date in local YYYY-MM-DD timezone (avoids UTC timezone shift bug)
function getLocalDateString(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function GithubContributionGrid({ activities }: ContributionGridProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // Handle scroll for fade indicators on mobile
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const showLeft = target.scrollLeft > 10;
    const showRight = target.scrollLeft < (target.scrollWidth - target.clientWidth - 10);
    setShowLeftFade(showLeft);
    setShowRightFade(showRight);
  };

  // Find the oldest activity date (user joining date)
  const oldestActivityDate = useMemo(() => {
    if (activities.length === 0) {
      const today = new Date();
      const defaultStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);
      return defaultStart;
    }

    let oldest = new Date();
    activities.forEach((act: any) => {
      const actDate = new Date(act.activity_date);
      if (actDate < oldest) {
        oldest = actDate;
      }
    });
    // Normalize time to 00:00:00 local time
    oldest.setHours(0, 0, 0, 0);
    return oldest;
  }, [activities]);

  // Determine starting month based on earliest activity (user joining month)
  const startMonth = useMemo(() => {
    const today = new Date();
    const defaultStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    if (activities.length === 0) {
      return defaultStart;
    }

    const oldestMonth = new Date(oldestActivityDate.getFullYear(), oldestActivityDate.getMonth(), 1);

    // If oldest month is more recent than defaultStart, start from oldestMonth (trimming old months)
    if (oldestMonth > defaultStart) {
      return oldestMonth;
    }

    return defaultStart;
  }, [activities, oldestActivityDate]);

  // Generate months dynamically from startMonth to current month
  const monthsData = useMemo(() => {
    const today = new Date();
    const list: { name: string; year: number; monthIndex: number; weeks: DayData[][] }[] = [];

    // Calculate how many months between startMonth and today
    const diffMonths = (today.getFullYear() - startMonth.getFullYear()) * 12 + (today.getMonth() - startMonth.getMonth());
    const totalMonths = Math.max(1, diffMonths + 1);

    for (let i = 0; i < totalMonths; i++) {
      const date = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const name = date.toLocaleDateString('en-US', { month: 'short' });

      // Get number of days in this month
      const numDays = new Date(year, monthIndex + 1, 0).getDate();

      // Weekday offsets
      const startWeekday = new Date(year, monthIndex, 1).getDay(); // 0 = Sun, 1 = Mon...
      const endWeekday = new Date(year, monthIndex, numDays).getDay();

      const tempCells: DayData[] = [];

      // 1. Pad start of the month to Sunday (invisible placeholders)
      for (let pad = 0; pad < startWeekday; pad++) {
        tempCells.push({
          isPlaceholder: true,
          date: null,
          dateString: '',
          count: 0,
          carbonAvoided: 0,
          sources: []
        });
      }

      // 2. Add actual days of the month
      for (let day = 1; day <= numDays; day++) {
        const cellDate = new Date(year, monthIndex, day);
        cellDate.setHours(0, 0, 0, 0);
        const dateString = getLocalDateString(cellDate);

        // Find activities logged on this date
        const dayActivities = activities.filter((act: any) => act.activity_date === dateString);
        const count = dayActivities.length;
        let carbonAvoided = 0;
        const sourcesSet = new Set<string>();

        dayActivities.forEach((act: any) => {
          let savings = 0;
          if (act.category === 'transport') {
            const distance = act.details?.distance_km || 10;
            const baseline = distance * 0.170; // 170g CO2e/km baseline
            savings = Math.max(0, baseline - Number(act.carbon_impact_kg || 0));
          } else if (act.category === 'food') {
            savings = Math.max(0, 3.0 - Number(act.carbon_impact_kg || 0));
          } else if (act.category === 'electricity') {
            const kwh = act.details?.kwh_used || 10;
            const baseline = kwh * 0.370;
            savings = Math.max(0, baseline - Number(act.carbon_impact_kg || 0));
          } else if (act.category === 'waste') {
            const weight = act.details?.weight_kg || 1;
            if (act.details?.recycled) {
              savings = weight * 0.5 * 0.9;
            } else {
              savings = 0;
            }
          } else if (act.category === 'shopping') {
            const cost = act.details?.cost || 100;
            savings = Math.max(0, (cost * 0.2) / 1000);
          } else {
            savings = 1.0;
          }
          carbonAvoided += savings;
          const catLabel = categoryLabels[act.category] || act.category;
          sourcesSet.add(catLabel);
        });

        tempCells.push({
          // Always render calendar days of the month
          isPlaceholder: false,
          date: cellDate,
          dateString,
          count,
          carbonAvoided: Number(carbonAvoided.toFixed(1)),
          sources: Array.from(sourcesSet)
        });
      }

      // 3. Pad end of the month to Saturday (invisible placeholders)
      for (let pad = 0; pad < 6 - endWeekday; pad++) {
        tempCells.push({
          isPlaceholder: true,
          date: null,
          dateString: '',
          count: 0,
          carbonAvoided: 0,
          sources: []
        });
      }

      // 4. Chunk cells into weeks of 7 days
      const weeks: DayData[][] = [];
      for (let c = 0; c < tempCells.length; c += 7) {
        weeks.push(tempCells.slice(c, c + 7));
      }

      list.push({
        name,
        year,
        monthIndex,
        weeks
      });
    }

    return list;
  }, [activities, startMonth]);

  // Pre-render Validation checks
  const validationError = useMemo(() => {
    for (let m = 0; m < monthsData.length; m++) {
      const month = monthsData[m];
      for (let w = 0; w < month.weeks.length; w++) {
        if (month.weeks[w].length !== 7) {
          return `Validation failed: Month ${month.name} Week ${w} does not have exactly 7 rows.`;
        }
      }
    }
    return null;
  }, [monthsData]);

  if (validationError) {
    throw new Error(validationError);
  }

  // Determine thresholds dynamically from actual user counts
  const maxCount = useMemo(() => {
    let max = 0;
    monthsData.forEach(month => {
      month.weeks.forEach(week => {
        week.forEach(cell => {
          if (!cell.isPlaceholder && cell.count > max) {
            max = cell.count;
          }
        });
      });
    });
    return max;
  }, [monthsData]);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (maxCount <= 0) return 0;
    if (count <= maxCount * 0.25) return 1;
    if (count <= maxCount * 0.50) return 2;
    if (count <= maxCount * 0.75) return 3;
    return 4;
  };

  const handleShowTooltip = (day: DayData, target: HTMLElement) => {
    const rect = target.getBoundingClientRect();
    if (cardRef.current) {
      const parentRect = cardRef.current.getBoundingClientRect();
      setTooltipPos({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 88
      });
      setHoveredDay(day);
    }
  };

  const handleHideTooltip = () => {
    setHoveredDay(null);
  };

  return (
    <div ref={cardRef} className="p-6 bg-card border border-border rounded-xl shadow-sm w-full relative overflow-visible heatmap-wrapper">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top-level Floating Tooltip */}
      {hoveredDay && hoveredDay.date && (
        <div 
          className="contrib-tooltip text-left"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-foreground">
            {hoveredDay.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-muted-foreground mt-0.5">
            {hoveredDay.count === 0 ? 'No activities logged.' : `${hoveredDay.count} ${hoveredDay.count === 1 ? 'action' : 'actions'} logged`}
          </div>
          {hoveredDay.count > 0 ? (
            <>
              <div className="text-primary font-bold mt-0.5">
                Saved {hoveredDay.carbonAvoided.toFixed(1)} kg CO₂e
              </div>
              {hoveredDay.sources.length > 0 && (
                <div className="text-muted-foreground/80 text-[10px] mt-1 pt-1 border-t border-border/40">
                  Sources: {hoveredDay.sources.join(', ')}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      <div className="flex flex-col space-y-4">
        {/* Title and Legend Row */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-foreground">Green Action History</h4>
            <p className="text-xs text-muted-foreground">Your daily carbon reductions over the past year</p>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>Less</span>
            <span className="cell cell-level-0"></span>
            <span className="cell cell-level-1"></span>
            <span className="cell cell-level-2"></span>
            <span className="cell cell-level-3"></span>
            <span className="cell cell-level-4"></span>
            <span>More</span>
          </div>
        </div>

        {/* Scrollable Container with Fade overlays on mobile */}
        <div className="relative w-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent pointer-events-none z-20 transition-opacity duration-300 md:hidden ${
              showLeftFade ? 'opacity-100' : 'opacity-0'
            }`} 
          />
          <div 
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none z-20 transition-opacity duration-300 md:hidden ${
              showRightFade ? 'opacity-100' : 'opacity-0'
            }`} 
          />

          <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="overflow-x-auto scrollbar-none pb-1 relative"
          >
            <div>
              <style>{`
                .heatmap-wrapper {
                  --level-0: #ebedf0;
                  --level-1: #9be9a8;
                  --level-2: #40c463;
                  --level-3: #30a14e;
                  --level-4: #216e39;
                  --cell-size: 10px;
                  --cell-gap: 3px;
                  --month-gap: 12px;
                }

                .dark.heatmap-wrapper, 
                [data-theme='dark'] .heatmap-wrapper {
                  --level-0: #161b22;
                  --level-1: #0e4429;
                  --level-2: #006d32;
                  --level-3: #26a641;
                  --level-4: #39d353;
                }

                @media (max-width: 1024px) {
                  .heatmap-wrapper {
                    --cell-size: 9px;
                    --cell-gap: 2px;
                    --month-gap: 8px;
                  }
                }

                @media (max-width: 640px) {
                  .heatmap-wrapper {
                    --cell-size: 8px;
                    --cell-gap: 2px;
                    --month-gap: 8px;
                  }
                }

                .heatmap-layout {
                  display: flex;
                  gap: var(--month-gap);
                  width: max-content;
                }

                .month-block {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }

                .month-grid {
                  display: flex;
                  gap: var(--cell-gap);
                }

                .week-column {
                  display: flex;
                  flex-direction: column;
                  gap: var(--cell-gap);
                }

                .cell {
                  width: var(--cell-size);
                  height: var(--cell-size);
                  border-radius: 2px;
                  transition: background-color 0.2s ease;
                }

                .cell:hover, .cell:focus {
                  transform: scale(1.2);
                  z-index: 20;
                  outline: none;
                  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
                }

                .cell-level-0 { background-color: var(--level-0); }
                .cell-level-1 { background-color: var(--level-1); }
                .cell-level-2 { background-color: var(--level-2); }
                .cell-level-3 { background-color: var(--level-3); }
                .cell-level-4 { background-color: var(--level-4); }

                .cell-placeholder {
                  width: var(--cell-size);
                  height: var(--cell-size);
                  visibility: hidden;
                  pointer-events: none;
                }

                .contrib-tooltip {
                  position: absolute;
                  z-index: 50;
                  background-color: var(--popover, #1e293b);
                  border: 1px solid var(--border, #334155);
                  color: var(--popover-foreground, #f8fafc);
                  font-size: 11px;
                  padding: 8px;
                  border-radius: 8px;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                  pointer-events: none;
                  min-width: 155px;
                  transform: translateX(-50%);
                  transition: opacity 0.15s ease-out;
                }
              `}</style>

              <div className="heatmap-layout relative">
                {/* Render Each Month Block dynamically starting from joining month */}
                {monthsData.map((month) => (
                  <div key={`${month.name}-${month.year}`} className="month-block">
                    {/* Month mini-grid */}
                    <div className="month-grid">
                      {month.weeks.map((week, wIdx) => (
                        <div key={wIdx} className="week-column">
                          {week.map((cell, cIdx) => (
                            cell.isPlaceholder ? (
                              <div key={`placeholder-${cIdx}`} className="cell-placeholder" />
                            ) : (
                              <div
                                key={cell.dateString}
                                role="gridcell"
                                tabIndex={0}
                                aria-label={`${cell.dateString}: ${cell.count} activities, Saved ${cell.carbonAvoided} kg CO₂e`}
                                className={`cell cell-level-${getLevel(cell.count)}`}
                                onMouseEnter={(e) => handleShowTooltip(cell, e.currentTarget)}
                                onMouseLeave={handleHideTooltip}
                                onFocus={(e) => handleShowTooltip(cell, e.currentTarget)}
                                onBlur={handleHideTooltip}
                              />
                            )
                          ))}
                        </div>
                      ))}
                    </div>
                    {/* Month Label Centered below its grid */}
                    <div className="text-center text-[10px] text-muted-foreground/85 font-semibold mt-2 select-none">
                      {month.name}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>

        {/* Empty state message when no activities exist */}
        {activities.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center font-semibold">
            Start logging actions to build your sustainability journey.
          </p>
        )}
      </div>
    </div>
  );
}
