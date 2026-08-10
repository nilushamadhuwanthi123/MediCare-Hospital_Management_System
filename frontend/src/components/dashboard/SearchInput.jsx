import { useEffect, useState } from "react";
import { Search } from "lucide-react";

/**
 * Debounces typing before calling onSearch so we don't fire an API request
 * on every keystroke while an admin is typing a name into a filter box.
 */
const SearchInput = ({ placeholder = "Search...", onSearch, delay = 400 }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => onSearch(value), delay);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div style={{ position: "relative", minWidth: "240px" }}>
      <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-slate-300)" }} />
      <input
        type="text"
        className="input-field"
        style={{ paddingLeft: "36px" }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
