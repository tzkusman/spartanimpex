import { createServer } from 'vite';

async function start() {
  // Primary server on 5173
  const server5173 = await createServer({
    configFile: './vite.config.js',
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
  });
  await server5173.listen();
  console.log('Spartan Impax running on: http://localhost:5173');

  // Fresh alternative server on 3000 (completely clean origin, zero service-worker cache)
  try {
    const server3000 = await createServer({
      configFile: './vite.config.js',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
    });
    await server3000.listen();
    console.log('Spartan Impax also running on clean port: http://localhost:3000');
  } catch (e) {
    console.log('Port 3000 optional listener:', e.message);
  }

  // Keep process alive indefinitely
  process.stdin.resume();
  setInterval(() => {}, 60000);
}

start().catch((err) => {
  console.error("Vite server error:", err);
  process.exit(1);
});
