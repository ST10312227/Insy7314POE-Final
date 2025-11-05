import { useMemo, useState } from "react";
import "./EmployeeDashboard.css";

function StatusPill({ value }) {
  const v = (value || "").toLowerCase();
  return (
    <span
      className={
        "status-pill " +
        (v === "verified"
          ? "ok"
          : v === "declined"
          ? "bad"
          : "pending")
      }
    >
      {value}
    </span>
  );
}

function SidebarItem({ icon, label, active }) {
  return (
    <div className={"sb-item " + (active ? "active" : "")}>
      <div className="sb-icon" aria-hidden>{icon}</div>
      <div className="sb-label">{label}</div>
    </div>
  );
}

export default function EmployeeDashboard() {
  // Demo dataset (swap with API data)
  const rows = useMemo(
    () => [
      ["John Doe", "789455515557", "Chen Wei", "10,000.00", "CNY", "ES792100081361", "BKCHCNBJ", "Pending"],
      ["Thabo Land", "784562100339", "Bob Win", "12,000.00", "ZAR", "ES792100081361", "DEUTDEFF", "Pending"],
      ["Emily Blunt", "784562100339", "Tara Kyl", "12,000.00", "USD", "ES792100081361", "BARCGB22", "Verified"],
      ["Jacob Day", "784562100339", "Justin Kil", "5,000.00", "USD", "ES792100081361", "BARCGB22", "Declined"],
      ["William Fin", "784562100339", "Jen Ling", "5,000.00", "GBP", "ES792100081361", "DEUTDEFF", "Pending"],
      ["Ahmed Val", "784562100339", "Ken Min", "5,000.00", "GBP", "ES792100081361", "DEUTDEFF", "Verified"],
      ["Katy Wing", "784562100339", "Alysa Die", "12,000.00", "GBP", "ES792100081361", "BARCGB22", "Declined"],
      ["Jenna Night", "784562100339", "Jon Bin", "12,000.00", "EUR", "ES792100081361", "DEUTDEFF", "Pending"],
      ["Bob Villan", "784562100339", "Mat Davis", "12,000.00", "ZAR", "ES792100081361", "MIDLGB22", "Verified"],
      ["Carter Ring", "784562100339", "Kat Gram", "5,000.00", "EUR", "ES792100081361", "MIDLGB22", "Verified"],
    ],
    []
  );

  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) =>
    r.join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="emp-page">
      {/* Sidebar */}
      <aside className="emp-sidebar">
        <div className="brand">the<br/>vault</div>

        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h18v4H3V3zm0 6h18v12H3V9zm2 2v8h14v-8H5zm2 2h4v4H7v-4z" />
            </svg>
          }
          label="Pending Transactions"
          active
        />

        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6h2a4 4 0 0 1 8 0h2c0-3.31-2.69-6-6-6z"/>
            </svg>
          }
          label="Account Details"
        />

        <div className="sb-spacer" />

        <SidebarItem
          icon={<span className="dot" />}
          label="Notifications"
        />
        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 13v-2H7v-2l-5 3 5 3v-2zM20 3H10v2h10v14H10v2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
            </svg>
          }
          label="Logout"
        />
        <SidebarItem
          icon={
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 17h-2v-2h2v2zm2.07-7.75-.9.92A3.49 3.49 0 0 0 13 15h-2v-.5c0-1 .5-1.5 1.1-2.1l1.2-1.2a1.5 1.5 0 1 0-2.6-1 1 1 0 0 1-1.9-.6A3.5 3.5 0 1 1 15.07 11.25z"/>
            </svg>
          }
          label="Help"
        />
      </aside>

      {/* Main content */}
      <main className="emp-main">
        <header className="emp-topbar">
          <div />
          <div className="hello">Hello, Jane Doe!</div>
        </header>

        <section className="card">
          <div className="card-head">
            <div className="title-wrap">
              <h1 className="page-title">
                <span>Pending Transactions</span>
                <span className="pipe">|</span>
                <span className="linkish">International Payments</span>
              </h1>
              <p className="sub">
                Review and verify customer international payments before submitting to SWIFT.
              </p>
            </div>

            <div className="actions">
              <div className="search">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  aria-label="Search"
                />
                <button className="icon-btn" aria-label="Search">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-5-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </button>
              </div>
              <button className="filter-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 18h4v-2h-4v2zm-7-8v2h18v-2H3zm3-6v2h12V4H6z"/>
                </svg>
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Customer Account</th>
                  <th>Beneficiary Name</th>
                  <th>Amount.</th>
                  <th>Curr.</th>
                  <th>Beneficiary Account</th>
                  <th>SWIFT co.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td className="num">{r[3]}</td>
                    <td>{r[4]}</td>
                    <td>{r[5]}</td>
                    <td>{r[6]}</td>
                    <td><StatusPill value={r[7]} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty">No results.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <span className="dot active" />
            <span className="dot" />
            <span className="dot" />
            <svg className="caret" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </div>
        </section>
      </main>
    </div>
  );
}
