export default function MealTypeCard({ data }) {
  const withData = data.filter(d => d.count > 0)

  if (withData.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sand-300 text-xs">Nog geen maaltijden geregistreerd</p>
      </div>
    )
  }

  const maxRate = Math.max(...withData.map(d => d.followRate), 0.01)

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct = Math.round(item.followRate * 100)
        const barWidth = maxRate > 0 ? (item.followRate / maxRate) * 100 : 0
        const color = item.followRate > 0.4 ? '#ef4444' : item.followRate > 0.2 ? '#f59e0b' : '#2d6a4f'

        return (
          <div key={item.type}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[#1a1a2e]">{item.label}</span>
              <span className="text-[10px] text-sand-300 font-medium">
                {item.count > 0 ? `${pct}% klachten · ${item.count}x` : 'Geen data'}
              </span>
            </div>
            <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${barWidth}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
