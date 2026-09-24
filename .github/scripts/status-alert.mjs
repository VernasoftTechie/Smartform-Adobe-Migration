// Builds an alert email when a push adds a CLIENT action to a migration's
// status file (concern, problem, question, change request, confirmation,
// stop, resume). Entries written by the engineer never trigger an alert.
// Writes mail.eml and sets the workflow output `send=true` when there is
// something to send. The workflow sends it with curl.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const { BEFORE = '', AFTER = '', REPO = '', BRANCH = '', MAIL_TO = '', MAIL_FROM = '', OUT = 'mail.eml' } = process.env;
const CLIENT_HEADINGS = new Set([
  'Concern raised',
  'Problem reported',
  'Question',
  'Change requested',
  'Manual activity confirmed',
  'Stop requested',
  'Resumed',
]);

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const show = (sha, file) => {
  try {
    return git('show', `${sha}:${file}`);
  } catch {
    return '';
  }
};
const entries = (text) => {
  const body = text.split(/\r?\n---\r?\n/).slice(1).join('\n---\n');
  return body
    .split(/\r?\n(?=## )/)
    .filter((b) => b.startsWith('## '))
    .map((b) => {
      const m = /^## (\S+) — ([^\r\n]+)\r?\n?([\s\S]*)$/.exec(b);
      return m ? { at: m[1], heading: m[2].trim(), text: m[3].trim() } : null;
    })
    .filter(Boolean);
};
const field = (text, key) => (new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(text) || [])[1]?.trim() || '';

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  console.log(`${name}=${value}`);
}

if (!BEFORE || /^0+$/.test(BEFORE)) {
  console.log('New branch or unknown previous commit - nothing to compare.');
  setOutput('send', 'false');
  process.exit(0);
}

let files = [];
try {
  files = git('diff', '--name-only', BEFORE, AFTER, '--', 'docs/legacy_grab/').split(/\r?\n/).filter((f) => f.endsWith('_status.md'));
} catch (e) {
  console.log(`Could not diff ${BEFORE}..${AFTER}: ${e.message}`);
  setOutput('send', 'false');
  process.exit(0);
}

const alerts = [];
for (const file of files) {
  const oldText = show(BEFORE, file);
  const newText = show(AFTER, file);
  const fresh = entries(newText).slice(entries(oldText).length).filter((e) => CLIENT_HEADINGS.has(e.heading));
  if (!fresh.length) continue;
  alerts.push({
    file,
    title: (/^# Migration Status — (.+)$/m.exec(newText) || [])[1] || file,
    status: field(newText, 'STATUS'),
    waitingOn: field(newText, 'WAITING_ON'),
    claimedBy: field(newText, 'CLAIMED_BY'),
    stop: field(newText, 'STOP'),
    fresh,
  });
}

if (!alerts.length) {
  console.log('No new client action in this push - no alert.');
  setOutput('send', 'false');
  process.exit(0);
}

const link = (file) => `https://github.com/${REPO}/blob/${BRANCH}/${file}`;
const first = alerts[0];
const headings = [...new Set(first.fresh.map((e) => e.heading))].join(' / ');
const subject = `[Bolt] ${first.title}: ${headings}`;
const body = alerts
  .map((a) =>
    [
      `Migration : ${a.title}`,
      `Branch    : ${BRANCH}`,
      `Status    : ${a.status}   Waiting on: ${a.waitingOn}   Stop: ${a.stop}   Claimed by: ${a.claimedBy}`,
      '',
      ...a.fresh.map((e) => `${e.at}  ${e.heading}\n${e.text || '(no message)'}\n`),
      `Status file: ${link(a.file)}`,
    ].join('\n'),
  )
  .join('\n\n----------------------------------------\n\n');
const footer =
  '\n\nNext step: open a Claude window, run the queue tool, and ask it to check this branch. Nothing continues until a window reads the status file.\n';

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
const from = MAIL_FROM || MAIL_TO;
const mail = [
  `From: Bolt Alerts <${from}>`,
  `To: ${MAIL_TO}`,
  `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
  `Date: ${new Date().toUTCString()}`,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: base64',
  '',
  b64(body + footer),
  '',
].join('\r\n');

fs.writeFileSync(OUT, mail);
console.log(`Alert for ${alerts.length} migration(s): ${subject}`);
setOutput('send', 'true');
setOutput('from', from);
