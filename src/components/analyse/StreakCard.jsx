export default function StreakCard({ streaks }) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-3xl font-bold text-primary">{streaks.current}</p>
        <p className="text-[10px] text-muted font-medium mt-1">Huidige reeks</p>
        <p className="text-[9px] text-muted/70">dagen zonder klachten</p>
      </div>
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
        <p className="text-3xl font-bold text-[#1a1a1a]">{streaks.longest}</p>
        <p className="text-[10px] text-muted font-medium mt-1">Langste reeks</p>
        <p className="text-[9px] text-muted/70">dagen zonder klachten</p>
      </div>
    </div>
  )
}
