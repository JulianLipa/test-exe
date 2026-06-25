import { forwardRef } from "react";

const SearchBar = forwardRef(function SearchBar(
  { value, onChange, onSearch, placeholder, children },
  ref
) {
  return (
    <div className="flex items-center gap-4" style={{ flexWrap: "wrap" }}>
      <div className="flex items-center gap-2">
        <label style={{ color: "rgba(237,242,248,0.6)", fontSize: "0.85em" }}>
          Buscar:
        </label>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={placeholder || "N° contrato, ap. locador o locatario"}
          style={{ width: 220 }}
        />
        <button type="button" onClick={onSearch}>
          Buscar
        </button>
      </div>
      {children}
    </div>
  );
});

export default SearchBar;
