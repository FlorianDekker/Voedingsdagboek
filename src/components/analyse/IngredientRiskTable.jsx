import { SEVERITY_COLORS } from '../../constants/mealTypes'

const RISK_STYLES = {
  hoog: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-500', label: 'Hoog risico', barColor: '#ef4444', dot: 'bg-red-400' },
  midden: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-500', label: 'Mogelijk risico', barColor: '#f59e0b', dot: 'bg-amber-400' },
  laag: { bg: 'bg-primary-subtle', border: 'border-primary-light', text: 'text-primary', label: 'Veilig', barColor: '#65B741', dot: 'bg-primary' },
}

const CONFIDENCE_DOTS = {
  low: [true, false, false],
  medium: [true, true, false],
  high: [true, true, true],
}

function getSeverityColor(avg) {
  if (avg <= 1.5) return SEVERITY_COLORS[1]
  if (avg <= 2.5) return SEVERITY_COLORS[2]
  if (avg <= 3.5) return SEVERITY_COLORS[3]
  if (avg <= 4.5) return SEVERITY_COLORS[4]
  return SEVERITY_COLORS[5]
}

export default function IngredientRiskTable({ ingredients, baselineRate, onSelectIngredient, selectedIngredient }) {
  if (!ingredients || ingredients.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-muted-light" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <p className="text-[#1a1a1a] font-semibold text-sm mb-1">Nog niet genoeg data</p>
        <p className="text-muted text-xs">Registreer minstens 2x hetzelfde ingredient + klachten</p>
      </div>
    )
  }

  // Split into top suspects (first 3) and rest
  const topItems = ingredients.slice(0, 3)
  const restItems = ingredients.slice(3)

  return (
    <div>
      {/* Top suspects — larger cards */}
      <div className="space-y-3 mb-3">
        {topItems.map((item, idx) => (
          <TopIngredientCard
            key={item.name}
            item={item}
            rank={idx + 1}
            isSelected={selectedIngredient === item.name}
            onTap={() => onSelectIngredient?.(selectedIngredient === item.name ? null : item.name)}
          />
        ))}
      </div>

      {/* Remaining — compact list */}
      {restItems.length > 0 && (
        <div className="space-y-1.5">
          {restItems.map((item) => (
            <CompactIngredientRow
              key={item.name}
              item={item}
              isSelected={selectedIngredient === item.name}
              onTap={() => onSelectIngredient?.(selectedIngredient === item.name ? null : item.name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TopIngredientCard({ item, rank, isSelected, onTap }) {
  const style = RISK_STYLES[item.riskLevel]
  const pct = Math.round(item.followRate * 100)
  const dots = CONFIDENCE_DOTS[item.confidence]
  const isLowConf = item.confidence === 'low'
  const liftUp = item.lift > 1.1
  const sevColor = item.avgSeverity > 0 ? getSeverityColor(item.avgSeverity) : '#d0d0d0'

  return (
    <div
      onClick={onTap}
      className={`rounded-2xl p-4 ${style.bg} border ${style.border} relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${isLowConf ? 'opacity-60' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      {/* Progress bar background */}
      <div
        className="absolute inset-y-0 left-0 opacity-[0.07]"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: style.barColor }}
      />

      <div className="relative">
        {/* Top row: name + risk badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-[#1a1a1a] capitalize">{item.name}</span>
            <span className={`text-xs font-bold ${liftUp ? 'text-red-400' : 'text-primary'}`}>
              {liftUp ? '↑' : '↓'}{item.lift.toFixed(1)}x
            </span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${style.text} ${style.bg}`}>
            {style.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          {/* Follow rate */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: style.barColor }}>
              {pct}%
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#1a1a1a]/70">klachten</p>
              <p className="text-[10px] text-[#1a1a1a]/40">{item.timesEaten}x gegeten</p>
            </div>
          </div>

          {/* Avg severity */}
          {item.avgSeverity > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: sevColor }}>
                {item.avgSeverity.toFixed(1)}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#1a1a1a]/70">gem. ernst</p>
                <p className="text-[10px] text-[#1a1a1a]/40">van 5</p>
              </div>
            </div>
          )}

          {/* Confidence */}
          <div className="ml-auto flex items-center gap-1">
            <div className="flex gap-0.5">
              {dots.map((filled, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-[#1a1a1a]/30' : 'bg-[#1a1a1a]/10'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompactIngredientRow({ item, isSelected, onTap }) {
  const style = RISK_STYLES[item.riskLevel]
  const pct = Math.round(item.followRate * 100)
  const isLowConf = item.confidence === 'low'
  const liftUp = item.lift > 1.1

  return (
    <div
      onClick={onTap}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${style.bg} overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all ${isLowConf ? 'opacity-60' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div
        className="absolute inset-y-0 left-0 opacity-10"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: style.barColor }}
      />

      <div className="flex-1 min-w-0 relative">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#1a1a1a] capitalize truncate">{item.name}</p>
          <span className={`text-[10px] font-bold ${liftUp ? 'text-red-400' : 'text-primary'}`}>
            {liftUp ? '↑' : '↓'}{item.lift.toFixed(1)}x
          </span>
        </div>
        <p className="text-[10px] text-[#1a1a1a]/50 font-medium mt-0.5">
          {item.timesEaten}x gegeten · {pct}% klachten
          {item.avgSeverity > 0 && ` · gem. ${item.avgSeverity.toFixed(1)}/5`}
        </p>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text} flex-shrink-0 relative`}>
        {style.label}
      </span>
    </div>
  )
}
