// src/components/AddBeneficiaryIntlPayments.jsx
import "./AddBeneficiaryIntlPayments.css";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { useState } from "react";
import { CountryDropdown } from "react-country-region-selector";
import { useInternational } from "../context/InternationalContext";

function AddBeneficiaryIntlPayments() {
  const navigate = useNavigate();
  const { addBeneficiary } = useInternational();
  const [step, setStep] = useState(1);

  const [country, setCountry] = useState("");
  const [form, setForm] = useState({
    who: "",
    firstName: "",
    lastName: "",
    address: "",
    cityName: "",
    country: "",
    accountNumber: "",
    bank: "",
    swiftCode: "",
    currency: "USD",
    amount: "",
    reference: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCountryChange = (val) => { setCountry(val); setForm({ ...form, country: val }); };
  const handleNext = (e) => { e.preventDefault(); setStep(2); };
  const handleBackToStep1 = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Save beneficiary in Mongo
      const saved = await addBeneficiary(form);
      // Then go to confirmation; you can also hit POST /transfers later from that page
      navigate("/app/international/confirm", { state: { data: saved } });
    } catch (err) {
      setError(err.message || "Could not save beneficiary.");
    }
  };

  return (
    <div className="add-beneficiary-page">
      <button
        className="back-icon"
        onClick={() => (step === 1 ? navigate("/app/international") : handleBackToStep1())}
      >
        <FaArrowLeft />
      </button>

      <div className="add-beneficiary-card">
        <div className="icon-circle"><FaPhone /></div>

        {step === 1 ? (
          <>
            <h2 className="card-title">Add Beneficiary</h2>
            <div className="step-indicator">STEP 1 OF 2</div>

            {error && <div style={{ background:'#ffeaea', color:'#b10000', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>{error}</div>}

            <form className="beneficiary-form" onSubmit={handleNext}>
              <label>Who are you Paying?</label>
              <select name="who" value={form.who} onChange={handleChange} required>
                <option value="">Choose who</option>
                <option value="Person">Person</option>
                <option value="Business">Business</option>
              </select>

              <label>Choose Country</label>
              <CountryDropdown
                value={country}
                onChange={handleCountryChange}
                classes="country-select"
                priorityOptions={["United States", "South Africa"]}
                defaultOptionLabel="Choose Country"
              />

              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} required />
              <label>City / Town</label>
              <input name="cityName" value={form.cityName} onChange={handleChange} required />

              <button type="submit" className="add-btn">Next</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="card-title">Beneficiary Bank Details</h2>
            <div className="step-indicator">STEP 2 OF 2</div>

            {error && <div style={{ background:'#ffeaea', color:'#b10000', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>{error}</div>}

            <form className="beneficiary-form" onSubmit={handleSubmit}>
              <label>Account Number</label>
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} required />

              <label>Choose Bank</label>
              <select name="bank" value={form.bank} onChange={handleChange} required>
                <option value="">Choose Bank</option>
                <option value="Bank of China">Bank of China</option>
                <option value="Bank of America">Bank of America</option>
              </select>

              <div className="row">
                <div className="col">
                  <label>SWIFT Code</label>
                  <input name="swiftCode" value={form.swiftCode} onChange={handleChange} required />
                </div>
                <div className="col">
                  <label>Currency</label>
                  <select name="currency" value={form.currency} onChange={handleChange} required>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="CNY">CNY</option>
                    <option value="ZAR">ZAR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <label>Amount</label>
              <input name="amount" value={form.amount} onChange={handleChange} required />
              <label>Beneficiary Reference</label>
              <input name="reference" value={form.reference} onChange={handleChange} />

              <button type="submit" className="add-btn">Pay Now</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AddBeneficiaryIntlPayments;
