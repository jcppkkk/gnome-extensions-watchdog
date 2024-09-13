require('console-stamp')(console, {
  format: ':date(yyyy/mm/dd HH:MM:ss.l)',
});

console.log('Starting GNOME Shell Extensions Watchdog...');

const { exec, execSync, spawn } = require('child_process');

// Wait for specified seconds
const wait = (seconds) => execSync(`sleep ${seconds}`);

// Execute command and get output
const executeCommand = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(`Command execution failed: ${err}`);
      } else {
        resolve(stdout.trim().split('\n'));
      }
    });
  });

// Execute command without caring for output
const executeCommandNoOutput = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(`Command execution failed: ${err}`);
      } else {
        resolve();
      }
    });
  });

// Compare two extension lists
const compareExtensions = (disabledExtensions, inactiveExtensions) => {
  if (disabledExtensions.length !== inactiveExtensions.length) {
    return false;
  }
  return disabledExtensions.every((ext) => inactiveExtensions.includes(ext));
};

// Reload user extensions
const reloadUserExtensions = async () => {
  try {
    await executeCommandNoOutput('gsettings set org.gnome.shell disable-user-extensions true');
    await executeCommandNoOutput('gsettings set org.gnome.shell disable-user-extensions false');
    console.log('User extensions reloaded');
  } catch (error) {
    console.error(error);
  }
};

// Handle gdbus event
const handleGdbusEvent = async (data) => {
  const output = data.toString();
  if (output.includes('org.freedesktop.login1.Session.Unlock')) {
    console.log('Login event detected, checking extensions...');
    wait(0.5);

    try {
      const disabledExtensions = await executeCommand('gnome-extensions list --disabled');
      const inactiveExtensions = await executeCommand('gnome-extensions list --inactive');
      if (compareExtensions(disabledExtensions, inactiveExtensions)) {
        console.log('Extensions match, no action taken.');
      } else {
        await reloadUserExtensions();
        console.log('Extensions do not match, reloaded user extensions.');
      }
    } catch (error) {
      console.error(error);
    }
  }
};

// Monitor gdbus events
const monitorGdbusEvents = () => {
  const gdbus = spawn('gdbus', ['monitor', '-y', '-d', 'org.freedesktop.login1']);

  gdbus.stdout.on('data', handleGdbusEvent);

  gdbus.stderr.on('data', (data) => {
    console.error(`gdbus error: ${data}`);
  });

  gdbus.on('close', (code) => {
    console.log(`gdbus process exited with code: ${code}`);
  });
};

// Start monitoring
monitorGdbusEvents();
