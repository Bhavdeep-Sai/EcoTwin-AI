export function EcoIllustration() {
  return (
    <div className="relative w-full h-full min-h-[250px] opacity-80 dark:opacity-40">
      <svg
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Sun */}
        <circle cx="340" cy="50" r="24" fill="#FEF08A" opacity="0.8" />
        
        {/* Wind Turbine Line */}
        <line x1="280" y1="80" x2="280" y2="160" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
        <path d="M280 80 L300 50 M280 80 L250 70 M280 80 L290 110" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />

        {/* Back Hills */}
        <path
          d="M0 160 Q 100 120 200 160 T 400 140 L 400 200 L 0 200 Z"
          fill="#DCFCE7"
          opacity="0.6"
        />
        
        {/* Front Hills */}
        <path
          d="M-20 200 Q 150 140 280 180 T 420 160 L 420 200 L -20 200 Z"
          fill="#86EFAC"
          opacity="0.4"
        />
        
        {/* Trees */}
        <path d="M60 170 L60 150" stroke="#15803D" strokeWidth="3" />
        <circle cx="60" cy="140" r="12" fill="#22C55E" />
        
        <path d="M120 160 L120 135" stroke="#15803D" strokeWidth="3" />
        <circle cx="120" cy="120" r="16" fill="#16A34A" />
        
        <path d="M340 170 L340 145" stroke="#15803D" strokeWidth="3" />
        <circle cx="340" cy="135" r="14" fill="#22C55E" />
        <circle cx="330" cy="145" r="10" fill="#16A34A" />
        <circle cx="350" cy="145" r="10" fill="#16A34A" />

        {/* Clouds */}
        <path d="M50 80 Q 60 70 70 80 Q 85 75 90 90 L 50 90 Z" fill="#F1F5F9" opacity="0.8" />
        <path d="M180 60 Q 190 45 205 60 Q 220 55 225 70 L 175 70 Z" fill="#F1F5F9" opacity="0.8" />
      </svg>
    </div>
  )
}
