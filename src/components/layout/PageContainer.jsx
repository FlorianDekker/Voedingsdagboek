export default function PageContainer({ title, children }) {
  return (
    <div className="flex-1 px-4 pt-4">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">{title}</h1>
      {children}
    </div>
  )
}
