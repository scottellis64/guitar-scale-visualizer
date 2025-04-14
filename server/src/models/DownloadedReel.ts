import mongoose from 'mongoose';

const downloadedReelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    originalUrl: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    gridfsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const DownloadedReel = mongoose.model('DownloadedReel', downloadedReelSchema); 