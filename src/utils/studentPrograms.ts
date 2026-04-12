export function parseProgramNames(input?: string | null): string[] {
  if (!input) return [];

  const uniquePrograms = new Map<string, string>();

  input
    .split(',')
    .map((programName) => programName.trim())
    .filter(Boolean)
    .forEach((programName) => {
      const normalizedKey = programName.toLowerCase();
      if (normalizedKey === 'unassigned') return;
      if (!uniquePrograms.has(normalizedKey)) {
        uniquePrograms.set(normalizedKey, programName);
      }
    });

  return Array.from(uniquePrograms.values());
}
