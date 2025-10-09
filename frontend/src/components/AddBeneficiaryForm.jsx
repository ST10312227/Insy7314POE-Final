import React from "react";
import "./AddBeneficiary.css";

function AddBeneficiaryForm() {
  return (
    <div className="add-beneficiary-container">
      <div className="icon-circle">📞</div>
      <div className="form-card">
        <h2>Add Beneficiary</h2>
        <form>
          <input type="text" placeholder="Beneficiary Name" required />
          <input type="text" placeholder="Cellphone Number" required />
          <select required>
            <option value="">Choose Network</option>
            <option value="vodacom">Vodacom</option>
            <option value="mtn">MTN</option>
            <option value="cellc">Cell C</option>
            <option value="telkom">Telkom</option>
          </select>
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
}

export default AddBeneficiaryForm;

