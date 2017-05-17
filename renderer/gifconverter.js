const FfmpegCommand = require('fluent-ffmpeg');
const BinaryHelper = require('./binaryhelper');
FfmpegCommand.setFfmpegPath(BinaryHelper.FFMPEG);
FfmpegCommand.setFfprobePath(BinaryHelper.FFPROBE);

class GifConverter {
    static convert(stream, file, crop) {
        return new Promise((resolve, reject) => {
            FfmpegCommand(stream)
            .videoFilters(`crop=${crop.size[0]}:${crop.size[1]}:${crop.position[0]}:${crop.position[1]}`)
            .on('end', () => {
                resolve();
            }).on('error', (error) => {
                reject(error);
            }).save(file);
        });
    }

}

module.exports = GifConverter;
