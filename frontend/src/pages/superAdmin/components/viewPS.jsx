export default function PdfViewer({ pdfUrl }) {
  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <div className="w-full h-full border rounded-lg overflow-hidden shadow">
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
