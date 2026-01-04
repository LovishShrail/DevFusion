import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: String, // Saving email or name for easier display
        required: true
    },
    message: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project'
    }
}, {
    timestamps: true
});

const Message = mongoose.model('message', messageSchema);

export default Message;