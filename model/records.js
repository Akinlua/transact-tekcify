
const mongoose = require('mongoose')

const recordsSchema = mongoose.Schema({
    ID: {
        type: String,
        unique: true,
    },

    //daily income
    income:{
        type: Number,
        default: 0,
    },
    expense:{
        type: Number,
        default: 0,
    },
    revenue:{
        type: Number,
        default: 0,
    },
    //for all the income ever received

    Total_Revenue:{
        type: Number,
        default: 0,
    },
    Total_Income: {
        type: Number,
        default: 0,
    },
    Total_Expense: {
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

}, {timestamps: true},
)

module.exports ={
    Records: mongoose.model('Records', recordsSchema),
}