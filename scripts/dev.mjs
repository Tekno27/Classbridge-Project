import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

// On Windows, npm resolves to npm.cmd which requires a shell to spawn.
// Newer Node versions throw EINVAL when spawning .cmd files without shell: true.
const spawnOptions = {
  stdio: 'inherit',
  shell: isWindows,
};

const backend = spawn('npm', ['run', 'dev:server'], spawnOptions);

const frontend = spawn('npm', ['run', 'dev:client'], spawnOptions);

const stopAll = (signal = 'SIGTERM') => {
  backend.kill(signal);
  frontend.kill(signal);
};

process.on('SIGINT', () => {
  stopAll('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
  process.exit(0);
});

backend.on('exit', (code) => {
  if (code && code !== 0) {
    stopAll('SIGTERM');
    process.exit(code);
  }
});

frontend.on('exit', (code) => {
  if (code && code !== 0) {
    stopAll('SIGTERM');
    process.exit(code);
  }
});
