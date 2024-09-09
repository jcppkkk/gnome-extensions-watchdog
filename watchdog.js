const { exec } = require('child_process');
const { spawn } = require('child_process');

// Monitor login1's gdbus events
const gdbus = spawn('gdbus', ['monitor', '-y', '-d', 'org.freedesktop.login1']);

gdbus.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('LockedHint') && output.includes('<false>')) {
    console.log('Login event detected, reloading user extensions...');

    // Execute commands to reload user extensions
    exec('gsettings set org.gnome.shell disable-user-extensions true', (err, stdout, stderr) => {
      if (err) {
        console.error(`Command execution failed: ${err}`);
        return;
      }
      exec('gsettings set org.gnome.shell disable-user-extensions false', (err, stdout, stderr) => {
        if (err) {
          console.error(`Command execution failed: ${err}`);
          return;
        }
        console.log('User extensions reloaded');
      });
    });
  }
});

gdbus.stderr.on('data', (data) => {
  console.error(`gdbus error: ${data}`);
});

gdbus.on('close', (code) => {
  console.log(`gdbus process exited with code: ${code}`);
});
