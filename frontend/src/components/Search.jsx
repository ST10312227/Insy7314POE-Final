import "./Search.css";
import { FaSearch } from "react-icons/fa";

function Search() {
  return (
    <div className="search-container">
      <h2 className="search-title">
        Find what you need <span>instantly</span>
      </h2>
      <p className="search-subtitle">
        Search your transactions, accounts, or bill payments in one place.
      </p>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by date, amount, reference, or description..."
        />
        <button className="search-btn">
          <FaSearch />
        </button>
      </div>

      <div className="search-results">
        <p>Your search results will appear here...</p>
      </div>
    </div>
  );
}

export default Search;
