const mongoose = require('mongoose')

const transactSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: [500, 'name can not be more than 500 characters'],
        required: [true, 'Make sure to provide an name of the person that made the order'],
    },
    OrderNo: {
        type: Number,
        default: 0,
        required: [true, 'Make sure to provide the Order No for easy trace'],
    },
    Cost: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        required: [true, 'make sure to provide the date on which the order was made']
    },
    Product: {
        type: String,
        required: [true, 'Make sure to provide the Product that was ordered for'],
    },
    PaymentMode: {
        type: String,
        enum:{
            values: ['Credit Card', 'Cash On delivery', 'Online Payment'],
            message: '{VALUE} is not supported'
        },
        required: [true, 'Make sure to provide the payment mode used for payment'],
    },
    TransactionId:{
        type: String,
        required: [true, 'Make sure to provide the Payment Gateway used for payment'],
    },
    Type: {
        type: String,
        enum:{
            values: ['Income', 'Expenditure'],
            message: '{VALUE} is not supported'
        },
        required: [true, 'Make sure to provide the type of payment in or from the Comapny\'s account'],
    }

})
module.exports = mongoose.model('Transact', transactSchema)
