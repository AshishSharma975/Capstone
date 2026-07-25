import mongoose from 'mongoose';

const projectFileSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true
    },
    filePath: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure unique filePath per project
projectFileSchema.index({ projectId: 1, filePath: 1 }, { unique: true });

const ProjectFile = mongoose.model('ProjectFile', projectFileSchema);
export default ProjectFile;
