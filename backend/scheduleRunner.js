// scheduleRunner.js - Config-based schedule checker (DONE BY BERNISSA)
// Runs every minute via cron to check if kiosk should be running

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Config file location - admin panel writes to this
const CONFIG_PATH = '/home/admin-esg-rp/IIP_Kiosk_Project/backend/kiosk-schedules.json';
const LOG_PATH = '/home/admin-esg-rp/schedule-runner.log';

function log(message) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${message}\n`;
  console.log(logMsg.trim());
  
  try {
    fs.appendFileSync(LOG_PATH, logMsg);
  } catch (err) {
    console.error('Failed to write log:', err.message);
  }
}

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}

/**
 * Load schedules from JSON config file
 */
function loadSchedules() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      log('⚠️  Config file not found, creating empty schedules');
      return { schedules: [] };
    }
    
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    log(`❌ Error loading config: ${err.message}`);
    return { schedules: [] };
  }
}

/**
 * Check if current time matches a schedule
 */
function shouldKioskRunNow() {
  const config = loadSchedules();
  const now = new Date();
  
  // Get current time components
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // minutes since midnight
  
  const currentDayOfWeek = now.getDay() + 1; // 1=Sunday, 7=Saturday (MySQL format)
  const currentDate = now.toLocaleDateString('sv-SE'); //
  
  log(`🔍 Checking schedules at ${now.toLocaleTimeString()}`);
  
  // Check each active schedule
  for (const schedule of config.schedules || []) {
    if (!schedule.is_active) {
      continue; // Skip inactive schedules
    }
    
    // Parse start and end times
    const [startHour, startMin] = schedule.start_time.split(':').map(Number);
    const [endHour, endMin] = schedule.end_time.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Check if current time is within schedule window
    let inTimeWindow = false;
    
    if (endTime > startTime) {
      // Normal case: 09:00 - 17:00
      inTimeWindow = currentTime >= startTime && currentTime < endTime;
    } else {
      // Overnight case: 22:00 - 02:00
      inTimeWindow = currentTime >= startTime || currentTime < endTime;
    }
    
    if (!inTimeWindow) {
      continue;
    }
    
    // Check schedule type
    let matchesSchedule = false;
    
    if (schedule.schedule_type === 'daily') {
      matchesSchedule = true;
      
    } else if (schedule.schedule_type === 'weekly') {
      // days_of_week is comma-separated: "1,3,5" for Sun,Tue,Thu
      const activeDays = schedule.days_of_week?.split(',').map(Number) || [];
      matchesSchedule = activeDays.includes(currentDayOfWeek);
      
    } else if (schedule.schedule_type === 'specific_date') {
      matchesSchedule = schedule.specific_date === currentDate;
    }
    
    if (matchesSchedule) {
      log(`✅ Match found: "${schedule.schedule_name}" (${schedule.schedule_type})`);
      return true;
    }
  }
  
  log('❌ No matching schedules');
  return false;
}

// Main execution

async function main() {
  try {
    log('=== Schedule Runner Started ===');
    
    const shouldRun = shouldKioskRunNow();
    
    // Check current kiosk service state
    const isActive = await execCmd('systemctl is-active kiosk.service')
      .catch(() => 'inactive');
    
    log(`Current state: shouldRun=${shouldRun}, serviceActive=${isActive}`);
    
    if (shouldRun && isActive !== 'active') {
      await execCmd('sudo systemctl start kiosk.service');
      log('▶️ STARTED kiosk.service');
      
    } else if (!shouldRun && isActive === 'active') {
      await execCmd('sudo systemctl stop kiosk.service');
      log('⏹️ STOPPED kiosk.service');
      
    } else {
      log('ℹ️ No action needed');
    }
    
    log('=== Schedule Runner Complete ===\n');
    
  } catch (err) {
    log(`❌ Error: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

main();
