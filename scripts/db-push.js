const { execSync } = require('child_process');

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL found, running migrations...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
} else {
  console.log('No DATABASE_URL, skipping database setup');
}
