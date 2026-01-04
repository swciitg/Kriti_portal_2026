import { useEffect, useState, useContext } from "react";
import { userContext } from "../../../context/userContext.jsx";
import { BACKEND_URL } from "../../../constants.js";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/loader.jsx";
import prependZeroes from  "../../../utils/prependZeroes.js"

export default function UsersPage() {
    const { user } = useContext(userContext);
    const navigate = useNavigate();

    const [data, setData] = useState({
        judges: [],
        companies: [],
        techSecys: []
    });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("accessToken");
                const res = await fetch(
                    `${BACKEND_URL}/v1/convener/get-all-users`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: token ? `Bearer ${token}` : ""
                        }
                    }
                );

                const result = await res.json();
                if (res.status !== 200 || !result.success) {
                    setError(result.message || "Failed to fetch users");
                    return;
                }

                delete result.success;
                setData(result);
            } catch {
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filterUsers = (users) =>
        users.filter((item) =>
            item.user?.username
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );
const Section = ({ title, users }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="mb-10">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-full text-left text-xl font-bold text-slate-900 mb-4
                        flex justify-between items-center
                        bg-slate-100 hover:bg-slate-200
                        px-4 py-3 rounded-xl transition"
            >
                <span>{title}</span>
                <span className="cursor-pointer text-blue-600 text-2xl font-medium">
                {open ? "−" : "+"}
                </span>
            </button>

        {open && (
            <div className="grid gap-4 grid-cols-2">
            {users.map((item) => (
                <div
                key={item._id}
                className="border border-slate-200 rounded-xl p-4 bg-white
                            shadow-sm hover:shadow-md transition text-wraps"
                >
                <p className="text-slate-900 font-semibold text-wraps">
                    {item.user?.username || "Unnamed User"}
                </p>

                <p className="text-sm font-medium text-slate-500 text-wraps">
                    Email: {item.user?.email || "N/A"}
                </p>

                {item.ps && (
                    <p className="text-sm font-medium text-slate-500 mt-1 text-wraps">
                    Problem Statement: {item.ps?.name || item.ps?._id}
                    </p>
                )}

                {typeof item.hostelId !== "undefined" && (
                    <p className="text-sm font-medium text-slate-500 mt-1 text-wraps">
                    Hostel ID: {prependZeroes(item.hostelId , 4)}
                    </p>
                )}

                {typeof item.verified !== "undefined" && (
                    <p className="text-sm mt-2 font-medium">
                    Verified:{" "}
                    <span
                        className={
                        item.verified
                            ? "text-green-600 font-semibold"
                            : "text-red-500 font-semibold"
                        }
                    >
                        {item.verified ? "Yes" : "No"}
                    </span>
                    </p>
                )}
                </div>
            ))}
            </div>
        )}
        </div>

    );
};


    return (
    <div className="h-screen overflow-y-auto sm:px-4 sm:py-8 sm:pt-16 px-0 sm:w-[40%] w-[100%] bg-slate-50">
    <div className="mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Existing Users
        </h1>

        <input
        type="text"
        placeholder="Search by username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-8 px-4 py-2.5 border border-slate-300 rounded-lg
                    bg-white text-slate-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {error && (
        <p className="w-full text-center text-red-600 text-sm font-medium">
            {error}
        </p>
        )}

        {loading && (
        <Loader text="Loading Existing Users..."/>
        )}

        {!loading && (
        <>
            <Section
            title="Judges"
            users={filterUsers(data.judges)}
            />
            <Section
            title="Company Associates"
            users={filterUsers(data.companies)}
            />
            <Section
            title="Technical Secretaries"
            users={filterUsers(data.techSecys)}
            />
        </>
        )}
    </div>
    </div>
    );
}
