const { any } = require('joi')
const mongoose = require('mongoose')


const ComapnyAccEnum = {
    porfolioacc: 'porfolio-acc',
    payacc: 'pay-acc', 
    storeacc: 'store-acc', 
    MAIN:'MAIN'
}

const transactSchema = mongoose.Schema({
    companyAcc:{
        type: String,
        enum: [ComapnyAccEnum.porfolioacc, ComapnyAccEnum.payacc, ComapnyAccEnum.storeacc, ComapnyAccEnum.MAIN],
        required: [true, 'Make sure to provide an account name used to pay/collect payment'],
        trim: true,
    },
    IndividualAcc: {
        type: String,
        required: [true, 'Make sure to provide an account name used to pay/collect payment'],
        maxlength: [500, 'name can not be more than 500 characters'],//adviceable 30 characters BUT deal with 60 characters 
        trim: true,
    },
    itemBoughtSold: {
        type: String,
        required: [true, 'Make sure to provide the item that was bought or sold'],
        maxlength: [500, 'name can not be more than 500 characters'],//adviceable 30 characters BUT deal with 60 characters 
        trim: true,
    },
    Amount: {
        type: Number,
        default: 0,
        
    },
    updateAt: {
        type: String,
        
    },
    createAt: {
        type: String,
    },
    dateofTransact:{    
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'make sure to provide the date on which the transaction was made'],
        match: [
            /^(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|[012])[-/.](19|20)\d\d$/,
            'Please Provide valid date'
        ],
    },
    timeofTransact:{
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'make sure to provide the time on which the transaction was made'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please Provide valid email'
        ],
    },
    paymentGateway: {
        type: String,
        enum:{
            values: ['Stripe', 'Paypal', 'Flutterwave', 'Paystack'],
            message: '{VALUE} is not supported'
        },
        required: [true, 'Make sure to provide the Payment Gateway used for payment'],
    },
    TransactionId:{
        type: String,
        required: [true, 'Make sure to provide the Payment Gateway used for payment'],
        trim: true,
        unique: true,
    },
    Type: {
        type: String,
        enum:{
            values: ['Income', 'Expenditure'],
            message: '{VALUE} is not supported'
        },
        required: [true, 'Make sure to provide the type of payment in or from the Comapny\'s account'],
    },
    month_year: {
        type: String,
    }

}, {timestamps: true},
)



// transaction ID Regex: \d[A-Z]\d{2}[A-Z]\d{3}[A-Z]{2}
// [A-Z]{2}\.?\d{6}\.\d{4}

// add regex for date in controllers or here
// and time



module.exports ={
    Transact: mongoose.model('Transact', transactSchema),
    transactSchema: transactSchema,
    ComapnyAccEnum: ComapnyAccEnum,
}