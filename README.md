# GNOME Extensions Watchdog

This project provides a daemon to monitor login events from the lock screen to the desktop on GNOME. When a login event is detected, it reloads the user extensions using `gsettings`.

## Prerequisites

- Node.js and npm installed
- `pm2` installed globally

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/jcppkkk/gnome-extensions-watchdog.git
   cd gnome-extensions-watchdog
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Install `pm2` globally if you haven't already:
   ```sh
   npm install -g pm2
   ```

## Usage

1. Start the daemon using `pm2`:

   ```sh
   pm2 start watchdog.js --name gnome-extensions-watchdog
   ```

2. Set up `pm2` to start on system boot:

   ```sh
   pm2 startup
   ```

   Follow the instructions provided by the command to enable the startup script.

3. Save the current process list:
   ```sh
   pm2 save
   ```

## How It Works

- The script `watchdog.js` uses `gdbus` to monitor login events from the lock screen to the desktop.
- When a login event is detected, it executes the following commands to reload the user extensions:
  ```sh
  gsettings set org.gnome.shell disable-user-extensions true
  gsettings set org.gnome.shell disable-user-extensions false
  ```

## Configuration

You can customize the script as needed by editing `watchdog.js`.

## Contributing

Feel free to submit issues or pull requests. Contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
