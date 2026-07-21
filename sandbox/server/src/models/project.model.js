import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
   user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
   },
   title:{
    type:String,
    default:"untitled project"
   },
   
  
})


const project = mongoose.model('project',projectSchema)

export default project;