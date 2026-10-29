import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const { verifyEmailConnection } = await import('../lib/emailSender.js');
const result = await verifyEmailConnection();
if (!result.ok) {
  process.stderr.write(`${result.error}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('Titan SMTP connection verified. No email was sent.\n');
}
