// PostToolUse hook: auto-format files edited by Claude Code.
// Reads the hook payload from stdin, and for .ts/.tsx/.js/.jsx files inside
// Ombor.Web runs eslint --fix then prettier --write. Always exits 0 —
// a formatter failure must never block the edit.
const path = require('path');
const { execSync } = require('child_process');

try {
  let input = '';
  process.stdin.on('data', (chunk) => (input += chunk));
  process.stdin.on('end', () => {
    try {
      const payload = JSON.parse(input);
      const filePath = payload && payload.tool_input && payload.tool_input.file_path;
      const isCode = typeof filePath === 'string' && /\.(ts|tsx|js|jsx)$/.test(filePath);
      if (!isCode || !filePath.replace(/\\/g, '/').includes('Ombor.Web')) {
        process.exit(0);
      }
      const repoRoot = path.resolve(__dirname, '..', '..');
      try {
        execSync(`npx eslint --fix "${filePath}"`, { cwd: repoRoot, stdio: 'ignore' });
      } catch (_) {
        /* never block the edit */
      }
      try {
        execSync(`npx prettier --write "${filePath}"`, { cwd: repoRoot, stdio: 'ignore' });
      } catch (_) {
        /* never block the edit */
      }
    } catch (_) {
      /* never block the edit */
    }
    process.exit(0);
  });
} catch (_) {
  process.exit(0);
}
