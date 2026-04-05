const TYPE_STYLES = {
  warning: { border: 'border-l-red-400', bg: 'bg-red-50/40' },
  positive: { border: 'border-l-primary', bg: 'bg-primary-subtle/40' },
  info: { border: 'border-l-amber-400', bg: 'bg-amber-50/40' },
  trend: { border: 'border-l-blue-400', bg: 'bg-blue-50/40' },
}

export default function InsightCards({ insights }) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => {
        const style = TYPE_STYLES[insight.type] || TYPE_STYLES.info
        return (
          <div
            key={i}
            className={`${style.bg} border-l-[3px] ${style.border} rounded-xl px-4 py-3 animate-slide-up`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="text-[13px] text-[#1a1a1a] leading-snug">{insight.text}</p>
          </div>
        )
      })}
    </div>
  )
}
