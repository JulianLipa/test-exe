import { useState } from "react";
import { alquilerMatchesQuery } from "../utils/search.js";

export function useContratoSearch(fetchRecords) {
  const [searchInput, setSearchInput] = useState("");
  const [contratos, setContratos]     = useState([]);
  const [searched, setSearched]       = useState(false);
  const [selected, setSelected]       = useState(null);
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(false);

  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;
    setLoading(true);
    setSelected(null);
    setRecords([]);
    try {
      const db = await window.store.loadDB();
      const matches = (db ?? []).filter((a) => alquilerMatchesQuery(a, query));
      setContratos(matches);
      setSearched(true);
      if (/^\d+$/.test(query) && matches.length === 1) {
        const r = await fetchRecords(String(matches[0].id));
        setSelected(matches[0]);
        setRecords(r ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (alquiler) => {
    setSelected(alquiler);
    setLoading(true);
    try {
      const r = await fetchRecords(String(alquiler.id));
      setRecords(r ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelected(null);
    setRecords([]);
  };

  return {
    searchInput, setSearchInput,
    contratos, searched,
    selected, records, loading,
    handleSearch, handleSelect, clearSelection,
  };
}
