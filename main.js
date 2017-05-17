const electron = require('electron');
const {app, BrowserWindow, ipcMain} = require('electron');

const path = require('path');
const url = require('url');
let screen;

let mainWindow;
let cropWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 150,
        height: 150,
        acceptFirstMouse: true,
        titleBarStyle: 'hidden',
    });
    // mainWindow.webContents.openDevTools();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.on('closed', function() {
        if(cropWindow) {
            cropWindow.destroy();
        }
        cropWindow = undefined;
        mainWindow = undefined;
    })
}
app.on('ready', () => {
    createWindow();
});
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', function() {
    if (mainWindow === undefined) {
        createWindow()
    }
})

ipcMain.on('openCropWindow', () => {
    if (cropWindow !== undefined) {
        return;
    }
    cropWindow = new BrowserWindow({
        height: 400,
        width: 400,
        frame: false,
        transparent: true,
        focusable: false,
        alwaysOnTop: true
    });

    // cropWindow.webContents.openDevTools();

    cropWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'renderer/crop/crop.html'),
        protocol: 'file:',
        slashes: true
    }));

    cropWindow.on('move', () => {
        sendCropWindow();
    });

    cropWindow.on('resize', () => {
        sendCropWindow();
    });

    sendCropWindow();
});

ipcMain.on('RecordingStarted', () => {
    cropWindow.setResizable(false);
    cropWindow.setMovable(false);
    cropWindow.setIgnoreMouseEvents(true);
    cropWindow.webContents.send('RecordingStarted');
});

ipcMain.on('RecordingStopped', () => {
    cropWindow.destroy();
    cropWindow = undefined;
});

function sendCropWindow() {
    const position = cropWindow.getPosition();
    const size = cropWindow.getSize();
    const topBorderWidth = ((position[1] % 2) === 0) ? 4 : 3;
    const displays = electron.screen.getAllDisplays();
    const currentDisplay = displays.find(display => {
        return (position[0] >= display.bounds.x
        && position[0] + size[0] <= display.bounds.x + display.bounds.width
        && position[1] >= display.bounds.y
        && position[1] + size[1] <= display.bounds.y + display.bounds.height);
    });

    if(currentDisplay) {
        mainWindow.webContents.send('CropWindowMoved', {
            position: [(position[0] - currentDisplay.bounds.x) + 3,
                (position[1] - currentDisplay.bounds.y) + topBorderWidth],
            size: [size[0] - 6, size[1] - (3 + topBorderWidth)],
            valid: true,
            display: currentDisplay
        });

        cropWindow.webContents.send('CropWindowMoved', {
            valid: true
        });
    } else {
        mainWindow.webContents.send('CropWindowMoved', {
            valid: false
        });

        cropWindow.webContents.send('CropWindowMoved', {
            valid: false
        });
    }


}
