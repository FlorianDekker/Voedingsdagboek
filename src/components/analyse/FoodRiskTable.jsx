const RISK_STYLES = {
  hoog: { bg: 'bg-red-50/80', text: 'text-red-500', label: 'Hoog risico', barColor: '#ef4444' },
  midden: { bg: 'bg-amber-50/80', text: 'text-amber-500', label: 'Mogelijk', barColor: '#f59e0b' },
  laag: { bg: 'bg-emerald-50/80', text: 'text-emerald-500', label: 'Veilig', barColor: '#10b981' },
}

export default function FoodRiskTable({ correlations }) {
  if (correlations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-300 text-xs">
          Registreer minstens 3x hetzelfde eten + klachten
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {correlations.map((item) => {
        const style = RISK_STYLES[item.riskLevel]
        const pct = Math.round(item.followRate * 100)
        return (
          <div
            key={item.food}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${style.bg} overflow-hidden relative`}
          >
            {/* Progress bar background */}
            <div
              className="absolute inset-y-0 left-0 opacity-10"
              style={{ width: `${pct}%`, backgroundColor: style.barColor }}
            />

            <div className="flex-1 min-w-0 relative">
              <p className="text-sm font-semibold text-gray-800 capitalize truncate">{item.food}</p>
              <p className="text-[10px] text-gray-400 font-medium">
                {item.timesEaten}x gegeten &middot; {pct}% klachten
              </p>
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
