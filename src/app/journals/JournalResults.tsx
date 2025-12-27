"use client";
import { useMemo, useState } from "react";

function parseCSV(csv: string) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(";");
  return lines.slice(1).map(line => {
    const row = line.split(";");
    const obj: any = {};
    header.forEach((h, i) => {
      obj[h.trim()] = row[i]?.trim();
    });
    return obj;
  });
}

function normalize(j: any) {
  return {
    title: j["Title"],
    sjr: parseFloat(j["SJR"].replace(",", ".")),
    quartile: j["SJR Best Quartile"],
    citationsPerDoc: parseFloat(j["Citations / Doc. (2years)"].replace(",", ".")),
    refsPerDoc: parseFloat(j["Ref. / Doc."].replace(",", ".")),
    totalDocs: parseInt(j["Total Docs. (2024)"]),
    subjectAreas: j["Areas"]?.split(",").map((s: string) => s.trim()),
    openAccess: j["Open Access"]?.toLowerCase() === "yes" || j["Open Access"]?.toLowerCase() === "true",
  };
}

function autoEliminate(j: any) {
  return (
    j.citationsPerDoc === 0 ||
    j.refsPerDoc < 10 ||
    j.totalDocs < 15
  );
}

function applyFilters(journals: any[], filters: any) {
  return journals.filter(j =>
    j.quartile === filters.quartile &&
    j.citationsPerDoc > filters.citations &&
    (filters.selectedSubjects.length === 0 || j.subjectAreas?.some((s: string) => filters.selectedSubjects.includes(s))) &&
    (filters.openAccess === "any" || j.openAccess === (filters.openAccess === "true"))
  );
}

export interface JournalResultsProps {
  csvData: string;
  filters: any;
}

export default function JournalResults({ csvData, filters }: JournalResultsProps) {
  const [exporting, setExporting] = useState(false);
  const [sortKey, setSortKey] = useState("sjr");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allJournals = useMemo(() => {
    const parsed = parseCSV(csvData).map(normalize).filter(j => !autoEliminate(j));
    const filtered = applyFilters(parsed, filters);
    const sorted = [...filtered].sort((a, b) => {
      let vA = a[sortKey], vB = b[sortKey];
      if (typeof vA === "string" && typeof vB === "string") {
        vA = vA.toLowerCase();
        vB = vB.toLowerCase();
      }
      if (vA < vB) return sortDir === "asc" ? -1 : 1;
      if (vA > vB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [csvData, filters, sortKey, sortDir]);
  const journals = allJournals.slice(0, 100);

  function exportCSV(journalsToExport: any[], filename: string) {
    setExporting(true);
    const header = ["Journal Title","SJR","Quartile","Citations / Doc","Total Docs (2024)","Subject Areas","Open Access"];
    const rows = journalsToExport.map(j => [j.title, j.sjr, j.quartile, j.citationsPerDoc, j.totalDocs, j.subjectAreas?.join(" | "), j.openAccess ? "Yes" : "No"]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  }

  const columns = [
    { key: "title", label: "Journal Title" },
    { key: "sjr", label: "SJR" },
    { key: "quartile", label: "Quartile" },
    { key: "citationsPerDoc", label: "Citations / Doc" },
    { key: "totalDocs", label: "Total Docs (2024)" },
    { key: "subjectAreas", label: "Subject Areas" },
    { key: "openAccess", label: "Open Access" },
  ];

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Results (Top 100)</h2>
      <div className="flex gap-4 mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          onClick={() => exportCSV(journals, "filtered_journals_top100.csv")}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export Top 100 CSV"}
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          onClick={() => exportCSV(allJournals, "filtered_journals_full.csv")}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export Full CSV"}
        </button>
      </div>
      <div className="overflow-x-auto max-h-[70vh] rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-blue-50 z-10">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="cursor-pointer select-none px-3 py-2 border-b font-semibold text-blue-800 text-left"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span> {sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {journals.map((j, i) => (
              <tr key={i} className="hover:bg-blue-100 transition rounded">
                <td className="px-3 py-2 text-black">{j.title}</td>
                <td className="px-3 py-2 text-black">{j.sjr}</td>
                <td className="px-3 py-2 text-black">{j.quartile}</td>
                <td className="px-3 py-2 text-black">{j.citationsPerDoc}</td>
                <td className="px-3 py-2 text-black">{j.totalDocs}</td>
                <td className="px-3 py-2 text-black">{j.subjectAreas?.join(" | ")}</td>
                <td className="px-3 py-2 text-black">{j.openAccess ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
