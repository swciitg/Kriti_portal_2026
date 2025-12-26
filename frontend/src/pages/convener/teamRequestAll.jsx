import React, { useState } from "react";
import { userContext } from "../../context/userContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../constants";
export default function TeamRequestAll() {
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [editRequest, setEditRequest] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BACKEND_URL}/v1/convener/get-requests/`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (res.status !== 200) {
          setError(data.message || "Failed to fetch requests");
        } else {
          const editTeamRequests = data.data.filter(
            (req) => req.requestType === "EDIT_TEAM" && req.status === "pending"
          );
          setEditRequest(editTeamRequests);
          console.log(editTeamRequests);
        }
        setLoading(false);
      } catch (e) {
        setError(e.message);
      }
    };
    fetchRequests();
  }, []);

  const handleRequest = async (id, status) => {
    try {
      setLoading(true);
      setSuccess("");
      const res = await fetch(
        `${BACKEND_URL}/v1/convener/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if(res.status !== 200) {
        setError(data.message || "Failed to update status");
      } else {
        setSuccess(
          status === "approved"
            ? "Request approved successfully"
            : "Request rejected successfully"
        );
      }
      setEditRequest((prev) => prev.filter((req) => req._id !== id));
      setLoading(false);
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white shadow rounded-xl p-8 flex flex-col h-[calc(100vh-5rem)]">
        <div className="overflow-y-auto space-y-6 pr-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Edit Team Requests
          </h1>
          {success && (
            <p className="text-green-600 text-center font-medium">{success}</p>
          )}
          {error && <p className="text-red-600 text-center">{error}</p>}
          {loading && <p className="text-center text-gray-600">Loading...</p>}
          {!loading && editRequest.length === 0 && (
            <p className="text-center text-gray-600">
              No pending edit requests
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {editRequest.map((req) => (
              <div
                key={req._id}
                className="border rounded-xl p-5 shadow-sm bg-gray-50 hover:shadow transition flex flex-col justify-between"
              >
                {/* TOP */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Hostel ID: {req.hostelId}
                  </h3>
                  <p className="mt-1 text-gray-600">
                    <b>PS Name:</b> {req.psName}
                  </p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleRequest(req._id, "approved")}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleRequest(req._id, "rejected")}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
