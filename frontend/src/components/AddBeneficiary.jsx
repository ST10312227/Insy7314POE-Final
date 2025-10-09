import "./AddBeneficiary.css";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { useState } from "react";
import { useBeneficiaries } from "../context/BeneficiaryContext";

function AddBeneficiary() {
  const navigate = useNavigate();
  const { addBeneficiary } = useBeneficiaries();
  const [form, setForm] = useState({ name: "", number: "", network: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addBeneficiary(form);     // if async; okay if sync as well
    navigate("/app/buy-airtime");   // ✅ stay inside /app shell
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

        <h2 className="card-title">Add Beneficiary</h2>

        <form onSubmit={handleSubmit} className="beneficiary-form">
          <label>Beneficiary Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Cellphone Number</label>
          <input
            type="tel"
            name="number"
            value={form.number}
            onChange={handleChange}
            required
            inputMode="numeric"
          />

          <label>Choose Network</label>
          <select
            name="network"
            value={form.network}
            onChange={handleChange}
            required
          >
            <option value="">Choose Network</option>
            <option value="Cell C">Cell C</option>
            <option value="MTN">MTN</option>
            <option value="Telkom Mobile">Telkom Mobile</option>
            <option value="Vodacom">Vodacom</option>
          </select>

          <button type="submit" className="add-btn">Add</button>
        </form>
      </div>
    </div>
  );
}

export default AddBeneficiary;
