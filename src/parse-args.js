/**
 * Minimal argument parser. No external dependencies.
 *
 * Parses argv into { command, _: [positionals], ...flags }
 * Supports --key value, --key=value, --bool, -v
 */
function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] && !args[0].startsWith('-') ? args.shift() : null;
  const result = { command, _: [] };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const eqIndex = arg.indexOf('=');
      if (eqIndex !== -1) {
        result[arg.slice(2, eqIndex)] = arg.slice(eqIndex + 1);
      } else {
        const next = args[i + 1];
        if (next && !next.startsWith('-')) {
          result[arg.slice(2)] = next;
          i++;
        } else {
          result[arg.slice(2)] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      result[arg.slice(1)] = true;
    } else {
      result._.push(arg);
    }
  }

  return result;
}

module.exports = { parseArgs };
