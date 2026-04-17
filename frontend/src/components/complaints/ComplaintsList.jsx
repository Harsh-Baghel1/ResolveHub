import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchComplaints } from "../../features/complaint/complaintSlice";

const ComplaintsList = ({ type }) => {
  const dispatch = useDispatch();

  const { complaints, loading, error } = useSelector(
    (state) => state.complaint
  );

  useEffect(() => {
    dispatch(fetchComplaints(type));
  }, [dispatch, type]);

  if (loading) return <p>Loading complaints...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Complaints</h2>

      {complaints.length === 0 && <p>No complaints found</p>}

      {complaints.map((c) => (
        <div key={c._id}>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <p>Status: {c.status}</p>
          <p>SLA: {c.slaStatus}</p>
        </div>
      ))}
    </div>
  );
};

export default ComplaintsList;