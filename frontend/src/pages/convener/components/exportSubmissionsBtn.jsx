import { useEffect, useState } from "react";
import { BACKEND_URL } from  "../../../constants.js"

export default function DownloadSubmissionsButton({ psId , psName , isMidEval }) {
  const [download, setDownload] = useState(false);
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState(false);

  useEffect(() => {
    if (!download) return;

    const fetchExcel = async () => {
      try {
        setError("");
        setLoading(true);
        const res = await fetch(
          `${BACKEND_URL}/v1/convener/export-submissions/${psId}?midEval=${isMidEval}`,
          {
            method: "GET",
            credentials: "include"
          }
        );

        if (!res.ok) {
            setError(data.message || "Failed to export teams");
            return;
        }
  
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
  
        const a = document.createElement("a");
        a.href = url;
        a.download = psName + `${isMidEval ? "_mid_" : "_final_"}` +" submissions.xlsx";
        document.body.appendChild(a);
        a.click();
  
        a.remove();
        window.URL.revokeObjectURL(url);
        setDownload(false);
      } catch (error) {
        setError("Failed to export the Sheet! Try again later");
      } finally {
        setLoading(false);
      }
    };

    fetchExcel();
  }, [download]);

  return (
    <button
      onClick={() => setDownload(true)}
      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded"
    >
      {
        loading ? 
        "Downloading Sheet..." : 
        error.length > 0 ? error : "Download Submissions Sheet"
      }
    </button>
  );
}
