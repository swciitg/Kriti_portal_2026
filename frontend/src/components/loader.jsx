export default function Loader({text}) {
    return (
        <div className="bg-gray-50 p-8 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">{text}</p>
            </div>
        </div>
    )
}