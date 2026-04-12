export function normalizeProgramName(input?: string | null): string {
  return (input || '').trim();
}

export function programKey(input?: string | null): string {
  return normalizeProgramName(input).toLowerCase();
}

export function parseProgramNames(input?: string | null): string[] {
  if (!input) return [];

  const uniquePrograms = new Map<string, string>();

  input
    .split(',')
    .map((programName) => programName.trim())
    .filter(Boolean)
    .forEach((programName) => {
      const normalizedKey = programKey(programName);
      if (normalizedKey === 'unassigned') return;
      if (!uniquePrograms.has(normalizedKey)) {
        uniquePrograms.set(normalizedKey, normalizeProgramName(programName));
      }
    });

  return Array.from(uniquePrograms.values());
}
