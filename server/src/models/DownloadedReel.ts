import mongoose from 'mongoose';

const downloadedReelSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    uploader: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    duration: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },
    filename: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    gridfsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'reels.files'
    },
    thumbnail: {
        type: String,
        default: '',
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});

// Add indexes for common queries
downloadedReelSchema.index({ title: 'text', description: 'text' });
downloadedReelSchema.index({ uploader: 1 });
downloadedReelSchema.index({ createdAt: -1 });
downloadedReelSchema.index({ viewCount: -1 });

// Virtual for download URL
downloadedReelSchema.virtual('downloadUrl').get(function() {
    return `/api/reels/${this.gridfsId}`;
});

// Virtual for stream URL
downloadedReelSchema.virtual('streamUrl').get(function() {
    return `/api/reels/${this.gridfsId}/stream`;
});

export const DownloadedReel = mongoose.model('DownloadedReel', downloadedReelSchema); 