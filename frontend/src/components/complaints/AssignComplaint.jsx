import axiosInstance from "../../api/axiosInstance";
import { useState } from "react";

const AssignComplaint = ({ complaintId }) => {
  const [agentId, setAgentId] = useState("");

  const handleAssign = async () => {
    try {
      await axiosInstance.put("/complaints/assign", {
        complaintId,
        assignedTo: agentId,
      });

      alert("Assigned");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input
        placeholder="Agent ID"
        onChange={(e) => setAgentId(e.target.value)}
      />
      <button onClick={handleAssign}>Assign</button>
    </div>
  );
};

export default AssignComplaint;