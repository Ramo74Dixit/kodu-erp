const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
  student:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  trainer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  message:{type:String,required:true},
  createdAt:{type:Date,default:Date.now()}
})


module.exports=mongoose.model('Complaint',complaintSchema)