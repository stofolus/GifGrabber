const path = require('path');
const os = require('os');

const archMap = {
    x32: 'ia32',
    x64: 'x64'
};

const platformMap = {
    darwin: 'mac',
    win32: 'win'
};

class BinaryHelper {
    static get FFMPEG() {
        return path.join(this._getBinaryFolder(), this._appendSuffix('ffmpeg'));
    }

    static get FFPROBE() {
        return path.join(this._getBinaryFolder(), this._appendSuffix('ffprobe'));
    }

    static _getPlatformFolder() {
        return `${platformMap[os.platform()]}-${archMap[os.arch()]}`;
    }

    static _getBinaryFolder() {
        return path.join(__dirname, '../binaries', this._getPlatformFolder());
    }

    static _appendSuffix(filename) {
        return (os.platform() === 'win32') ? `${filename}.exe` : filename;
    }
}

module.exports = BinaryHelper;
