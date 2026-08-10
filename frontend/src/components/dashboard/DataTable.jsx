import { ChevronLeft, ChevronRight } from "lucide-react";
import Spinner from "../common/Spinner";
import EmptyState from "../common/EmptyState";
import { Inbox } from "lucide-react";

/**
 * Shared table used across every list page. Optionally renders a
 * Prev/Next pagination footer when a `pagination` prop is supplied —
 * pass { page, totalPages, total, onPageChange } from a list endpoint's
 * response ({ page, totalPages, total, data }) to wire it up.
 */
const DataTable = ({ columns, data, loading, emptyMessage = "No records found", pagination }) => {
  if (loading) {
    return (
      <div className="card" style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <Spinner />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={Inbox} title="Nothing here yet" description={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid var(--color-border)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "14px 20px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-slate-600)",
                  whiteSpace: "nowrap",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              style={{
                borderBottom: i < data.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: "14px 20px", fontSize: "14px", color: "var(--color-slate-900)" }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--color-slate-600)" }}>
            Page {pagination.page} of {pagination.totalPages} {pagination.total ? `· ${pagination.total} total` : ""}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
