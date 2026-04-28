// frontend/src/pages/user/MyComplaints.jsx

import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  Loader2,
  FolderOpen,
  PlusCircle,
  Eye,
} from "lucide-react";

import UserLayout from "../../layouts/UserLayout";

import {
  fetchComplaints,
} from "../../features/complaint/complaintSlice";

const statusColors = {
  open:
    "bg-yellow-100 text-yellow-700",

  in_progress:
    "bg-blue-100 text-blue-700",

  resolved:
    "bg-green-100 text-green-700",

  closed:
    "bg-gray-100 text-gray-700",
};

const MyComplaints = () => {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const {
    complaints = [],
    loading = false,
    error = null,
  } = useSelector(
    (state) =>
      state.complaint ||
      {}
  );

  // FETCH
  useEffect(() => {
    dispatch(
      fetchComplaints()
    );
  }, [dispatch]);

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              My Complaints
            </h1>

            <p className="text-gray-500 mt-1">
              View and track all your submitted complaints.
            </p>
          </div>

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
            Raise Complaint
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 flex justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : complaints.length ===
          0 ? (
          /* EMPTY */
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <FolderOpen
              size={42}
              className="mx-auto text-gray-400 mb-4"
            />

            <h2 className="text-xl font-semibold text-gray-700">
              No Complaints Yet
            </h2>

            <p className="text-gray-500 mt-2">
              You haven’t created any complaints yet.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/create-complaint"
                )
              }
              className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
            >
              Create First Complaint
            </button>
          </div>
        ) : (
          /* TABLE */
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-sm text-gray-600">

                    <th className="px-6 py-4">
                      Title
                    </th>

                    <th className="px-6 py-4">
                      Category
                    </th>

                    <th className="px-6 py-4">
                      Priority
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Created
                    </th>

                    <th className="px-6 py-4 text-center">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {complaints.map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item._id
                        }
                        className="border-b last:border-0 hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-medium text-gray-800">
                          {
                            item.title
                          }
                        </td>

                        <td className="px-6 py-4 capitalize text-gray-600">
                          {
                            item.category
                          }
                        </td>

                        <td className="px-6 py-4 capitalize text-gray-600">
                          {
                            item.priority
                          }
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusColors[
                                item.status
                              ] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() =>
                              navigate(
                                `/complaint/${item._id}`
                              )
                            }
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          >
                            <Eye
                              size={
                                16
                              }
                            />
                            View
                          </button>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>

          </div>
        )}

      </div>
    </UserLayout>
  );
};

export default MyComplaints;