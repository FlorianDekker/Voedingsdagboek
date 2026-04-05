export default function PageContainer({ title, children }) {
  return (
    <div className="flex-1 px-5 pt-14 pb-24 animate-slide-up">
      <h1 className="text-[26px] font-bold text-[#1a1a1a] tracking-tight leading-tight mb-6">{title}</h1>
      {children}
    </div>
  )
}
