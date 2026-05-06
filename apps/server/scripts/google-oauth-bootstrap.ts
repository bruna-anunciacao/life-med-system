/**
 * One-time bootstrap to obtain a Google OAuth refresh token for the dedicated
 * LifeMed Google account used by GoogleCalendarService.
 *
 * Usage:
 *   1. Create an OAuth 2.0 Client (type "Web application") in Google Cloud Console.
 *      Add `http://localhost:53682/oauth2callback` to the authorized redirect URIs.
 *   2. Export the credentials before running this script:
 *        export GOOGLE_CALENDAR_CLIENT_ID=...
 *        export GOOGLE_CALENDAR_CLIENT_SECRET=...
 *   3. Run from the server workspace:
 *        npx ts-node scripts/google-oauth-bootstrap.ts
 *   4. Sign in with the dedicated LifeMed Google account, accept the consent
 *      screen, and copy the printed refresh_token into apps/server/.env as
 *      GOOGLE_CALENDAR_REFRESH_TOKEN.
 */

import { createServer } from 'http';
import { URL } from 'url';
import { google } from 'googleapis';

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

async function main(): Promise<void> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      'Missing GOOGLE_CALENDAR_CLIENT_ID or GOOGLE_CALENDAR_CLIENT_SECRET env vars.',
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI,
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  console.log('\nOpen this URL in your browser and sign in:\n');
  console.log(authUrl);
  console.log(`\nWaiting for the OAuth callback on ${REDIRECT_URI}...\n`);

  const server = createServer(async (req, res) => {
    if (!req.url) return;

    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== '/oauth2callback') {
      res.writeHead(404).end('Not found');
      return;
    }

    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400).end(`OAuth error: ${error}`);
      console.error('OAuth error:', error);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400).end('Missing code');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      res
        .writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        .end(
          '<html><body><h1>OK</h1><p>You may close this tab and return to the terminal.</p></body></html>',
        );

      console.log('\n=== Google OAuth tokens ===');
      console.log(JSON.stringify(tokens, null, 2));

      if (tokens.refresh_token) {
        console.log('\nAdd this to apps/server/.env:');
        console.log(`GOOGLE_CALENDAR_REFRESH_TOKEN=${tokens.refresh_token}`);
      } else {
        console.warn(
          '\nNo refresh_token returned. Revoke the app at https://myaccount.google.com/permissions and run again with prompt=consent.',
        );
      }

      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Failed to exchange code for tokens:', err);
      res.writeHead(500).end('Token exchange failed');
      server.close();
      process.exit(1);
    }
  });

  server.listen(PORT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
