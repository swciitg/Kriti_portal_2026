// src/pages/convener/PSDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../constants.js";
import { userContext } from "../../context/userContext.jsx";
import { convertPayloadDatesToUTC, getLocalTimezone, convertUTCToLocalDatetimeInput } from "../../utils/timezoneUtils.js";

const emptyDeliverable = { name: "", type: "url" };
const emptyPointsItem = { field: "", weightage: 0 };

export default function PSDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [ps, setPs] = useState({
    name: "",
    prep: "high",
    startDate: "",
    submissionDeadline: "",
    registrationDeadline: "",
    midEvalExist: false,
    midEvalSubmissionDeadline: "",
    judge: "",
    companyPOC: "",
    pdf: "",
    pptSchedule: "",
    submissionDeliverables: [],
    midEvalSubmissionDeliverables: [],
    submissionPointsDistribution: [],
    pptPointsDistribution: [],
    midEvalPointsDistribution: [],
    points: "",
    overallPointsDistribution: ["", "", ""],
    teamStrength: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // NEW: Edit mode state

  const [isOverallPointsValid, setIsOverallPointsValid] = useState(false);
  const [pointsValidation, setPointsValidation] = useState({
    submissionPointsDistribution: false,
    pptPointsDistribution: false,
    midEvalPointsDistribution: false,
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    const role = stored?.role || user?.role;
    if (!role || role !== "Convener") {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchPS() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${BACKEND_URL}/v1/ps/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        const formatDate = (dateStr) => {
          if (!dateStr) return "";
          return convertUTCToLocalDatetimeInput(dateStr);
        };

        setPs({
          name: data.ps.name || "",
          prep: data.ps.prep || "high",
          startDate: formatDate(data.ps.startDate),
          submissionDeadline: formatDate(data.ps.submissionDeadline),
          registrationDeadline: formatDate(data.ps.registrationDeadline),
          midEvalExist: data.ps.midEvalExist || false,
          midEvalSubmissionDeadline: formatDate(data.ps.midEvalSubmissionDeadline),
          judge: data.ps.judge || "",
          companyPOC: data.ps.companyPOC || "",
          pdf: data.ps.pdf || "",
          pptSchedule: data.ps.pptSchedule || "",
          submissionDeliverables: data.ps.submissionDeliverables || [],
          midEvalSubmissionDeliverables: data.ps.midEvalSubmissionDeliverables || [],
          submissionPointsDistribution: data.ps.submissionPointsDistribution || [],
          pptPointsDistribution: data.ps.pptPointsDistribution || [],
          midEvalPointsDistribution: data.ps.midEvalPointsDistribution || [],
          points: data.ps.points || "",
          overallPointsDistribution: data.ps.overallPointsDistribution || ["", "", ""],
          teamStrength: data.ps.teamStrength || "",
        });

        const calculateTotal = (arr) =>
          arr.reduce((sum, item) => {
            const weightage = item.weightage === "" ? 0 : Number(item.weightage);
            return sum + weightage;
          }, 0);

        const subTotal = calculateTotal(data.ps.submissionPointsDistribution || []);
        const pptTotal = calculateTotal(data.ps.pptPointsDistribution || []);
        const midTotal = calculateTotal(data.ps.midEvalPointsDistribution || []);

        setPointsValidation({
          submissionPointsDistribution: subTotal === 100,
          pptPointsDistribution: pptTotal === 100,
          midEvalPointsDistribution: midTotal === 100,
        });

        const arr = data.ps.overallPointsDistribution || ["", "", ""];
        const sub = arr[0] === "" ? 0 : Number(arr[0]);
        const ppt = arr[1] === "" ? 0 : Number(arr[1]);
        const mid = data.ps.midEvalExist ? (arr[2] === "" ? 0 : Number(arr[2])) : 0;
        const total = sub + ppt + mid;
        const targetPoints = data.ps.points === "" ? 0 : Number(data.ps.points);
        setIsOverallPointsValid(total === targetPoints && targetPoints > 0);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPS();
  }, [id]);

  // NEW: Toggle edit mode function
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError(""); // Clear any errors when toggling
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPs((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const calculateTotal = (arr) =>
    arr.reduce((sum, item) => {
      const weightage = item.weightage === "" ? 0 : Number(item.weightage);
      return sum + weightage;
    }, 0);

  const VALIDATED_FIELDS = [
    "submissionPointsDistribution",
    "pptPointsDistribution",
    "midEvalPointsDistribution",
  ];

  const handleArrayChange = (field, index, key, value) => {
    setPs((prev) => {
      const arr = [...prev[field]];
      arr[index] = { ...arr[index], [key]: value };
      if (VALIDATED_FIELDS.includes(field)) {
        const total = calculateTotal(arr);
        setPointsValidation((prevVal) => ({
          ...prevVal,
          [field]: total === 100,
        }));
      }
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field, defaultObj) => {
    setPs((prev) => {
      const updatedArr = [...prev[field], defaultObj];
      if (VALIDATED_FIELDS.includes(field)) {
        const total = calculateTotal(updatedArr);
        setPointsValidation((prevVal) => ({
          ...prevVal,
          [field]: total === 100,
        }));
      }
      return { ...prev, [field]: updatedArr };
    });
  };

  const removeArrayItem = (field, index) => {
    setPs((prev) => {
      const arr = [...prev[field]];
      arr.splice(index, 1);
      if (VALIDATED_FIELDS.includes(field)) {
        const total = calculateTotal(arr);
        setPointsValidation((prevVal) => ({
          ...prevVal,
          [field]: total === 100,
        }));
      }
      return { ...prev, [field]: arr };
    });
  };

  const handleOverallPointsChange = (index, value) => {
    setPs((prev) => {
      const arr = [...(prev.overallPointsDistribution || ["", "", ""])];
      arr[index] = value;

      const sub = arr[0] === "" ? 0 : Number(arr[0]);
      const ppt = arr[1] === "" ? 0 : Number(arr[1]);
      const mid = prev.midEvalExist ? (arr[2] === "" ? 0 : Number(arr[2])) : 0;
      const total = sub + ppt + mid;
      const targetPoints = prev.points === "" ? 0 : Number(prev.points);

      setIsOverallPointsValid(total === targetPoints && targetPoints > 0);

      return { ...prev, overallPointsDistribution: arr };
    });
  };

  const validateBeforeSubmit = () => {
    if (!ps.name?.trim()) return "Name is required.";
    if (!ps.prep) return "Prep level is required.";
    if (!ps.startDate) return "Start date is required.";
    if (!ps.submissionDeadline) return "Submission deadline is required.";
    if (!ps.registrationDeadline) return "Registration deadline is required.";
    if (!ps.pdf?.trim()) return "PDF link is required.";
    if (ps.points === "" || ps.points === null || Number(ps.points) === 0)
      return "Points are required and must be greater than 0.";
    if (ps.teamStrength === "" || Number(ps.teamStrength) < 1)
      return "Team strength is required and must be at least 1.";

    const urlRegex = /^https?:\/\//;
    if (!urlRegex.test(ps.pdf.trim())) return "PDF link must be a valid URL.";
    if (ps.pptSchedule && !urlRegex.test(ps.pptSchedule.trim()))
      return "PPT schedule must be a valid URL.";

    if (ps.midEvalExist && !ps.midEvalSubmissionDeadline)
      return "Mid evaluation submission date is required when mid evaluation exists.";

    if (!isOverallPointsValid)
      return "Overall points distribution must match total points.";

    const subTotal = calculateTotal(ps.submissionPointsDistribution);
    if (ps.submissionPointsDistribution.length && subTotal !== 100)
      return "Submission points distribution must total 100%.";

    const pptTotal = calculateTotal(ps.pptPointsDistribution);
    if (ps.pptPointsDistribution.length && pptTotal !== 100)
      return "PPT points distribution must total 100%.";

    if (ps.midEvalExist) {
      const midTotal = calculateTotal(ps.midEvalPointsDistribution);
      if (ps.midEvalPointsDistribution.length && midTotal !== 100)
        return "Mid term points distribution must total 100%.";
    }

    return "";
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");
    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const datetimeFields = [
      'startDate',
      'submissionDeadline',
      'registrationDeadline',
      'midEvalSubmissionDeadline'
    ];

    const basePayload = {
      ...ps,
      points: Number(ps.points),
      teamStrength: Number(ps.teamStrength),
      overallPointsDistribution: ps.overallPointsDistribution.map(v => Number(v || 0)),
      judge: ps.judge?.trim() || null,
      companyPOC: ps.companyPOC?.trim() || null,
      pptSchedule: ps.pptSchedule?.trim() || undefined,
    };

    const payload = convertPayloadDatesToUTC(basePayload, datetimeFields);

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      const res = await fetch(`${BACKEND_URL}/v1/convener/update-ps/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to update PS.");

      setSuccess("Problem statement updated successfully!");
      setIsEditing(false); // Exit edit mode on success
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate("/convener/ps"), 2000);
    } catch (e) {
      setError(e.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this PS? This action cannot be undone.")) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND_URL}/v1/convener/delete-ps/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      alert("PS deleted successfully!");
      navigate("/convener/ps");
    } catch (e) {
      setError(e.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setDeleting(false);
    }
  };

  const subTotal = calculateTotal(ps.submissionPointsDistribution);
  const pptTotal = calculateTotal(ps.pptPointsDistribution);
  const midTotal = calculateTotal(ps.midEvalPointsDistribution);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading problem statement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <button
          onClick={() => navigate("/convener/ps")}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to PS
        </button>
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header with Edit Button */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Update Problem Statement</h1>
                <p className="text-slate-200 mt-1">Modify problem statement details and settings</p>
              </div>
              <button
                onClick={toggleEditMode}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 ${
                  isEditing
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-white hover:bg-gray-100 text-slate-800"
                }`}
              >
                {isEditing ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Editing
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Problem Statement Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="name"
                    value={ps.name}
                    onChange={handleChange}
                    placeholder="e.g. Product Development Challenge"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preparation Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="prep"
                    value={ps.prep}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    {["high", "mid", "low", "no"].map((p) => (
                      <option key={p} value={p}>
                        {p.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Team Strength <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="teamStrength"
                    value={ps.teamStrength}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    placeholder="e.g. 4"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="startDate"
                    value={ps.startDate}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Problem Statement PDF Link <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  name="pdf"
                  value={ps.pdf}
                  onChange={handleChange}
                  placeholder="https://example.com/ps-document.pdf"
                  disabled={!isEditing}
                />
              </div>

              <label className="inline-flex items-center gap-3 cursor-pointer bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition">
                <input
                  type="checkbox"
                  name="midEvalExist"
                  checked={ps.midEvalExist}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isEditing}
                />
                <span className="text-sm font-semibold text-gray-700">Enable Mid-Term Evaluation</span>
              </label>
            </section>

            {/* Deadlines */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Deadlines</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Team Registration Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="registrationDeadline"
                    value={ps.registrationDeadline}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Final Submission Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="submissionDeadline"
                    value={ps.submissionDeadline}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                {ps.midEvalExist && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Mid-Term Submission Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      name="midEvalSubmissionDeadline"
                      value={ps.midEvalSubmissionDeadline}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Overall Points Distribution */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Overall Points Distribution</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Total Points <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  name="points"
                  value={ps.points}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  placeholder="e.g. 300"
                  disabled={!isEditing}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Distribute the total points across submission components. Sum must equal{" "}
                  <span className="font-bold text-gray-800">{ps.points || 0}</span> points.
                  <br />
                  <span className="text-xs">Current total: </span>
                  <span
                    className={`text-sm font-bold ${
                      isOverallPointsValid
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(ps.overallPointsDistribution[0] === "" ? 0 : Number(ps.overallPointsDistribution[0])) +
                      (ps.overallPointsDistribution[1] === "" ? 0 : Number(ps.overallPointsDistribution[1])) +
                      (ps.midEvalExist ? (ps.overallPointsDistribution[2] === "" ? 0 : Number(ps.overallPointsDistribution[2])) : 0)}
                  </span>
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Final Submission Score <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={ps.overallPointsDistribution[0]}
                      onChange={(e) => handleOverallPointsChange(0, e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Presentation Score <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={ps.overallPointsDistribution[1]}
                      onChange={(e) => handleOverallPointsChange(1, e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                      disabled={!isEditing}
                    />
                  </div>
                  {ps.midEvalExist && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Mid-Term Evaluation Score <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={ps.overallPointsDistribution[2]}
                        onChange={(e) => handleOverallPointsChange(2, e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="0"
                        disabled={!isEditing}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Category wise Points Distribution */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Category-wise Points Distribution</h2>
              </div>

              {/* Submission Points */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Submission Evaluation Criteria</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Total must be 100%. Current:{" "}
                      <span className={`font-bold ${pointsValidation.submissionPointsDistribution ? "text-green-600" : "text-red-600"}`}>
                        {subTotal}%
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayItem("submissionPointsDistribution", emptyPointsItem)}
                    disabled={!isEditing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    + Add Criterion
                  </button>
                </div>
                {ps.submissionPointsDistribution.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Criterion name"
                      value={item.field}
                      onChange={(e) =>
                        handleArrayChange("submissionPointsDistribution", idx, "field", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="%"
                      value={item.weightage}
                      onChange={(e) =>
                        handleArrayChange("submissionPointsDistribution", idx, "weightage", e.target.value)
                      }
                      onWheel={(e) => e.target.blur()}
                      disabled={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("submissionPointsDistribution", idx)}
                      disabled={!isEditing}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* PPT Points */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Presentation Evaluation Criteria</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Total must be 100%. Current:{" "}
                      <span className={`font-bold ${pointsValidation.pptPointsDistribution ? "text-green-600" : "text-red-600"}`}>
                        {pptTotal}%
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayItem("pptPointsDistribution", emptyPointsItem)}
                    disabled={!isEditing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    + Add Criterion
                  </button>
                </div>
                {ps.pptPointsDistribution.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Criterion name"
                      value={item.field}
                      onChange={(e) =>
                        handleArrayChange("pptPointsDistribution", idx, "field", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="%"
                      value={item.weightage}
                      onChange={(e) =>
                        handleArrayChange("pptPointsDistribution", idx, "weightage", e.target.value)
                      }
                      onWheel={(e) => e.target.blur()}
                      disabled={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("pptPointsDistribution", idx)}
                      disabled={!isEditing}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Mid Eval Points */}
              {ps.midEvalExist && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Mid-Term Evaluation Criteria</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Total must be 100%. Current:{" "}
                        <span className={`font-bold ${pointsValidation.midEvalPointsDistribution ? "text-green-600" : "text-red-600"}`}>
                          {midTotal}%
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addArrayItem("midEvalPointsDistribution", emptyPointsItem)}
                      disabled={!isEditing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      + Add Criterion
                    </button>
                  </div>
                  {ps.midEvalPointsDistribution.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Criterion name"
                        value={item.field}
                        onChange={(e) =>
                          handleArrayChange("midEvalPointsDistribution", idx, "field", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="%"
                        value={item.weightage}
                        onChange={(e) =>
                          handleArrayChange("midEvalPointsDistribution", idx, "weightage", e.target.value)
                        }
                        onWheel={(e) => e.target.blur()}
                        disabled={!isEditing}
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("midEvalPointsDistribution", idx)}
                        disabled={!isEditing}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Submission Deliverables */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Submission Deliverables</h2>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Final Submission Files</h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem("submissionDeliverables", emptyDeliverable)}
                    disabled={!isEditing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    + Add Deliverable
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-3">Files or links required for final submission.</p>
                {ps.submissionDeliverables.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Deliverable name"
                      value={item.name}
                      onChange={(e) =>
                        handleArrayChange("submissionDeliverables", idx, "name", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={item.type}
                      onChange={(e) =>
                        handleArrayChange("submissionDeliverables", idx, "type", e.target.value)
                      }
                      disabled={!isEditing}
                    >
                      {["url", "pdf", "zip", "ipynb", "doc", "pptx", "png", "jpg"].map((t) => (
                        <option key={t} value={t}>
                          {t.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeArrayItem("submissionDeliverables", idx)}
                      disabled={!isEditing}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {ps.midEvalExist && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Mid-Term Submission Files</h3>
                    <button
                      type="button"
                      onClick={() => addArrayItem("midEvalSubmissionDeliverables", emptyDeliverable)}
                      disabled={!isEditing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      + Add Deliverable
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Files or links required for mid-term evaluation.</p>
                  {ps.midEvalSubmissionDeliverables.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Deliverable name"
                        value={item.name}
                        onChange={(e) =>
                          handleArrayChange("midEvalSubmissionDeliverables", idx, "name", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={item.type}
                        onChange={(e) =>
                          handleArrayChange("midEvalSubmissionDeliverables", idx, "type", e.target.value)
                        }
                        disabled={!isEditing}
                      >
                        {["url", "pdf", "zip", "ipynb", "doc", "pptx", "png", "jpg"].map((t) => (
                          <option key={t} value={t}>
                            {t.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("midEvalSubmissionDeliverables", idx)}
                        disabled={!isEditing}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Evaluators */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Evaluators</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Judge Username
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="judge"
                    value={ps.judge}
                    onChange={handleChange}
                    placeholder="judge_username"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Company POC Username
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    name="companyPOC"
                    value={ps.companyPOC}
                    onChange={handleChange}
                    placeholder="company_poc_username"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  PPT Schedule Link
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  name="pptSchedule"
                  value={ps.pptSchedule}
                  onChange={handleChange}
                  placeholder="https://example.com/schedule"
                  disabled={!isEditing}
                />
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={handleUpdate}
              disabled={saving || !isEditing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-lg hover:shadow-xl"
            >
              {saving ? "Updating Problem Statement..." : "Save Changes"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || !isEditing}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-lg hover:shadow-xl"
            >
              {deleting ? "Deleting..." : "Delete Problem Statement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
