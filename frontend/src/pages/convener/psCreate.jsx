import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { BACKEND_URL } from "../../constants";
import { userContext } from "../../context/userContext";

export default function PSCreate() {

  const navigate = useNavigate();
  const { user } = useContext(userContext);

  const [ps, setPs] = useState({
    name: "",
    registrationDeadline: "",
    submissionDeadline: "",
    judge: "",
    pdf: "",
    midEvalExist: false,
    midEvalSubmissionDeadline: "",
    prep: "high",
    points: 0,
    midEvalSubmissionDeliverables: [],
    submissionDeliverables: [],
    midEvalPointsDistribution: [],
    submissionPointsDistribution: [],
    pptPointsDistribution: [],
    pptSchedule: "",
    teamStrength: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Redirect non-Convener users
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (
      (!user && !stored) ||
      (stored?.role !== "Convener" && user?.role !== "Convener")
    ) {
      navigate("/sign-in");
    }
  }, [user, navigate]);

  // Handle simple input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPs({ ...ps, [name]: type === "checkbox" ? checked : value });
  };

  // Handle array field changes
  const handleArrayChange = (field, index, key, value) => {
    const arr = [...ps[field]];
    arr[index][key] = value;
    setPs({ ...ps, [field]: arr });
  };

  const handleAddArrayItem = (field, defaultObj) => {
    setPs({ ...ps, [field]: [...ps[field], defaultObj] });
  };

  const handleRemoveArrayItem = (field, index) => {
    const arr = [...ps[field]];
    arr.splice(index, 1);
    setPs({ ...ps, [field]: arr });
  };

  // Create PS
  const handleCreate = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/convener/create-ps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("accessToken"),
        },
        body: JSON.stringify(ps),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      alert("PS created successfully!");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white shadow rounded-xl p-6 flex flex-col h-[calc(100vh-5rem)]">
        <div className="overflow-y-auto pr-3 space-y-5">
          <h1 className="text-2xl font-semibold">Create Problem Statement</h1>
          {error && <p className="text-red-600 text-center">{error}</p>}

          <div className="space-y-4">
            {/* Basic Fields */}
            <input
              className="w-full border p-2 rounded"
              name="name"
              value={ps.name}
              onChange={handleChange}
              placeholder="Name"
            />
            <select
              className="w-full border p-2 rounded"
              name="prep"
              value={ps.prep}
              onChange={handleChange}
            >
              {["high", "mid", "low", "no"].map((level) => (
                <option key={level} value={level}>
                  {level.toUpperCase()}
                </option>
              ))}
            </select>
            <input
              className="w-full border p-2 rounded"
              type="datetime-local"
              name="registrationDeadline"
              value={ps.registrationDeadline?.slice(0, 16)}
              onChange={handleChange}
            />
            <input
              className="w-full border p-2 rounded"
              type="datetime-local"
              name="submissionDeadline"
              value={ps.submissionDeadline?.slice(0, 16)}
              onChange={handleChange}
            />
            <input
              className="w-full border p-2 rounded"
              name="judge"
              value={ps.judge}
              onChange={handleChange}
              placeholder="Judge"
            />
            <input
              className="w-full border p-2 rounded"
              name="pdf"
              value={ps.pdf}
              onChange={handleChange}
              placeholder="PDF Link"
            />
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                name="midEvalExist"
                checked={ps.midEvalExist}
                onChange={handleChange}
              />
              Mid Evaluation Exists
            </label>
            {ps.midEvalExist && (
              <>
                {/* Mid Eval Deadline */}
                <input
                  className="w-full border p-2 rounded"
                  type="datetime-local"
                  name="midEvalSubmissionDeadline"
                  value={ps.midEvalSubmissionDeadline?.slice(0, 16)}
                  onChange={handleChange}
                />

                {/* Mid Eval Submission Deliverables */}
                <div className="space-y-2">
                  <h4 className="font-semibold">
                    midEvalSubmissionDeliverables
                  </h4>
                  {ps.midEvalSubmissionDeliverables.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border p-1 rounded flex-1"
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
                        value={item.type}
                        onChange={(e) =>
                          handleArrayChange(
                            "midEvalSubmissionDeliverables",
                            idx,
                            "type",
                            e.target.value
                          )
                        }
                        className="border p-1 rounded"
                      >
                        {["URL", "pdf", "zip", "ipynb", "docs", "pptx"].map(
                          (t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveArrayItem(
                            "midEvalSubmissionDeliverables",
                            idx
                          )
                        }
                        className="bg-red-500 text-white px-2 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      handleAddArrayItem("midEvalSubmissionDeliverables", {
                        name: "",
                        type: "URL",
                      })
                    }
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    Add midEvalSubmissionDeliverables
                  </button>
                </div>

                {/* Mid Eval Points Distribution */}
                <div className="space-y-2">
                  <h4 className="font-semibold">midEvalPointsDistribution</h4>
                  {ps.midEvalPointsDistribution.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border p-1 rounded flex-1"
                        placeholder="Field"
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
                        className="border p-1 rounded w-24"
                        type="number"
                        placeholder="Weightage"
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
                          handleRemoveArrayItem(
                            "midEvalPointsDistribution",
                            idx
                          )
                        }
                        className="bg-red-500 text-white px-2 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      handleAddArrayItem("midEvalPointsDistribution", {
                        field: "",
                        weightage: 0,
                      })
                    }
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    Add midEvalPointsDistribution
                  </button>
                </div>
              </>
            )}

            {/* Submission Deliverables */}
            <div className="space-y-2">
              <h4 className="font-semibold">submissionDeliverables</h4>
              {ps.submissionDeliverables.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    className="border p-1 rounded flex-1"
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
                    value={item.type}
                    onChange={(e) =>
                      handleArrayChange(
                        "submissionDeliverables",
                        idx,
                        "type",
                        e.target.value
                      )
                    }
                    className="border p-1 rounded"
                  >
                    {["URL", "pdf", "zip", "ipynb", "docs", "pptx"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveArrayItem("submissionDeliverables", idx)
                    }
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("submissionDeliverables", {
                    name: "",
                    type: "URL",
                  })
                }
                className="bg-green-500 text-white px-2 rounded"
              >
                Add submissionDeliverables
              </button>
            </div>

            {/* Points Distribution and PPT */}
            {["submissionPointsDistribution", "pptPointsDistribution"].map(
              (field) => (
                <div key={field} className="space-y-2">
                  <h4 className="font-semibold">{field}</h4>
                  {ps[field].map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border p-1 rounded flex-1"
                        placeholder="Field"
                        value={item.field}
                        onChange={(e) =>
                          handleArrayChange(field, idx, "field", e.target.value)
                        }
                      />
                      <input
                        className="border p-1 rounded w-24"
                        type="number"
                        placeholder="Weightage"
                        value={item.weightage}
                        onChange={(e) =>
                          handleArrayChange(
                            field,
                            idx,
                            "weightage",
                            e.target.value
                          )
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(field, idx)}
                        className="bg-red-500 text-white px-2 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      handleAddArrayItem(field, { field: "", weightage: 0 })
                    }
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    Add {field}
                  </button>
                </div>
              )
            )}

            {/* Points and PPT Schedule */}
            <input
              className="w-full border p-2 rounded"
              type="number"
              name="points"
              value={ps.points}
              onChange={handleChange}
              placeholder="Points"
            />
            <input
              className="w-full border p-2 rounded"
              name="pptSchedule"
              value={ps.pptSchedule}
              onChange={handleChange}
              placeholder="PPT Schedule (URL)"
            />
            <input
              className="w-full border p-2 rounded"
              type="number"
              name="teamStrength"
              value={ps.teamStrength}
              onChange={handleChange}
              placeholder="Team Strength"
            />

            {/* Actions */}
            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {saving ? "Updating…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
