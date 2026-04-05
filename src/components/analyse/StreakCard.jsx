export default function StreakCard({ streaks }) {
  return (
    <div className="flex gap-3">
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-sand-200/60 text-center">
        <p className="text-3xl font-bold text-green-accent">{streaks.current}</p>
        <p className="text-[10px] text-sand-300 font-medium mt-1">Huidige reeks</p>
        <p className="text-[9px] text-sand-300/70">dagen zonder klachten</p>
      </div>
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-sand-200/60 text-center">
        <p className="text-3xl font-bold text-[#1a1a2e]">{streaks.longest}</p>
        <p className="text-[10px] text-sand-300 font-medium mt-1">Langste reeks</p>
        <p className="text-[9px] text-sand-300/70">dagen zonder klachten</p>
      </div>
    </div>
  )
}
