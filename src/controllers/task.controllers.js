import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { Tasks } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handlers.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";


const getTasks=asyncHandler(async(req,res)=>{
    const {title,description,assignedTo,status}=req.body;
    const {projectId}=req.params;
    if(!project){
        throw new ApiError(404,"Project Not found")
    }
    const tasks=await Tasks.find({
        project:new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo","avatar username fullName")

    return res
    .stauts(201)
    .json(
        new ApiResponse(201,tasks,"Task fetched")
    )
})

const createTask=asyncHandler(async(req,res)=>{
    const {title,description,assignedTo,status}=req.body;
    const {projectId}=req.params;

    const project=await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,"Project Not found")
    }
    const files=req.files || [];
    const attachments=files.map((file)=>{
        return {
            url:`${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype:file.mimetype,
            size:file.size

        }
    })
    const task=await Tasks.create({
        title,
        description,
        project:new mongoose.Types.ObjectId(projectId),
        assignedTo:assignedTo?new mongoose.Types.ObjectId(assignedTo):undefined,
        status,
        assignedBy:new mongoose.Types.ObjectId(req.user._id),
        attachments
    })
    return res
    .stauts(201)
    .json(
        new ApiResponse(201,task,"Task Created")
    )
})

const getTaskById=asyncHandler(async(req,res)=>{})

const updateTask=asyncHandler(async(req,res)=>{})

const deleteTask=asyncHandler(async(req,res)=>{})

const createSubTask=asyncHandler(async(req,res)=>{})

const updateSubTask=asyncHandler(async(req,res)=>{})

const deleteSubTask=asyncHandler(async(req,res)=>{})

export{
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask
}

