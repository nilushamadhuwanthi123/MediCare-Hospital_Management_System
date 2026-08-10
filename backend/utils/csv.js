// Minimal dependency-free CSV converter. Good enough for admin export
// buttons — avoids pulling in an extra package for a simple job.
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

/**
 * Converts an array of flat objects into a CSV string.
 * @param {Array<Object>} rows
 * @param {Array<{key: string, label: string}>} columns
 */
const toCsv = (rows, columns) => {
  const header = columns.map((col) => escapeCsvValue(col.label)).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCsvValue(col.accessor ? col.accessor(row) : row[col.key])).join(","))
    .join("\n");
  return `${header}\n${body}`;
};

module.exports = { toCsv };
