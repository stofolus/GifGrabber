const { ipcRenderer} = require('electron');
const Capturer = require('./capturer');

const capturer = new Capturer();
const app = new Vue({
    el: '.app',
    data: {
        capturer,
        isCropWindowOpen: false,
    },
    methods: {
        openCropWindow: () => {
            ipcRenderer.send('openCropWindow');
            app.isCropWindowOpen = true;
        },
        startRecording: () => {
            if(capturer._crop.valid) {
                capturer.start();
                ipcRenderer.send('RecordingStarted');
            }
        },
        stopRecording: () => {
            ipcRenderer.send('RecordingStopped');
            app.isCropWindowOpen = false;
            capturer.stop();
        }
    }
});
