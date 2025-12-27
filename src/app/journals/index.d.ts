// TypeScript module declarations for CSV-based journal filter components

declare module "./JournalFilter" {
  import { FC } from "react";
  export interface JournalFilterProps {
    csvData: string;
    onSubmitAction: (filters: any) => void;
    primaryField: string;
  }
  const JournalFilter: FC<JournalFilterProps>;
  export default JournalFilter;
}

declare module "./JournalResults" {
  import { FC } from "react";
  export interface JournalResultsProps {
    csvData: string;
    filters: any;
  }
  const JournalResults: FC<JournalResultsProps>;
  export default JournalResults;
}
