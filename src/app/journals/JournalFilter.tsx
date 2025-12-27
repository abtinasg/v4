"use client";
import { useState, useMemo } from "react";

const parseSubjects = (csvData: string) => {
  const lines = csvData.split("\n");
  const header = lines[0].split(";");
  const areaIdx = header.findIndex(h => h.toLowerCase().includes("areas"));
  const subjects = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(";");
    if (row[areaIdx]) {
      row[areaIdx].split(",").forEach(s => subjects.add(s.trim()));
    }
  }
  return Array.from(subjects).filter(Boolean).sort();
};

export interface JournalFilterProps {
  csvData: string;
  onSubmitAction: (filters: any) => void;
  primaryField: string;
}

export default function JournalFilter({ csvData, onSubmitAction, primaryField }: JournalFilterProps) {
  const subjects = useMemo(() => parseSubjects(csvData), [csvData]);
  const [quartile, setQuartile] = useState("Q4");
  const [citations, setCitations] = useState(0.01);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [openAccess, setOpenAccess] = useState("any");
  const [subjectSearch, setSubjectSearch] = useState("");

  // Filtered subjects for search
  const filteredSubjects = useMemo(() =>
    subjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())),
    [subjects, subjectSearch]
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border max-w-2xl mx-auto">
      <form className="space-y-6" onSubmit={e => {
        e.preventDefault();
        onSubmitAction({ quartile, citations, selectedSubjects, openAccess });
      }}>
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Journal Filters</h2>
        <div className="flex flex-wrap gap-6">
          <div className="min-w-[120px]">
            <label className="block font-semibold mb-1 text-black">Quartile</label>
            <select value={quartile} onChange={e => setQuartile(e.target.value)} className="w-full px-2 py-1 rounded border focus:outline-blue-400">
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="block font-semibold mb-1 text-black">Min Citations / Doc</label>
            <input type="number" step="0.01" min="0" value={citations} onChange={e => setCitations(Number(e.target.value))} className="w-full px-2 py-1 rounded border focus:outline-blue-400" />
          </div>
          <div className="min-w-[120px]">
            <label className="block font-semibold mb-1 text-black">Open Access</label>
            <select value={openAccess} onChange={e => setOpenAccess(e.target.value)} className="w-full px-2 py-1 rounded border focus:outline-blue-400">
              <option value="any">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-black">Subject Areas</label>
          <input
            type="text"
            placeholder="Search subjects..."
            value={subjectSearch}
            onChange={e => setSubjectSearch(e.target.value)}
            className="mb-2 px-2 py-1 border rounded w-full focus:outline-blue-400"
          />
          <div className="max-h-40 overflow-y-auto border rounded bg-gray-50">
            {filteredSubjects.map(s => (
              <label key={s} className="block px-2 py-1 cursor-pointer hover:bg-blue-100 rounded">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(s)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedSubjects([...selectedSubjects, s]);
                    } else {
                      setSelectedSubjects(selectedSubjects.filter(sub => sub !== s));
                    }
                  }}
                  className="accent-blue-600"
                />
                <span className="ml-2 text-black">{s}</span>
              </label>
            ))}
          </div>
          {selectedSubjects.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              Selected: {selectedSubjects.join(", ")}
              <button
                type="button"
                className="ml-2 text-red-500 underline"
                onClick={() => setSelectedSubjects([])}
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition" type="submit">Apply Filters</button>
      </form>
    </div>
  );
}
