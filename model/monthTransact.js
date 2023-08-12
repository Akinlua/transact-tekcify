const { any } = require('joi')
const mongoose = require('mongoose')


const ComapnyAccEnum = {
    porfolioacc: 'porfolio-acc',
    payacc: 'pay-acc', 
    storeacc: 'store-acc', 
    MAIN:'MAIN'
}

const monthRecordsSchema = mongoose.Schema({
    Most_companyAcc:{
        type: String,
        trim: true,
    },
    Most_IndAcc_from: {
        type: String,
        maxlength: [500, 'name can not be more than 500 characters'],
        trim: true,
    },
    Most_ItemBoughtSold: {
        type: String,
        maxlength: [500, 'name can not be more than 500 characters'],
        trim: true,
    },
    Most_IndAcc_to: {
        type: String,
        maxlength: [500, 'name can not be more than 500 characters'],
        trim: true,
    },
    //total income, expense for the month
    income: {
        type: Number,
        default: 0,
        
    },
    expense: {
        type: Number,
        default: 0,
        
    },
    revenue: {
        type: Number,
        default: 0,
        
    },
    previous_Income: {
        type: Number,
        default: 0,
        
    },
    previous_Expense: {
        type: Number,
        default: 0,
        
    },
    previous_Revenue: {
        type: Number,
        default: 0,
        
    },
    
    perincrease_income: {
        type: Number,
        default: 0,
        
    },
    perincrease_expense: {
        type: Number,
        default: 0,
        
    },
    perincrease_revenue: {
        type: Number,
        default: 0,
        
    },

    Most_paymentGateway: {
        type: String,
    },
    updateAt: {
        type: String,
        
    },
    createAt: {
        type: String,
    },
    month: {
        type: String,
        unique:true,
    },
    Total_Revenue: {
        type: Number,
        default: 0,
        
    },
    year : {
        type: String,
    }

}, {timestamps: true},
)



// transaction ID Regex: \d[A-Z]\d{2}[A-Z]\d{3}[A-Z]{2}
// [A-Z]{2}\.?\d{6}\.\d{4}




module.exports ={
    Month: mongoose.model('Month', monthRecordsSchema),
    ComapnyAccEnum: ComapnyAccEnum,
}