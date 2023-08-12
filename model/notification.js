
const mongoose = require('mongoose')

const noticeSchema = mongoose.Schema({
    message: {
        type: String,
    },

   
}, {timestamps: true},
)

module.exports ={
    Notice: mongoose.model('Notice', noticeSchema),
}