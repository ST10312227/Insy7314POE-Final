import { useParams, useNavigate } from "react-router-dom";
import { useBeneficiaries } from "../context/BeneficiaryContext";
import "./BeneficiaryDetails.css";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { useState } from "react";

function BeneficiaryDetails() {
  const { id } = useParams();
  const { beneficiaries } = useBeneficiaries();
  const navigate = useNavigate();

  // Get the selected beneficiary (index passed from BuyAirtime)
  const beneficiary = beneficiaries[id];

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!beneficiary) {
    return (
      <div className="add-beneficiary-page">
        <button className="back-icon" onClick={() => navigate("/app/buy-airtime")}>
          <FaArrowLeft />
        </button>
        <div className="add-beneficiary-card">
          <h2 className="card-title">Beneficiary not found</h2>
        </div>
      </div>
    );
  }

  const buyAirtime = async () => {
    setMsg("");
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 5 || amt > 1000) {
      setMsg("Enter an amount between R5 and R1000.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payments/airtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          name: beneficiary.name,
          number: beneficiary.number,
          network: beneficiary.network,
          amount: amt,
          // fromAccountNumber: "1234567890" // optional: choose a specific account
        }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { error: (await res.text())?.slice(0, 200) };

      if (!res.ok) {
        const map = {
          insufficient_funds: "Insufficient funds in the selected account.",
          balance_conflict: "Balance changed, please try again.",
          airtime_failed: "Airtime top-up failed. Try again.",
        };
        setMsg(map[data?.error] || data?.error || `Failed (${res.status}).`);
        return;
      }

      const pretty = (cents) => `R${(cents / 100).toFixed(2)}`;
      setMsg(
        `Success! Purchased ${pretty(data.amountCents)} airtime for ${beneficiary.name}.` +
          (typeof data.balanceAfter === "number"
            ? ` New balance: R${data.balanceAfter.toFixed(2)}.`
            : "")
      );
      setAmount("");
    } catch (e) {
      console.error("airtime error", e);
      setMsg("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-beneficiary-page">
      <button className="back-icon" onClick={() => navigate("/app/buy-airtime")}>
        <FaArrowLeft />
      </button>

      <div className="add-beneficiary-card">
        <div className="icon-circle">
          <FaPhone />
        </div>

        <h2 className="card-title">{beneficiary.name}</h2>
        <p className="beneficiary-subtext">{beneficiary.network}</p>
        <p className="beneficiary-subtext">{beneficiary.number}</p>

        <hr className="divider" />

        <div className="beneficiary-info">
          <p>
            <strong>Network:</strong> {beneficiary.network}
          </p>
          <p>
            <strong>Phone:</strong> {beneficiary.number}
          </p>
        </div>

        {/* Amount input */}
        <div style={{ marginTop: 16, width: "100%" }}>
          <label style={{ display: "block", marginBottom: 6 }}>Amount (ZAR)</label>
          <input
            type="number"
            min={5}
            max={1000}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 50"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1.5px solid #000",
              fontSize: 16,
            }}
          />
        </div>

        {msg && (
          <div
            style={{
              marginTop: 12,
              alignSelf: "stretch",
              background: msg.startsWith("Success") ? "#e8fff1" : "#ffeaea",
              color: msg.startsWith("Success") ? "#066a2b" : "#b10000",
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 14,
            }}
          >
            {msg}
          </div>
        )}

        <button
          className="add-btn"
          onClick={buyAirtime}
          disabled={loading}
          style={{ marginTop: 14 }}
        >
          {loading ? "Processing..." : "Buy Airtime"}
        </button>
      </div>
    </div>
  );
}

export default BeneficiaryDetails;
