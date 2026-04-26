import { useEffect } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  PlusCircle,
  AlertCircle,
  Clock3,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import UserLayout from "../../layouts/UserLayout";

import {
  fetchComplaints,
} from "../../features/complaint/complaintSlice";

const Dashboard = () => {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  // AUTH STATE
  const { user } =
    useSelector(
      (state) =>
        state.auth || {}
    );

  // SAFE COMPLAINT STATE
  const complaintState =
    useSelector(
      (state) =>
        state.complaint || {}
    );

  const {
    complaints = [],
    loading = false,
    error = null,
  } = complaintState;

  // FETCH COMPLAINTS
  useEffect(() => {
    dispatch(
      fetchComplaints()
    );
  }, [dispatch]);

  // STATS
  const stats = {
    total:
      complaints.length,

    open:
      complaints.filter(
        (item) =>
          item.status ===
          "open"
      ).length,

    inProgress:
      complaints.filter(
        (item) =>
          item.status ===
          "in_progress"
      ).length,

    resolved:
      complaints.filter(
        (item) =>
          item.status ===
          "resolved"
      ).length,
  };

  return (
    <UserLayout>
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome,{" "}
          {user?.name ||
            "User"}
        </h1>

        <p className="text-gray-500 mt-2">
          Track your
          complaints and
          raise new support
          requests easily.
        </p>
      </div>

      {/* QUICK ACTION */}
      <div className="mb-6">
        <button
          onClick={() =>
            navigate(
              "/create-complaint"
            )
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
        >
          <PlusCircle
            size={18}
          />
          Create Complaint
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" />
          Loading...
        </div>
      ) : (
        <>
          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* STATS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex justify-between">
                <p className="text-gray-500">
                  Total
                </p>

                <AlertCircle className="text-blue-500" />
              </div>

              <h2 className="text-3xl font-bold mt-3">
                {
                  stats.total
                }
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex justify-between">
                <p className="text-gray-500">
                  Open
                </p>

                <Clock3 className="text-orange-500" />
              </div>

              <h2 className="text-3xl font-bold mt-3 text-orange-500">
                {
                  stats.open
                }
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex justify-between">
                <p className="text-gray-500">
                  In Progress
                </p>

                <AlertCircle className="text-purple-500" />
              </div>

              <h2 className="text-3xl font-bold mt-3 text-purple-500">
                {
                  stats.inProgress
                }
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex justify-between">
                <p className="text-gray-500">
                  Resolved
                </p>

                <CheckCircle2 className="text-green-500" />
              </div>

              <h2 className="text-3xl font-bold mt-3 text-green-500">
                {
                  stats.resolved
                }
              </h2>
            </div>
          </div>

          {/* RECENT */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Recent Complaints
            </h2>

            {complaints.length ===
            0 ? (
              <p className="text-gray-500">
                No complaints
                found.
              </p>
            ) : (
              <div className="space-y-4">
                {complaints
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item._id
                        }
                        className="border rounded-xl p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/complaint/${item._id}`
                          )
                        }
                      >
                        <h3 className="font-semibold text-gray-800">
                          {
                            item.title
                          }
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Status:{" "}
                          {
                            item.status
                          }
                        </p>
                      </div>
                    )
                  )}
              </div>
            )}
          </div>
        </>
      )}
    </UserLayout>
  );
};

export default Dashboard;