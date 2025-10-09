import "./FundsTransfer.css";

function FundsTransfer() {
  return (
    <div className="fund-transfer-container">
      <h2 className="fund-title">
        Fund <span>Transfer</span>
      </h2>
      <p className="fund-subtitle">
        Easily transfer funds between accounts, whether local, international, or within the same bank.
      </p>

      <div className="fund-card-wrapper">
        {/* === Local Transfer === */}
        <div className="fund-card white-card">
          <i className="fa-solid fa-user-group"></i>
          <h3>Local Transfer</h3>
        </div>

        {/* === International Transfer === */}
        <div className="fund-card blue-card">
          <i className="fa-solid fa-globe"></i>
          <h3>International Transfer</h3>
        </div>

        {/* === Same Bank Transfer === */}
        <div className="fund-card white-card">
          <i className="fa-solid fa-landmark"></i>
          <h3>Same Bank Transfer</h3>
        </div>
      </div>
    </div>
  );
}

export default FundsTransfer;
