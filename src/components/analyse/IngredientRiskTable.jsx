const RISK_STYLES = {
  hoog: { bg: 'bg-red-50/60', text: 'text-red-500', label: 'Hoog risico', barColor: '#ef4444' },
  midden: { bg: 'bg-amber-50/60', text: 'text-amber-500', label: 'Mogelijk', barColor: '#f59e0b' },
  laag: { bg: 'bg-green-subtle', text: 'text-green-accent', label: 'Veilig', barColor: '#2d6a4f' },
}

const CONFIDENCE_DOTS = {
  low: [true, false, false],
  medium: [true, true, false],
  high: [true, true, true],
}

export default function IngredientRiskTable({ ingredients, baselineRate }) {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sand-300 text-xs">
          Registreer minstens 2x hetzelfde ingredient + klachten
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {ingredients.map((item) => {
        const style = RISK_STYLES[item.riskLevel]
        const pct = Math.round(item.followRate * 100)
        const dots = CONFIDENCE_DOTS[item.confidence]
        const isLowConf = item.confidence === 'low'
        const liftUp = item.lift > 1.1

        return (
          <div
            key={item.name}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${style.bg} overflow-hidden relative ${isLowConf ? 'opacity-60' : ''}`}
          >
            {/* Progress bar background */}
            <div
              className="absolute inset-y-0 left-0 opacity-10"
              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: style.barColor }}
            />

            <div className="flex-1 min-w-0 relative">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#1a1a2e] capitalize truncate">{item.name}</p>
                {/* Lift indicator */}
                <span className={`text-[10px] font-bold ${liftUp ? 'text-red-400' : 'text-green-accent'}`}>
                  {liftUp ? '↑' : '↓'}{item.lift.toFixed(1)}x
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-[#1a1a2e]/50 font-medium">
                  {item.timesEaten}x gegeten &middot; {pct}% klachten
                </p>
                {/* Confidence dots */}
                <div className="flex gap-0.5">
                  {dots.map((filled, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${filled ? 'bg-[#1a1a2e]/30' : 'bg-[#1a1a2e]/10'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text} flex-shrink-0 relative`}>
              {style.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
