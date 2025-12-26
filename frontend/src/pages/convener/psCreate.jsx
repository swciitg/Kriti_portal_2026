// src/pages/convener/PSCreate.jsx
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../constants";
import { userContext } from "../../context/userContext";

const emptyDeliverable = { name: "", type: "url" };
const emptyPointsItem = { field: "", weightage: 0 };

export default function PSCreate() {
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPs((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      return {
        ...prev,
        [field]: updatedArr,
      };
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

      return {
        ...prev,
        overallPointsDistribution: arr,
      };
    });
  };

  const validateBeforeSubmit = () => {
    if (!ps.name.trim()) return "Name is required.";
    if (!ps.prep) return "Prep level is required.";
    if (!ps.startDate) return "Start date is required.";
    if (!ps.submissionDeadline) return "Submission deadline is required.";
    if (!ps.registrationDeadline) return "Registration deadline is required.";
    if (!ps.pdf.trim()) return "PDF link is required.";
    if (ps.points === "" || ps.points === null || Number(ps.points) === 0) 
      return "Points are required and must be greater than 0.";
    if (ps.teamStrength === "" || Number(ps.teamStrength) < 1) 
      return "Team strength is required and must be at least 1.";

    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(ps.pdf.trim())) return "PDF link must be a valid URL.";

    if (ps.pptSchedule && !urlRegex.test(ps.pptSchedule.trim())) {
      return "PPT schedule must be a valid URL.";
    }

    if (ps.midEvalExist && !ps.midEvalSubmissionDeadline) {
      return "Mid evaluation submission date is required when mid evaluation exists.";
    }

    if (!isOverallPointsValid) {
      return "Overall points distribution must match total points.";
    }

    const subTotal = calculateTotal(ps.submissionPointsDistribution);
    if (ps.submissionPointsDistribution.length && subTotal !== 100) {
      return "Submission points distribution must total 100%.";
    }

    const pptTotal = calculateTotal(ps.pptPointsDistribution);
    if (ps.pptPointsDistribution.length && pptTotal !== 100) {
      return "PPT points distribution must total 100%.";
    }

    if (ps.midEvalExist) {
      const midTotal = calculateTotal(ps.midEvalPointsDistribution);
      if (ps.midEvalPointsDistribution.length && midTotal !== 100) {
        return "Mid term points distribution must total 100%.";
      }
    }

    return "";
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = {
      ...ps,
      points: Number(ps.points),
      teamStrength: Number(ps.teamStrength),
      overallPointsDistribution: ps.overallPointsDistribution.map(v => Number(v || 0)),
      judge: ps.judge.trim() || null,
      companyPOC: ps.companyPOC.trim() || null,
      pptSchedule: ps.pptSchedule.trim() || undefined,
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND_URL}/v1/convener/create-ps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create PS.");
      }
      setSuccess("Problem statement created successfully.");
      setTimeout(() => navigate("/convener/ps"), 1500);
    } catch (e) {
      setError(e.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const subTotal = calculateTotal(ps.submissionPointsDistribution);
  const pptTotal = calculateTotal(ps.pptPointsDistribution);
  const midTotal = calculateTotal(ps.midEvalPointsDistribution);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
            <h1 className="text-3xl font-bold">Create Problem Statement</h1>
            <p className="text-slate-200 mt-1">Define a new problem statement with all requirements</p>
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="name"
                    value={ps.name}
                    onChange={handleChange}
                    placeholder="e.g. Product Development Challenge"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Preparation Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="prep"
                    value={ps.prep}
                    onChange={handleChange}
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="teamStrength"
                    value={ps.teamStrength}
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    placeholder="e.g. 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Start Date &amp; Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="startDate"
                    value={ps.startDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Problem Statement PDF Link <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  name="pdf"
                  value={ps.pdf}
                  onChange={handleChange}
                  placeholder="https://example.com/ps-document.pdf"
                />
              </div>

              <label className="inline-flex items-center gap-3 cursor-pointer bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 hover:bg-blue-100 transition">
                <input
                  type="checkbox"
                  name="midEvalExist"
                  checked={ps.midEvalExist}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="registrationDeadline"
                    value={ps.registrationDeadline}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Final Submission Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="submissionDeadline"
                    value={ps.submissionDeadline}
                    onChange={handleChange}
                  />
                </div>

                {ps.midEvalExist && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Mid-Term Submission Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      name="midEvalSubmissionDeadline"
                      value={ps.midEvalSubmissionDeadline}
                      onChange={handleChange}
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  name="points"
                  value={ps.points}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  placeholder="e.g. 300"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      value={ps.overallPointsDistribution[0]}
                      onChange={(e) => handleOverallPointsChange(0, e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Presentation Score <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      value={ps.overallPointsDistribution[1]}
                      onChange={(e) => handleOverallPointsChange(1, e.target.value)}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        value={ps.overallPointsDistribution[2]}
                        onChange={(e) => handleOverallPointsChange(2, e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        placeholder="0"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                  >
                    + Add Criterion
                  </button>
                </div>
                {ps.submissionPointsDistribution.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Criterion name"
                      value={item.field}
                      onChange={(e) =>
                        handleArrayChange("submissionPointsDistribution", idx, "field", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="%"
                      value={item.weightage}
                      onChange={(e) =>
                        handleArrayChange("submissionPointsDistribution", idx, "weightage", e.target.value)
                      }
                      onWheel={(e) => e.target.blur()}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("submissionPointsDistribution", idx)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                  >
                    + Add Criterion
                  </button>
                </div>
                {ps.pptPointsDistribution.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Criterion name"
                      value={item.field}
                      onChange={(e) =>
                        handleArrayChange("pptPointsDistribution", idx, "field", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="%"
                      value={item.weightage}
                      onChange={(e) =>
                        handleArrayChange("pptPointsDistribution", idx, "weightage", e.target.value)
                      }
                      onWheel={(e) => e.target.blur()}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("pptPointsDistribution", idx)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition"
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                    >
                      + Add Criterion
                    </button>
                  </div>
                  {ps.midEvalPointsDistribution.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Criterion name"
                        value={item.field}
                        onChange={(e) =>
                          handleArrayChange("midEvalPointsDistribution", idx, "field", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="%"
                        value={item.weightage}
                        onChange={(e) =>
                          handleArrayChange("midEvalPointsDistribution", idx, "weightage", e.target.value)
                        }
                        onWheel={(e) => e.target.blur()}
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem("midEvalPointsDistribution", idx)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                  >
                    + Add Deliverable
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-3">Files or links required for final submission.</p>
                {ps.submissionDeliverables.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Deliverable name"
                      value={item.name}
                      onChange={(e) =>
                        handleArrayChange("submissionDeliverables", idx, "name", e.target.value)
                      }
                    />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={item.type}
                      onChange={(e) =>
                        handleArrayChange("submissionDeliverables", idx, "type", e.target.value)
                      }
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
                      className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {ps.midEvalExist && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Mid-Term Evaluation Files</h3>
                    <button
                      type="button"
                      onClick={() => addArrayItem("midEvalSubmissionDeliverables", emptyDeliverable)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                    >
                      + Add Deliverable
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Files or links required for mid-term evaluation.</p>
                  {ps.midEvalSubmissionDeliverables.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Deliverable name"
                        value={item.name}
                        onChange={(e) =>
                          handleArrayChange("midEvalSubmissionDeliverables", idx, "name", e.target.value)
                        }
                      />
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={item.type}
                        onChange={(e) =>
                          handleArrayChange("midEvalSubmissionDeliverables", idx, "type", e.target.value)
                        }
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
                        className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Roles & Links */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Roles &amp; Additional Links</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Judge User ID <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="judge"
                    value={ps.judge}
                    onChange={handleChange}
                    placeholder="MongoDB ObjectId"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Company POC User ID <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="companyPOC"
                    value={ps.companyPOC}
                    onChange={handleChange}
                    placeholder="MongoDB ObjectId"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    PPT Schedule URL <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="pptSchedule"
                    value={ps.pptSchedule}
                    onChange={handleChange}
                    placeholder="https://example.com/schedule"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Submit Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-sm font-bold transition-all shadow-lg hover:shadow-xl"
            >
              {saving ? "Creating Problem Statement..." : "Create Problem Statement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
