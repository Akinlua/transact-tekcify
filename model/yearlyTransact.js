const { any } = require('joi')
const mongoose = require('mongoose')


const ComapnyAccEnum = {
    porfolioacc: 'porfolio-acc',
    payacc: 'pay-acc', 
    storeacc: 'store-acc', 
    MAIN:'MAIN'
}

const yearRecordsSchema = mongoose.Schema({
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

    updateAt: {
        type: String,
        
    },
    createAt: {
        type: String,
    },
    year: {
        type: String,
        unique:true,
    },
    Total_Revenue: {
        type: Number,
        default: 0,
        
    },
    year: {
        type: String,
        unique: true,
    }

}, {timestamps: true},
)




module.exports ={
    Year: mongoose.model('Year', yearRecordsSchema),
    ComapnyAccEnum: ComapnyAccEnum,
}