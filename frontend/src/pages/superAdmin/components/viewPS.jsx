export default function PdfViewer({ pdfUrl, setPdfUrl }) {
  return (
    <div className="fixed flex justify-center items-center w-[100vw] h-[100vh] top-0 left-0 bg-black/50 z-100">
      <div className="relative flex w-[70vw] h-[80vh] bg-gray-100 p-4 px-8">
        <button
        onClick={() => {
            setPdfUrl(null)
        }}
        className="absolute top-2 right-2 text-black font-bold text-xl cursor-pointer"
        >
          ✕
        </button>
        <div className="w-full h-full border rounded-lg overflow-hidden shadow">
          {
            // pdfUrl || pdfUrl.trim().length === 0 ? 
            // <></> :
            <iframe
              src={pdfUrl}
              title="PDF Viewer"
              className="w-full h-full"
            />
          } 
        </div>
      </div>
    </div>
  );
}
