export default function SummaryStats({ summary }) {
  const stats = [
    { value: summary.totalSymptoms, label: 'Klachten' },
    { value: summary.avgSeverity > 0 ? summary.avgSeverity.toFixed(1) : '-', label: 'Gem. ernst' },
    { value: summary.symptomFreeDays, label: 'Vrije dagen' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map(({ value, label }) => (
        <div key={label} className="bg-white rounded-2xl p-3.5 shadow-sm border border-sand-200/60 text-center">
          <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
          <p className="text-[10px] text-sand-300 font-medium mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
