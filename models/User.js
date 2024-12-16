const mongoose = require('mongoose');
const { type } = require('os');
const { boolean } = require('webidl-conversions');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    mobile: {
        type: String,
    },
    email: {
        type: String
    },
    address: {
        type: String,
        required: true,
    },
   adharCardNumber:{
        type: Number,
        required: true,
        unique : true
    }, 
    password: {
        type: String,
        required: true
    },
    role : {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default : false
    }
});



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);
module.exports = User;