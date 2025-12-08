import ProblemCard from "./psCard.jsx"

export default function GroupSection({ title, items }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-700 mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 cursor-pointer">
        {items.map(ps => (
          <ProblemCard key={ps._id} ps={ps} />
        ))}
      </div>
    </div>
  )
}