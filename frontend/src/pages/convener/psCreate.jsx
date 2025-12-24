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
    points: 0,
    overallPointsDistribution: [0, 0, 0],
    teamStrength: 1,
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
    arr.reduce((sum, item) => sum + Number(item.weightage || 0), 0);

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
      const arr = [...(prev.overallPointsDistribution || [0, 0, 0])];
      arr[index] = Number(value);
      const sub = arr[0] || 0;
      const ppt = arr[1] || 0;
      const mid = prev.midEvalExist ? arr[2] || 0 : 0;
      const total = sub + ppt + mid;
      if (total !== Number(prev.points)) {
        setIsOverallPointsValid(false);
      } else {
        setIsOverallPointsValid(true);
      }
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
    if (ps.points === "" || ps.points === null || ps.points === 0) return "Points are required.";
    if (!ps.teamStrength) return "Team strength is required.";

    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(ps.pdf.trim())) return "PDF link must be a valid URL.";

    if (ps.pptSchedule && !urlRegex.test(ps.pptSchedule.trim())) {
      return "PPT schedule must be a valid URL.";
    }

    if (ps.midEvalExist && !ps.midEvalSubmissionDeadline) {
      return "Mid evaluation submission date is required when mid evaluation exists.";
    }

    if (!isOverallPointsValid) {
      return "Overall points distribution does not match total points.";
    }

    const subTotal = calculateTotal(ps.submissionPointsDistribution);
    if (ps.submissionPointsDistribution.length && subTotal !== 100) {
      return "Submission points distribution must total 100.";
    }

    const pptTotal = calculateTotal(ps.pptPointsDistribution);
    if (ps.pptPointsDistribution.length && pptTotal !== 100) {
      return "PPT points distribution must total 100.";
    }

    // FIX: Only validate mid-eval if it exists
    if (ps.midEvalExist) {
      const midTotal = calculateTotal(ps.midEvalPointsDistribution);
      if (ps.midEvalPointsDistribution.length && midTotal !== 100) {
        return "Mid term points distribution must total 100.";
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
      return;
    }

    const payload = {
      ...ps,
      judge: ps.judge.trim() || null,
      companyPOC: ps.companyPOC.trim() || null,
      pptSchedule: ps.pptSchedule.trim() || undefined,
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BACKEND_URL}/api/v1/convener/create-ps`, {
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
    } finally {
      setSaving(false);
    }
  };

  const subTotal = calculateTotal(ps.submissionPointsDistribution);
  const pptTotal = calculateTotal(ps.pptPointsDistribution);
  const midTotal = calculateTotal(ps.midEvalPointsDistribution);

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-xl p-4 sm:p-6 flex flex-col">
        <h1 className="text-4xl font-semibold mb-4">
          Create Problem Statement
        </h1>

        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded px-3 py-2">
            {success}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Basic Information */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">📋 Basic Information</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Name of PS <span className="text-red-500">*</span>
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="name"
                  value={ps.name}
                  onChange={handleChange}
                  placeholder="e.g. Product Development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Prep Level <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
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
                <label className="block text-sm font-medium">
                  Team Strength <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="teamStrength"
                  value={ps.teamStrength}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Start Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="startDate"
                  value={ps.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">
                PS PDF Link <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                name="pdf"
                value={ps.pdf}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <label className="inline-flex items-center gap-2 text-lg">
              <input
                type="checkbox"
                name="midEvalExist"
                checked={ps.midEvalExist}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span>Mid evaluation exists</span>
            </label>
          </section>

          {/*Deadlines*/}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">⏰ Deadlines</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Team Registration Deadline{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="registrationDeadline"
                  value={ps.registrationDeadline}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  End term submission deadline{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="submissionDeadline"
                  value={ps.submissionDeadline}
                  onChange={handleChange}
                />
              </div>

              {ps.midEvalExist && (
                <div>
                  <label className="block text-sm font-medium">
                    Mid term submission deadline{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    name="midEvalSubmissionDeadline"
                    value={ps.midEvalSubmissionDeadline}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Overall points distribution */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">
              📊 Overall Points Distribution
            </h2>
            <div>
              <label className="block text-sm font-medium">
                Total Points <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full border rounded px-3 py-2 mb-1 text-sm"
                name="points"
                value={ps.points}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Define all submission components and their weightages. Total must
              be {ps.points} points. Current total:{" "}
              <span
                className={
                  isOverallPointsValid
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {ps.overallPointsDistribution[0] +
                  ps.overallPointsDistribution[1] +
                  (ps.midEvalExist ? ps.overallPointsDistribution[2] : 0)}
              </span>
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium">
                  End term submission score{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={ps.overallPointsDistribution[0]}
                  onChange={(e) => handleOverallPointsChange(0, e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Presentation score <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={ps.overallPointsDistribution[1]}
                  onChange={(e) => handleOverallPointsChange(1, e.target.value)}
                />
              </div>
              {ps.midEvalExist && (
                <div>
                  <label className="block text-sm font-medium">
                    Mid term Evaluation Score{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="mt-1 w-full border rounded px-3 py-2 text-sm"
                    value={ps.overallPointsDistribution[2]}
                    onChange={(e) =>
                      handleOverallPointsChange(2, e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </section>

          {/* Category wise points distribution */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              🎯 Category wise Points Distribution
            </h2>
            
            {/* Submission Points */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  Submission Points Distribution
                </span>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem(
                      "submissionPointsDistribution",
                      emptyPointsItem
                    )
                  }
                  className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Criterion
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Define criteria and weightages (total must be 100%). Current
                total:{" "}
                <span
                  className={
                    pointsValidation.submissionPointsDistribution
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {subTotal}%
                </span>
              </p>
              {ps.submissionPointsDistribution.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    className="border rounded px-2 py-1 text-sm flex-1"
                    placeholder="Criterion"
                    value={item.field}
                    onChange={(e) =>
                      handleArrayChange(
                        "submissionPointsDistribution",
                        idx,
                        "field",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="border rounded px-2 py-1 text-sm w-24"
                    placeholder="%"
                    value={item.weightage}
                    onChange={(e) =>
                      handleArrayChange(
                        "submissionPointsDistribution",
                        idx,
                        "weightage",
                        e.target.value
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem("submissionPointsDistribution", idx)
                    }
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {/* PPT Points */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  PPT Points Distribution
                </span>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("pptPointsDistribution", emptyPointsItem)
                  }
                  className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Criterion
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Define PPT judging criteria (total must be 100%). Current total:{" "}
                <span
                  className={
                    pointsValidation.pptPointsDistribution
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {pptTotal}%
                </span>
              </p>
              {ps.pptPointsDistribution.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    className="border rounded px-2 py-1 text-sm flex-1"
                    placeholder="Criterion"
                    value={item.field}
                    onChange={(e) =>
                      handleArrayChange(
                        "pptPointsDistribution",
                        idx,
                        "field",
                        e.target.value
                      )
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="border rounded px-2 py-1 text-sm w-24"
                    placeholder="%"
                    value={item.weightage}
                    onChange={(e) =>
                      handleArrayChange(
                        "pptPointsDistribution",
                        idx,
                        "weightage",
                        e.target.value
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem("pptPointsDistribution", idx)
                    }
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {/* Mid Eval Points - Only show if mid eval exists */}
            {ps.midEvalExist && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    Mid term Points Distribution
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("midEvalPointsDistribution", emptyPointsItem)
                    }
                    className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Criterion
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Define criteria and weightages (total must be 100%). Current
                  total:{" "}
                  <span
                    className={
                      pointsValidation.midEvalPointsDistribution
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {midTotal}%
                  </span>
                </p>
                {ps.midEvalPointsDistribution.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border rounded px-2 py-1 text-sm flex-1"
                      placeholder="Criterion"
                      value={item.field}
                      onChange={(e) =>
                        handleArrayChange(
                          "midEvalPointsDistribution",
                          idx,
                          "field",
                          e.target.value
                        )
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="border rounded px-2 py-1 text-sm w-24"
                      placeholder="%"
                      value={item.weightage}
                      onChange={(e) =>
                        handleArrayChange(
                          "midEvalPointsDistribution",
                          idx,
                          "weightage",
                          e.target.value
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem("midEvalPointsDistribution", idx)
                      }
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submission Deliverables */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">📦 Submission Deliverables</h2>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Final Submission Deliverables</span>
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem("submissionDeliverables", emptyDeliverable)
                  }
                  className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Deliverable
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Files or links required for final submission.
              </p>
              {ps.submissionDeliverables.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    className="border rounded px-2 py-1 text-sm flex-1"
                    placeholder="Name"
                    value={item.name}
                    onChange={(e) =>
                      handleArrayChange(
                        "submissionDeliverables",
                        idx,
                        "name",
                        e.target.value
                      )
                    }
                  />
                  <select
                    className="border rounded px-2 py-1 text-sm w-28"
                    value={item.type}
                    onChange={(e) =>
                      handleArrayChange(
                        "submissionDeliverables",
                        idx,
                        "type",
                        e.target.value
                      )
                    }
                  >
                    {[
                      "url",
                      "pdf",
                      "zip",
                      "ipynb",
                      "doc",
                      "pptx",
                      "png",
                      "jpg",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem("submissionDeliverables", idx)
                    }
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {/* Mid Eval Deliverables - Only show if mid eval exists */}
            {ps.midEvalExist && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    Mid Evaluation Deliverables
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem(
                        "midEvalSubmissionDeliverables",
                        emptyDeliverable
                      )
                    }
                    className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Deliverable
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Files or links required for mid evaluation.
                </p>
                {ps.midEvalSubmissionDeliverables.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      className="border rounded px-2 py-1 text-sm flex-1"
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) =>
                        handleArrayChange(
                          "midEvalSubmissionDeliverables",
                          idx,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <select
                      className="border rounded px-2 py-1 text-sm w-28"
                      value={item.type}
                      onChange={(e) =>
                        handleArrayChange(
                          "midEvalSubmissionDeliverables",
                          idx,
                          "type",
                          e.target.value
                        )
                      }
                    >
                      {[
                        "url",
                        "pdf",
                        "zip",
                        "ipynb",
                        "doc",
                        "pptx",
                        "png",
                        "jpg",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem("midEvalSubmissionDeliverables", idx)
                      }
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Roles & Links */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">👥 Roles & Links</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">
                  Judge (User ObjectId){" "}
                  <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="judge"
                  value={ps.judge}
                  onChange={handleChange}
                  placeholder="Paste Judge user _id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Company POC (User ObjectId){" "}
                  <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="companyPOC"
                  value={ps.companyPOC}
                  onChange={handleChange}
                  placeholder="Paste Company user _id"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  PPT Schedule URL{" "}
                  <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  name="pptSchedule"
                  value={ps.pptSchedule}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>
        </div>

        <button
          onClick={handleCreate}
          disabled={saving}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm font-medium"
        >
          {saving ? "Creating…" : "Create PS"}
        </button>
      </div>
    </div>
  );
}
