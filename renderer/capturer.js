const { desktopCapturer, ipcRenderer, remote } = require('electron');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const GifConverter = require('./gifconverter');

class Capturer {
    constructor() {
        this._stream;
        this._recorder;
        this.active = false;
        this._data;
        this._crop = {
            valid: true
        };

        ipcRenderer.on('CropWindowMoved', (event, cropWindow) => {
            this._crop = cropWindow;
        })
    }

    start() {
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: `screen:${this._crop.display.id}`,
                    maxWidth: this._crop.display.bounds.width,
                    maxHeight: this._crop.display.bounds.height
                }
            }
        })
        .then(stream => {
            this._stream = stream;
            this.active = true;
            this._data = [];
            this._recorder = new MediaRecorder(this._stream);
            this._recorder.ondataavailable = (event) => { this._storeData(event) };
            this._recorder.start();
            this._tempFile = path.join(remote.app.getPath('temp'), 'tmp.webm');
            this._desktop = remote.app.getPath('desktop');
        })
        .catch(error => {
            console.error(error);
        });
    }

    stop() {
        if(this._stream) {
            this._stream.getTracks()[0].stop();
            delete this._stream;
        }
        if(this._recorder) {
            this._recorder.stop();
            setTimeout(() => {
                this._getBuffer()
                    .then(buffer => {
                        fs.writeFileSync(this._tempFile, buffer);
                        GifConverter.convert(this._tempFile, path.join(this._desktop, this._getFileName()), this._crop)
                            .then(() => {
                                fs.unlinkSync(this._tempFile);
                            });
                    });
            }, 0);
        }
        this.active = false;
    }

    _storeData(event) {
        if (event.data && event.data.size > 0) {
            this._data.push(event.data);
        }
    }

    _getBuffer() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.addEventListener('loadend', (event) => {
                if(event.error) {
                    reject(event.error);
                } else {
                    resolve(Buffer.from(reader.result));
                }
            }, false);
            reader.readAsArrayBuffer(new Blob(this._data, {type: 'video/webm'}));
        });
    }

    _getFileName() {
        return `screenrec_${moment().format('YYYY-MM-DD_HH:mm:ss')}.gif`;
    }
}

module.exports = Capturer;
