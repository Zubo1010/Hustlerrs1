import { useState } from "react";
import axios from "axios";

export default function BidForm({ jobId, onBidPlaced }) {
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price) return alert("Price is required");

    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // auth token
      const res = await axios.post(
        `http://localhost:5000/api/bids/${jobId}`,
        { price, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Bid placed successfully");
      setPrice("");
      setNotes("");
      onBidPlaced(); // refresh parent list or UI
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place bid");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded-md">
      <input
        type="number"
        placeholder="Your Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="input input-bordered w-full"
        required
      />
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="input input-bordered w-full"
      />
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Placing Bid..." : "Place Bid"}
      </button>
    </form>
  );
}
