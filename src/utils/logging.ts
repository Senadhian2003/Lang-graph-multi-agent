export function formatToolCall(name: string, args: any, number?: number) {
  const timestamp = new Date().toISOString();
  const header = number ? `TOOL CALL #${number}` : 'TOOL CALL';
  const formattedLog = [
    "\n┌─────────────────────────────────────────────────────────────┐",
    `│ ${header} - ${timestamp} │`,
    "├─────────────────────────────────────────────────────────────┤",
    `│ Tool Name: ${name}`,
    "│ Arguments:",
    JSON.stringify(args, null, 2)
      .split('\n')
      .map(line => `│   ${line}`)
      .join('\n'),
    "└─────────────────────────────────────────────────────────────┘\n"
  ].join('\n');
  return formattedLog;
}
