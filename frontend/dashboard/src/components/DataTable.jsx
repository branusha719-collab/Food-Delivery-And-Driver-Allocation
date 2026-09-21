export default function DataTable({ columns, rows, total, page, pageSize, sort, dir, onSort, onPage, loading, error, empty = "Nothing matches these filters." }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="table-wrap">
      {error && <div className="alert" role="alert">{error.message}</div>}
      <div className="scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort === c.key;
                return (
                  <th key={c.key} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
                    {c.sortable && onSort ? (
                      <button className="th-btn" onClick={() => onSort(c.key)}>{c.label}<span aria-hidden="true">{active ? (dir === "asc" ? " ▲" : " ▼") : ""}</span></button>
                    ) : c.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody aria-busy={loading}>
            {rows.map((r, i) => (
              <tr key={r.id ?? i}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>
            ))}
            {!loading && !rows.length && !error && <tr><td colSpan={columns.length} className="empty">{empty}</td></tr>}
            {loading && !rows.length && <tr><td colSpan={columns.length} className="empty">Loading…</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <span>{total} result{total === 1 ? "" : "s"}</span>
        <div>
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
          <span className="page-num">Page {page} of {pages}</span>
          <button className="btn btn-ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
