"use client";
import { useState } from "react";
import JournalFilter from "./JournalFilter";
import JournalResults from "./JournalResults";

export default function JournalsPage() {
  const [primaryField, setPrimaryField] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>(null);
  const [csvData, setCsvData] = useState<string>("");

  return (
    <main className="max-w-3xl mx-auto p-4">
      {!primaryField ? (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">Select your primary field</h1>
          <button className="btn" onClick={() => setPrimaryField("Computer Science")}>Computer Science</button>
          <button className="btn" onClick={() => setPrimaryField("Economics / Finance")}>Economics / Finance</button>
        </div>
      ) : !csvData ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Upload Scimago CSV</h2>
            <input type="file" accept=".csv" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = evt => {
                if (typeof evt.target?.result === "string") {
                  setCsvData(evt.target.result);
                }
              };
              reader.readAsText(file);
            }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Or select a public Scimago CSV</h2>
            <button
              className="btn"
              onClick={async () => {
                const res = await fetch("/scimagojr%202024%20%20Subject%20Area%20-%20Computer%20Science.csv");
                const text = await res.text();
                setCsvData(text);
              }}
            >
              Load Computer Science CSV
            </button>
            <button
              className="btn"
              onClick={async () => {
                const res = await fetch("/scimagojr_2024_Subject_Area_Economics,_Econometrics_and_Finance.csv");
                const text = await res.text();
                setCsvData(text);
              }}
            >
              Load Economics / Finance CSV
            </button>
          </div>
        </div>
      ) : !filters ? (
        <JournalFilter
          csvData={csvData}
          onSubmitAction={setFilters}
          primaryField={primaryField}
        />
      ) : (
        <JournalResults
          csvData={csvData}
          filters={filters}
        />
      )}
    </main>
  );
}
