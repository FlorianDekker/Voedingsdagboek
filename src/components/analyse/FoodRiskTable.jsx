const RISK_STYLES = {
  hoog: { bg: 'bg-red-50', text: 'text-red-600', label: 'Hoog risico', dot: 'bg-red-400' },
  midden: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Mogelijk', dot: 'bg-yellow-400' },
  laag: { bg: 'bg-green-50', text: 'text-green-600', label: 'Veilig', dot: 'bg-green-400' },
}

export default function FoodRiskTable({ correlations }) {
  if (correlations.length === 0) {
    return (
      <p className="text-gray-400 text-xs text-center py-6">
        Registreer minstens 3x hetzelfde eten + klachten om een analyse te zien
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {correlations.map((item) => {
        const style = RISK_STYLES[item.riskLevel]
        return (
          <div
            key={item.food}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${style.bg}`}
          >
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 capitalize truncate">{item.food}</p>
              <p className="text-xs text-gray-500">
                {item.timesEaten}x gegeten &middot; {item.timesFollowed}x klachten
                &middot; {Math.round(item.followRate * 100)}%
              </p>
            </div>
            <span className={`text-xs font-medium ${style.text} flex-shrink-0`}>
              {style.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
