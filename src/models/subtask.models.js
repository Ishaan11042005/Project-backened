import mongoose, { Mongoose,Schema } from "mongoose";

const subTaskSchema=new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    task:{
        type:Schema.Types.ObjectId,
        ref:"Task",
        required:true
    },
    isCompleted:{
        type:Boolean,
        default:false,
    },
    createdBy:{
        type:Schema.Types.ObjectId,
        require:true,
        ref:"User"
    }
},{timestamps:true})

export const Subtask=mongoose.model("Subtask",subTaskSchema)