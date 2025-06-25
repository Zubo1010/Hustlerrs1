import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function BidList({ jobId }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // Track loading per bid

  // Extract job info from the first bid (all bids are for the same job)
  const jobInfo = Array.isArray(bids) && bids.length > 0 ? bids[0].job : null;

  const fetchBids = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/bids/job/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBids(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch bids");
    }
    setLoading(false);
  };

  const handleBidAction = async (bidId, status) => {
    setActionLoading((prev) => ({ ...prev, [bidId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bids/${bidId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBids();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${status} bid`);
    }
    setActionLoading((prev) => ({ ...prev, [bidId]: false }));
  };

  useEffect(() => {
    fetchBids();
  }, [jobId]);

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: '🕒',
          message: 'Pending Review'
        };
      case 'accepted':
        return {
          color: 'bg-green-100 text-green-800',
          icon: '✅',
          message: 'Hired!'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: '❌',
          message: 'Not Selected'
        };
      case 'withdrawn':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '↩️',
          message: 'Withdrawn'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: 'ℹ️',
          message: status
        };
    }
  };

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Loading applications...</p>
    </div>
  );
  
  if (!Array.isArray(bids) || !bids.length) return (
    <div className="text-center py-8">
      <div className="text-4xl mb-4">📝</div>
      <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
      <p className="text-gray-500 mt-2">Applications will appear here once hustlers start applying.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Job Info Section */}
      {jobInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-gray-900 mb-3">Job Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Payment Method:</span>
              <span className="ml-2 text-gray-600">
                {jobInfo.payment?.method === 'Fixed price' 
                  ? `Fixed: ৳${jobInfo.payment?.amount}`
                  : jobInfo.payment?.method === 'Hourly'
                  ? `Hourly: ৳${jobInfo.payment?.rate}/hr`
                  : 'Bidding allowed'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Applications:</span>
              <span className="ml-2 text-gray-600">{bids.length} total</span>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {bids.map((bid) => {
          const statusInfo = getStatusInfo(bid.status);
          return (
            <div key={bid._id} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {bid.hustler?.name || 'Unknown User'}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.message}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Bid Amount:</span>
                      <span className="ml-2 text-lg font-semibold text-blue-600">৳{bid.price}</span>
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span>
                      <span className="ml-2">{new Date(bid.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {bid.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <span className="font-medium text-blue-800">Message from hustler:</span>
                      <p className="mt-1 text-blue-700">{bid.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {bid.status === 'accepted' && (
                    <span className="text-green-600 font-medium">✅ This hustler has been hired!</span>
                  )}
                  {bid.status === 'rejected' && (
                    <span className="text-red-600 font-medium">❌ Application not selected</span>
                  )}
                  {bid.status === 'withdrawn' && (
                    <span className="text-gray-600 font-medium">↩️ Application was withdrawn</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {bid.status === 'pending' && (
                    <>
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                        disabled={actionLoading[bid._id]}
                        onClick={() => handleBidAction(bid._id, 'accepted')}
                      >
                        {actionLoading[bid._id] ? 'Hiring...' : '✅ Hire This Person'}
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                        disabled={actionLoading[bid._id]}
                        onClick={() => handleBidAction(bid._id, 'rejected')}
                      >
                        {actionLoading[bid._id] ? 'Rejecting...' : '❌ Not Selected'}
                      </button>
                    </>
                  )}

                  {bid.status === 'accepted' && (
                    <Link
                      to="/messages"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      💬 Message Hustler
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
