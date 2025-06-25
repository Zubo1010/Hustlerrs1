import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BidForm from "../components/job/BidForm";
import BidList from "../components/job/BidList";

export default function JobDetails({ userRole }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJob(res.data.job);
      } catch (error) {
        console.error("Failed to load job:", error);
        alert("Failed to load job");
      }
    };
    fetchJob();
  }, [jobId]);

  if (!job) return <p>Loading job...</p>;

  const handleChatClick = () => {
    navigate(`/messages?jobId=${jobId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <p>{job.description}</p>
      <p>Budget: {job.budget}</p>
      <p>Duration: {job.duration}</p>

      {/* Show bid form only if user is hustler */}
      {userRole === "hustler" && <BidForm jobId={jobId} onBidPlaced={() => {}} />}

      {/* Show bids and chat button only if user is job giver */}
      {userRole === "giver" && (
        <>
          <BidList jobId={jobId} />
          {job.assignedTo && (
            <button
              onClick={handleChatClick}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Chat with Hustler
            </button>
          )}
        </>
      )}
    </div>
  );
}
