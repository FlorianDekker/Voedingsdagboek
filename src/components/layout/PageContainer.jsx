export default function PageContainer({ title, children }) {
  return (
    <div className="flex-1 px-5 pt-6 pb-4 animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-5">{title}</h1>
      {children}
    </div>
  )
}
