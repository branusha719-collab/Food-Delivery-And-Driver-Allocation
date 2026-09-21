import { useState } from "react";
// Shared paging / sorting / filter state for admin tables. Changing a filter resets to page 1.
export function useTable(initial = {}) {
  const [state, setState] = useState({ page: 1, pageSize: 10, sort: "", dir: "asc", ...initial });
  const setFilter = (key, value) => setState((s) => ({ ...s, [key]: value, page: 1 }));
  const setPage = (page) => setState((s) => ({ ...s, page }));
  const toggleSort = (key) => setState((s) => ({ ...s, sort: key, dir: s.sort === key && s.dir === "asc" ? "desc" : "asc", page: 1 }));
  return { state, setFilter, setPage, toggleSort };
}
