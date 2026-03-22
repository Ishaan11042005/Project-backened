import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handlers.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose from "mongoose";

// ✅ Verify JWT
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
        );

        if (!user) {
            throw new ApiError(401, "Unauthorized user");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized request");
    }
});


// ✅ FIXED middleware (IMPORTANT: return added)
export const validateProjectPermission = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        const { projectId } = req.params;

        if (!projectId) {
            throw new ApiError(400, "ProjectId is missing");
        }

        const project = await ProjectMember.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            user: new mongoose.Types.ObjectId(req.user._id),
        });

        if (!project) {
            throw new ApiError(400, "Project not found");
        }

        const givenRole = project.role;
        req.user.role = givenRole;

        if (!roles.includes(givenRole)) {
            throw new ApiError(403, "You do not have permission");
        }

        next();
    });
};