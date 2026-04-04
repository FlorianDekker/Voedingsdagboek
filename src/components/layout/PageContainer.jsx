export default function PageContainer({ title, children }) {
  return (
    <div className="flex-1 px-5 pt-14 pb-4 animate-slide-up">
      <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight mb-6">{title}</h1>
      {children}
    </div>
  )
}
