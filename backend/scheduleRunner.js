// scheduleRunner.js
require('dotenv').config();
const db = require('./db');
const { exec } = require('child_process');

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}

/**
 * Returns true if kiosk should be running NOW based on server_schedules.
 * Rules:
 * - is_active = 1
 * - schedule applies today (daily/weekly/specific_date)
 * - TIME(NOW()) between start_time (inclusive) and end_time (exclusive)
 */

function shouldKioskRunNow() {
  const query = `
    SELECT COUNT(*) AS matches
    FROM server_schedules
    WHERE is_active = 1
      AND (
        schedule_type='daily'
        OR (schedule_type='weekly' AND FIND_IN_SET(DAYOFWEEK(NOW()), days_of_week))
        OR (schedule_type='specific_date' AND specific_date = CURDATE())
      )
      AND TIME(NOW()) >= start_time
      AND TIME(NOW()) < end_time
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve((rows?.[0]?.matches || 0) > 0);
    });
  });
}

async function main() {
  try {
    const shouldRun = await shouldKioskRunNow();

    // check current kiosk service state
    const isActive = await execCmd('systemctl is-active kiosk.service').catch(() => 'inactive');

    if (shouldRun && isActive !== 'active') {
      await execCmd('sudo systemctl start kiosk.service');
      console.log('▶️ Started kiosk.service (schedule matched)');
    } else if (!shouldRun && isActive === 'active') {
      await execCmd('sudo systemctl stop kiosk.service');
      console.log('⏹️ Stopped kiosk.service (no schedule matched)');
    } else {
      console.log(`ℹ️ No change. shouldRun=${shouldRun}, current=${isActive}`);
    }
  } catch (e) {
    console.error('❌ scheduleRunner error:', e);
  } finally {
    // Added db.end(); to end db pool for cleaner exit.
    db.end();
    process.exit(0);
  }
}

main();
