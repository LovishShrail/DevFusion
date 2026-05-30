import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import userModel from "../models/user.model.js";
import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const isBlackListed = await redisClient.get(token);

        if (isBlackListed) {

            res.cookie('token', '');

            return res.status(401).send({ error: 'Unauthorized User' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {

        console.log(error);

        res.status(401).send({ error: 'Unauthorized User' });
    }
}

export const authProjectMember = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.body.projectId || req.query.projectId;

        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: "Invalid Project ID" });
        }

        const user = await userModel.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const isMember = project.users.some(uId => uId.toString() === user._id.toString());
        if (!isMember) {
            return res.status(403).json({ error: "Unauthorized: You are not a member of this project" });
        }

        req.project = project;
        req.userDb = user;
        next();
    } catch (error) {
        console.error("Project auth error:", error);
        res.status(500).json({ error: error.message });
    }
}