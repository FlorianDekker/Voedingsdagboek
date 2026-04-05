export default function PageContainer({ title, children }) {
  return (
    <div className="flex-1 px-5 pt-16 pb-4 animate-slide-up">
      <h1 className="text-[32px] font-black text-[#1a1a2e] tracking-tight leading-none mb-7">{title}</h1>
      {children}
    </div>
  )
}
