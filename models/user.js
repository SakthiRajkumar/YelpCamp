const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email:{
        type : String,
        required : [true,'Email cannot be blank']
    },
    username:{
        type:String,
        required:[true,'Username cannot be blank']
    },
    password:{
        type:String,
        required:[true,'Password cannot be blank']
    }
})

userSchema.statics.findAndValidate = async function(username ,password){
    const foundUser = await this.findOne({username});
    if(!foundUser) return false;
    const isValid = await bcrypt.compare(password,foundUser.password);
    const res = isValid ? foundUser : false;
    return isValid ? foundUser : false;
}

userSchema.pre('save',async function(){
    const hash = await bcrypt.hash(this.password,12);
    this.password = hash;
})

module.exports = mongoose.model('User',userSchema);