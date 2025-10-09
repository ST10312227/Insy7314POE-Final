import { useState } from "react";
import "./AccountDetails.css";
import { FaUser, FaLock, FaUserCircle } from "react-icons/fa";

function AccountDetails() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="account-container">
      {/* LEFT SIDEBAR */}
      <div className="account-sidebar">
        <div className="profile">
          <FaUserCircle className="avatar-icon" />
          <h3>John Doe</h3>
        </div>

        <div className="menu">
          <button
            className={`menu-btn ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <FaUser /> Personal Details
          </button>
          <button
            className={`menu-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FaLock /> Security Settings
          </button>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="account-form-section">
        {activeTab === "personal" ? (
          <>
            <h2>Personal Details</h2>

            <form className="details-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value="John Doe" readOnly />
                </div>
                <div className="form-group">
                  <label>Identity Number</label>
                  <input type="text" value="010504294080" readOnly />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cell Number</label>
                  <input type="text" value="071 245 7894" readOnly />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value="john.doe@gmail.com" readOnly />
                </div>
              </div>

              <div className="form-row single">
                <div className="form-group">
                  <label>Currency</label>
                  <select defaultValue="ZAR" disabled>
                    <option>ZAR</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>

              <button type="button" className="save-btn">
                Save
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Security Settings</h2>

            <form className="details-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Change Password</label>
                  <input type="password" value="***************" readOnly />
                </div>
                <div className="form-group">
                  <label>Two-factor Authentication</label>
                  <select defaultValue="ON" disabled>
                    <option>ON</option>
                    <option>OFF</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Recovery Email</label>
                  <input type="email" value="johnldoe@gmail.com" readOnly />
                </div>
                <div className="form-group">
                  <label>Recovery Number</label>
                  <input type="text" value="072 256 7896" readOnly />
                </div>
              </div>

              <button type="button" className="save-btn">
                Save
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AccountDetails;
