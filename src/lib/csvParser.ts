import Papa from 'papaparse';

export interface CsvGateRow {
  gate: string;
  density: number;
  arrival_rate: number;
  wait_time: number;
}

export function parseCsvFile(
  file: File,
  onSuccess: (data: CsvGateRow[]) => void,
  onError: (errors: string[]) => void,
) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data as Record<string, string>[];
      const parsedGates: CsvGateRow[] = [];
      const parseErrors: string[] = [];

      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const required = ['gate', 'density', 'arrival_rate', 'wait_time'];
        const missing = required.filter((h) => !headers.includes(h));

        if (missing.length > 0) {
          onError([`Invalid CSV columns. Missing required headers: ${missing.join(', ')}`]);
          return;
        }
      } else {
        onError(['The uploaded CSV is empty.']);
        return;
      }

      data.forEach((row: Record<string, string>, index) => {
        const lineNum = index + 2; // header is line 1
        const gateName = row.gate?.trim();
        const density = parseInt(row.density, 10);
        const arrivalRate = parseInt(row.arrival_rate, 10);
        const waitTime = parseInt(row.wait_time, 10);

        if (!gateName) {
          parseErrors.push(`Row ${lineNum}: 'gate' name is blank.`);
        }
        if (Number.isNaN(density) || density < 0 || density > 100) {
          parseErrors.push(
            `Row ${lineNum}: 'density' must be a number between 0 and 100 (got "${row.density}").`,
          );
        }
        if (Number.isNaN(arrivalRate) || arrivalRate < 0) {
          parseErrors.push(
            `Row ${lineNum}: 'arrival_rate' must be a positive number (got "${row.arrival_rate}").`,
          );
        }
        if (Number.isNaN(waitTime) || waitTime < 0) {
          parseErrors.push(
            `Row ${lineNum}: 'wait_time' must be a positive number (got "${row.wait_time}").`,
          );
        }

        if (parseErrors.length === 0) {
          parsedGates.push({
            gate: gateName.startsWith('Gate') ? gateName : `Gate ${gateName}`,
            density,
            arrival_rate: arrivalRate,
            wait_time: waitTime,
          });
        }
      });

      if (parseErrors.length > 0) {
        onError(parseErrors);
      } else {
        onSuccess(parsedGates);
      }
    },
    error: (error) => {
      onError([`CSV parsing failed: ${error.message}`]);
    },
  });
}
