import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import messageModel from './models/message.model.js';
import userModel from './models/user.model.js';
import { generateResult } from './services/ai.service.js';
import redisClient from './services/redis.service.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
        credentials: true 
    }
});

io.use(async (socket, next) => {

    try {

        const cookieString = socket.handshake.headers.cookie;

        const token = cookieString && cookieString.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const finalToken = token || socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!finalToken) {
            return next(new Error('Authentication error: No Token Found'));
        }

        // Check if token is blacklisted in Redis (e.g. logged out)
        const isBlackListed = await redisClient.get(finalToken);
        if (isBlackListed) {
            return next(new Error('Authentication error: Token is blacklisted'));
        }

        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }
        socket.project = await projectModel.findById(projectId);
        if (!socket.project) {
            return next(new Error('Project not found'));
        }
        if (!finalToken) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(finalToken, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'))
        }
        socket.user = decoded;

        // Perform Socket BOLA Validation
        const userDb = await userModel.findOne({ email: decoded.email });
        if (!userDb) {
            return next(new Error('Authentication error: User not found'));
        }

        const isMember = socket.project.users.some(uId => uId.toString() === userDb._id.toString());
        if (!isMember) {
            return next(new Error('Unauthorized: You are not a member of this project'));
        }

        socket.userDb = userDb;
        next();

    } catch (error) {
        console.log("Socket Middleware Error:", error.message);
        next(error);
    }

})

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()
    console.log(`✅ User connected to Room: ${socket.roomId}`);

    socket.join(socket.roomId);
    socket.on('project-message', async data => {

        const message = data.message;
        console.log(`Message received in Room: ${socket.roomId} | Content: ${message}`)
        try {
            await messageModel.create({
                sender: socket.userDb.username || data.sender.username || data.sender.email,
                message: data.message,
                projectId: socket.project._id
            });
        } catch (err) {
            console.log("Error saving message:", err);
        }
        const aiIsPresentInMessage = message.includes('@ai');
        socket.broadcast.to(socket.roomId).emit('project-message', data)

        if (aiIsPresentInMessage) {
            const prompt = message.replace('@ai', '');
            try {
                const result = await generateResult(prompt);
                await messageModel.create({
                    sender: 'AI',
                    message: result,
                    projectId: socket.project._id
                });

                io.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: {
                        _id: 'ai',
                        email: 'AI'
                    }
                });
            } catch (aiErr) {
                console.error("AI Generation Error in Room:", socket.roomId, aiErr);
                const errorPayload = JSON.stringify({
                    text: "⚠️ Sorry, I encountered an error while processing your request. Please try again later."
                });
                io.to(socket.roomId).emit('project-message', {
                    message: errorPayload,
                    sender: {
                        _id: 'ai',
                        email: 'AI'
                    }
                });
            }
        }

    })

    socket.on('code-update', data => {
        socket.broadcast.to(socket.roomId).emit('code-update', data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId)
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})