export function parseTimestampDate(timestamp: string): string {
  const dateObj = new Date(timestamp);

  // Extract date components
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(dateObj.getDate()).padStart(2, "0");

  // Return date and time separately

  return `${day}-${month}-${year}`;
}

export function parseTimestampTime(timestamp: string): string {
  const dateObj = new Date(timestamp);
  // Extract time components
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function handleQuarantine<T extends HTMLElement>(
  e: React.MouseEvent<T>,
  file: string
) {
  e.stopPropagation();
  console.log("quarantine this file", file);
}

export function handleRemove<T extends HTMLElement>(
  e: React.MouseEvent<T>,
  file: string
) {
  e.stopPropagation();
  console.log("quarantine this file", file);
}

type PathMapping = Record<string, string>;

export function mapThreatFiles(
  threatFiles: string[],
  pathMapping: PathMapping
): string[] {
  return threatFiles
    .map((filePath: string) => {
      // Normalize the input to handle different case styles
      const normalizedPath = filePath.toString().replace(/\\\\/g, "\\").toLowerCase();

      // Extract UUID and file part
      const match = normalizedPath.match(/\\vboxsvr\\share\\([^\\]+)\\(.+)/);
      if (!match) {
        return null; // Return null for unmatched paths
      }

      const [, uuid, fileName] = match;

      // Map UUID to corresponding path
      const basePath = pathMapping[uuid];
      if (!basePath) {
        return null; // Return null if UUID isn't in the mapping
      }

      console.log(`${basePath}\\${fileName}`);

      // Return the full mapped path
      return `${basePath}\\${fileName}`;
    })
    .filter((path): path is string => path !== null); // Filter out null values
}
