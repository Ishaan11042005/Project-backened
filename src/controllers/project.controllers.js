import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handlers.js";
import { ApiError } from "../utils/api-error.js";
import { cookie } from "express-validator";
import mongoose, { Mongoose } from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";
import { pipeline } from "stream";
const getProjects=asyncHandler(async(req,res)=>{
    const projects=await ProjectMember.aggregate(
        {
            $match:{
                user:new mongoose.Types.ObjectId(req.user._id)
            },
        },
        {
            $lookup:{
                from:"projects",
                localField:"projects",
                foriegnField:"_id",
                as:"projects",
                pipeline:[
                    {
                        $lookup:{
                            from:"projectmembers",
                            localField:"_id",
                            forgienField:"projects",
                            as:"projectmembers"
                        }
                    },{
                    $addFields: {
                        members:{
                            $size:"$projectmembers"
                        }
                    }
                },{
                    $unwind:"$project"
                },{
                    $project:{
                        project:{
                            _id:1,
                            name:1,
                            description:1,
                            members:1,
                            createdAt:1,
                            createdBy:1
                        },
                        role:1,
                        _id:0
                    }
                }
                ]
            }
        }
    ) 
    return res.
    status.
    json(
        new ApiResponse(200,projects,"Projects fetched successfuly")
    )
})

const getProjectById=asyncHandler(async(req,res)=>{

})

const createProjects=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    const project=await Project.create({
        name,
        description,
        createdBy:new mongoose.Types.ObjectId(req.user._id)
    })
    await ProjectMember.create({
        user:new mongoose.Types.ObjectId(req.user._id),
        project:new mongoose.Types.ObjectId(project._id),
        role:UserRolesEnum.ADMIN
})
return res
    .status(201
    .json(
        new ApiResponse(
            201,
            project,
            "project created"
        )
    )
)
})

const updateProject=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    const projectId=req.params

    const project=await Project.findById(
        projectId,
        {
            name,
            description,

        },
        {
            new:true
        }
    )
    if(!project){
        throw new ApiError(404,"Project not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,project,"Project updated successfully"
        )
    )
})

const deleteProject=asyncHandler(async(req,res)=>{
    const {projectId}=req.params

    const project=await Project.findByIdAndDelete(projectId)
    if(!project){
        throw new ApiError(404,"Project Not found")
    }
    return res
    .staus(200)
    .json(new ApiResponse(200,project,"project deleted successfully"))
})

const addMembersToProject=asyncHandler(async(req,res)=>{

})

const getProjectMembers=asyncHandler(async(req,res)=>{

})

const updateMemberRole=asyncHandler(async(req,res)=>{

})

const deleteMember=asyncHandler(async(req,res)=>{

})

export {addMembersToProject,
    createProjects,
    deleteMember,
    getProjectById,
    getProjects,
    getProjectMembers,
    updateProject,
    deleteProject,
    updateMemberRole,

}






