import "./AddBeneficiaryIntlPayments.css";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPhone } from "react-icons/fa";
import { useState } from "react";
import { CountryDropdown } from "react-country-region-selector";

function AddBeneficiaryIntlPayments() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [country, setCountry] = useState("");
  const [form, setForm] = useState({
    who: "",
    firstName: "",
    lastName: "",
    address: "",
    cityName: "",
    accountNumber: "",
    bank: "",
    swiftCode: "",
    currency: "",
    amount: "",
    reference: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCountryChange(val) {
    setCountry(val);
    setForm({ ...form, country: val });
  }

  function handleNext(e) {
    e.preventDefault();
    setStep(2);
  }

  function handleBackToStep1() {
    setStep(1);
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Save beneficiary logic here
    alert("Beneficiary submitted!");
    navigate("/beneficiaries");
  }

  return (
    <div className="add-beneficiary-page">
      <button className="back-icon" onClick={() => step === 1 ? navigate("/buy-airtime") : handleBackToStep1()}>
        <FaArrowLeft />
      </button>
      <div className="add-beneficiary-card">
        <div className="icon-circle">
          <FaPhone />
        </div>
        {step === 1 ? (
          <>
            <h2 className="card-title">Add Beneficiary</h2>
            <div className="step-indicator">STEP 1 OUT OF 2</div>
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
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                required
              />

              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                required
              />

              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="123 Main St"
                value={form.address}
                onChange={handleChange}
                required
              />

              <label>City / Town</label>
              <input
                type="text"
                name="cityName"
                placeholder="Cape Town"
                value={form.cityName}
                onChange={handleChange}
                required
              />

              <button type="submit" className="add-btn">
                Next
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="card-title">Beneficiary Bank Details</h2>
            <div className="step-indicator">STEP 2 OUT OF 2</div>
            <form className="beneficiary-form" onSubmit={handleSubmit}>
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                placeholder="CN123456789012"
                value={form.accountNumber}
                onChange={handleChange}
                required
              />

              <label>Choose Bank</label>
              <select
                name="bank"
                value={form.bank}
                onChange={handleChange}
                required
              >
                <option value="">Choose Bank</option>
                <option value="Bank of China">Bank of China</option>
                <option value="Bank of America">Bank of America</option>
              </select>

              <div className="row">
                <div className="col">
                  <label>SWIFT Code</label>
                  <input
                    type="text"
                    name="swiftCode"
                    placeholder="BKCHCNBJ"
                    value={form.swiftCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col">
                  <label>Currency</label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Currency</option>
                    <option value="CNY">CNY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <label>Amount</label>
              <input
                type="text"
                name="amount"
                placeholder="10,000"
                value={form.amount}
                onChange={handleChange}
                required
              />

              <label>Beneficiary Reference</label>
              <input
                type="text"
                name="reference"
                placeholder="Family Funds"
                value={form.reference}
                onChange={handleChange}
                required
              />

              <button type="submit" className="add-btn">
                Pay Now
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AddBeneficiaryIntlPayments;
