import { ChartSerie } from '../Chart/ChartSerie';

/**
 * Resolves display names for chart series, adding test names when there are conflicts.
 *
 * Logic:
 * - When there are no channel name conflicts: show just the channel name (e.g., "Voltage")
 * - When ANY conflict exists (same channel name from different tests):
 *   append test name to ALL series in the chart (e.g., "Voltage (test2)", "Frequency (test2)", "Voltage (test3)")
 *
 * @param channels - Record of channelKey (format: "filePath::channelId") to ChartSerie
 * @returns Array of ChartSerie with potentially modified names
 */
export function resolveSeriesDisplayNames(channels: Record<string, ChartSerie>): ChartSerie[] {
  const entries = Object.entries(channels);

  // Extract test names from channel keys and group by base serie name
  const channelMetadata = entries.map(([channelKey, serie]) => {
    const testName = extractTestName(channelKey);
    return { channelKey, serie, testName };
  });

  // Group channels by their base name (serie.name)
  const nameGroups = new Map<string, typeof channelMetadata>();
  for (const metadata of channelMetadata) {
    const baseName = metadata.serie.name;
    if (!nameGroups.has(baseName)) {
      nameGroups.set(baseName, []);
    }
    nameGroups.get(baseName)!.push(metadata);
  }

  // Check if ANY name has conflicts
  let hasAnyConflict = false;
  for (const group of nameGroups.values()) {
    if (group.length > 1) {
      hasAnyConflict = true;
      break;
    }
  }

  // Build the result with modified names
  return channelMetadata.map(({ serie, testName }) => {
    const baseName = serie.name;

    if (hasAnyConflict) {
      // ANY conflict detected, append test name to ALL series
      return {
        ...serie,
        name: `${baseName} (${testName})`,
      };
    }

    // No conflicts at all, use the base name
    return serie;
  });
}

/**
 * Extracts the test name from a channel key.
 * Channel key format: "filePath::channelId"
 * Example: "/path/to/test2.json::V" -> "test2"
 */
function extractTestName(channelKey: string): string {
  const [filePath] = channelKey.split('::');
  // Extract filename without extension from the file path
  const fileName =
    filePath
      .split(/[\\/]/)
      .pop()
      ?.replace(/\.[^/.]+$/, '') || filePath;

  return fileName;
}
