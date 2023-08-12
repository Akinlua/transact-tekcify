const {Month} = require('../model/monthTransact')
const {Income, appearedMostPerMonth, Expense} = require('./revenue')
const {updateDate,createDate, checkDate, checkTime} = require('./date')
const {Records} = require('../model/records')
const generateToken = require('./token')
const {Year} = require('../model/yearlyTransact')
const {Notice} = require('../model/notification')



const createMonthlyRecords = async (req, res) => {
    console.log('start')
    monthUpdated = ""
    let mostAppearedComp = await appearedMostPerMonth("companyAcc","Income", "Expenditure",monthUpdated, req, res)
    let mostItemBoughSold = await appearedMostPerMonth("itemBoughtSold","Income", "Expenditure",monthUpdated, req, res)
    console.log(mostAppearedComp)
    let mostAppearedGateWay = await appearedMostPerMonth("paymentGateway", "Income", "Expenditure",monthUpdated, req, res)
    let mostIndivTo = await appearedMostPerMonth("IndividualAcc","Expenditure", "Expenditure", monthUpdated, req, res)
    let mostIndivfrom = await appearedMostPerMonth("IndividualAcc","Income", "Income", monthUpdated, req, res)

    //get month transaction list
    let thismonth = await new Date().toLocaleString('en', {month: 'long' }).substring(0,3)
    let thisyear = await new Date().getFullYear()
    
    const currentMonth_year = thismonth + " " + thisyear
    let income_monthly = await Income("Monthly", currentMonth_year)
    let expense_monthly = await Expense("Monthly", currentMonth_year)
    let revenue_monthly = income_monthly - expense_monthly

    console.log(income_monthly)
    //find total revenue  at
    let sum_income = await Income("forall")
    let sum_expens = await  Expense("forall")
    let Revenue = sum_income-sum_expens

    // get the previous month
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const previousMonthIndex = currentMonth === 0 ? 11: currentMonth - 1
    const previousMonthDate = new Date(currentDate)
    previousMonthDate.setMonth(previousMonthIndex)
    const previousMonth = previousMonthDate.toLocaleString('default', {month: 'long'})
    const year = previousMonthDate.getFullYear() 

    const prev_month_year = previousMonth.substring(0,3) + " " + year
    // end get
    console.log(prev_month_year)

    //find the prev month's object
    const prev_month_transact = await Month.findOne({month: prev_month_year}) 
    //end find

    let prev_income = 0
    let prev_expense = 0
    let prev_revenue = 0

    if(prev_month_transact) {
        prev_income = prev_month_transact.income
        prev_expense = prev_month_transact.expense,
        prev_revenue = prev_month_transact.revenue
    }

    let year_ = await new Date().getFullYear()
    console.log("check before: " + mostAppearedComp.value)
    const monthTransact = new Month({
        Most_companyAcc: mostAppearedComp.value,
        Most_ItemBoughtSold: mostItemBoughSold.value,
        Most_paymentGateway: mostAppearedGateWay.value,
        month: mostAppearedComp.month_year,
        income: income_monthly,
        expense: expense_monthly,
        revenue: revenue_monthly,
        Most_IndAcc_to: mostIndivTo.value,
        Most_IndAcc_from: mostIndivfrom.value,
        previous_Income: prev_income,
        previous_Expense: prev_expense,
        previous_Revenue: prev_revenue,
        Total_Revenue: Revenue,
        year: year_
       });

    const month_transact = await Month.create(monthTransact)
    console.log(month_transact)

    // newly added
    const notification = new Notice({message: `The month Overwiew for ${monthTransact.month} has just been added`})
    await Notice.create(notification)
    
    console.log("Monthly Review Is Ready")

} 
const updateMonthlyRecords = async (monthUpdated, req, res) => {
    const monthRecords_ = await Month.findOne({month: monthUpdated})
    console.log("monthRecords_: " + monthRecords_)
    if (!monthRecords_) {
        return
    }
        console.log('start')
        console.log("MonthUpdatedOne: " + monthUpdated)
        let mostAppearedComp = await appearedMostPerMonth("companyAcc","Income", "Expenditure", monthUpdated, req, res)
        let mostItemBoughSold = await appearedMostPerMonth("itemBoughtSold","Income", "Expenditure",monthUpdated, req, res)
        let mostAppearedGateWay = await appearedMostPerMonth("paymentGateway", "Income", "Expenditure", monthUpdated, req, res)
        let mostIndivTo = await appearedMostPerMonth("IndividualAcc","Expenditure", "Expenditure", monthUpdated, req, res)
        let mostIndivfrom = await appearedMostPerMonth("IndividualAcc","Income", "Income", monthUpdated, req, res)

        let income_monthly = await Income("Monthly", monthUpdated)
        let expense_monthly = await Expense("Monthly", monthUpdated)
        let revenue_monthly = income_monthly - expense_monthly

        //find total revenue  at
        let sum_income = await Income("forall")
        let sum_expens = await  Expense("forall")
        let Revenue = sum_income-sum_expens

        
   
    
        const month_transact = await Month.findOneAndUpdate({month: monthUpdated}, {
            Most_companyAcc: mostAppearedComp.value,
            Most_paymentGateway: mostAppearedGateWay.value,
            income: income_monthly,
            Most_ItemBoughtSold: mostItemBoughSold.value,
            month: monthUpdated,
            expense: expense_monthly,
            revenue: revenue_monthly,
            Most_IndAcc_to: mostIndivTo.value,
            Most_IndAcc_from: mostIndivfrom.value,
            Total_Revenue: Revenue,
    
        }, {new: true, runValidators:true})
    
    

        //get next month date
        const currentDate = new Date()
        const nextMonthDate = new Date(currentDate)
        nextMonthDate.setMonth(currentDate.getMonth() + 1)
        const nextMonthYear = nextMonthDate.getFullYear()
        const currentMonthDate = nextMonthDate.toLocaleString('default', {month: 'long'})
        
        const next_month_year = currentMonthDate.substring(0,3) + " " + nextMonthYear
        console.log(next_month_year)
        //find the prev month's object
        const next_month_transact = await Month.findOne({month: next_month_year}) 
        //end find

        if (next_month_transact) {
            await Month.findOneAndUpdate({month: next_month_year}, {
                previous_Income: month_transact.income,
                previous_Expense: month_transact.expense,
                previous_Revenue: month_transact.revenue,
            }, {new: true, runValidators:true})
        }
    

    console.log("Uodated Monthly Review Is Ready")

} 

const reset_day = async () =>  {
    console.log('start')
    const records = await Records.findOneAndUpdate({ID: "daily"}, {}, {upsert: true, new: true, runValidators: true})//get the records
    //set previous day to daily income
    const AllRecords = await Records.findOneAndUpdate({ID: "daily"}, {previous_Income: records.income, previous_Expense: records.expense, previous_Revenue: records.revenue}, {upsert: true, new: true, runValidators: true})
    //reset the day, set daily income to 0
    await Records.findOneAndUpdate({ID: "daily"}, {income: 0, expense: 0, revenue: 0}, {upsert: true, new: true, runValidators: true})   
    console.log('end')
    
}

//not associated with cron
const lineChart = async (req, res) => {
    // limit to 6 to 12 to avoid problems in  chart display
    const month_year = await Month.find({}).limit(12)
    const year = await Year.find({}).limit(12)

    //only if there is total revenue , there will be graph
    let monthYear_arr  = []
    let Total_Revenue_arr = []
    let month_Revenue = []

    //for yearchat
    let year_arr = []
    let year_Revenue = []
    let Total_Revenue_arr_Yr = []

    month_year.forEach(tran => {
        monthYear_arr.push(tran.month)
        Total_Revenue_arr.push(tran.Total_Revenue)
        month_Revenue.push(tran.revenue)
    });
    year.forEach(tran => {
        year_arr.push(tran.year)
        year_Revenue.push(tran.revenue)
        Total_Revenue_arr_Yr.push(tran.Total_Revenue)
    })
    console.log("Check Them: ", monthYear_arr, Total_Revenue_arr, month_Revenue)


    //also get for month revenue to another month revenue

    return {monthYear_arr: monthYear_arr, Total_Revenue_arr: Total_Revenue_arr, month_Revenue: month_Revenue,
        year_arr: year_arr,year_Revenue: year_Revenue, Total_Revenue_arr_Yr: Total_Revenue_arr_Yr}
}



const createYearlyRecords = async (req, res) => {
    console.log('start')

    // Find all the revenue in the year
    // set it to the year records
    // if there is prev year, set the prev revenue to year records
    let thisyear = await new Date().getFullYear()
    thisyear = year.toString()

    let income_yearly = await Income("Yearly", thisyear)
    let expense_yearly = await Expense("Yearly", thisyear)
    let revenue_yearly = income_yearly - expense_yearly
    console.log("Revenue:" + revenue_yearly, income_yearly, expense_yearly)


    //find total revenue  at
    let sum_income = await Income("forall")
    let sum_expens = await  Expense("forall")
    let Revenue = sum_income-sum_expens

    // get the previous year
    const currentDate = new Date()
    let year = currentDate.getFullYear()
    const prev_year = year - 1
    console.log("YEAR: " + year)

    
    // end get
    console.log("Prev Year: " + prev_year)

    //find the prev month's object
    const prev_year_transact = await Year.findOne({year: prev_year}) 
    //end find

    let prev_income = 0
    let prev_expense = 0
    let prev_revenue = 0

    if(prev_year_transact) {
        prev_income = prev_year_transact.income
        prev_expense = prev_year_transact.expense,
        prev_revenue = prev_year_transact.revenue
    }

    const yearTransact = new Year({
        income: income_yearly,
        expense: expense_yearly,
        revenue: revenue_yearly,
        previous_Income: prev_income,
        previous_Expense: prev_expense,
        previous_Revenue: prev_revenue,
        Total_Revenue: Revenue,
        year:  year,
       });

    const year_transact = await Year.create(yearTransact)

    console.log("Yearly Review Is Ready")

} 



const updateYearlyRecords = async (yearUpdated, req, res) => {
    const yearRecords_ = await Year.findOne({year: yearUpdated})
    if (!yearRecords_) {
        return
    }

    if (yearRecords_) {
        console.log('start')
        console.log("YearUpdatedOne: " + yearUpdated)

        let income_yearly = await Income("Yearly", yearUpdated)
        let expense_yearly = await Expense("Yearly", yearUpdated)
        let revenue_yearly = income_yearly - expense_yearly
        console.log("Todays year: " + yearUpdated)
        console.log("Yearly Inocme: " + income_yearly)
   
        //find total revenue  at
        let sum_income = await Income("forall")
        let sum_expens = await  Expense("forall")
        let Revenue = sum_income-sum_expens

        const year_transact = await Year.findOneAndUpdate({year: yearUpdated}, {
            income: income_yearly,
            expense: expense_yearly,
            revenue: revenue_yearly,
            Total_Revenue: Revenue,
        }, {new: true, runValidators:true})
    
    

        //get next year date
        const currentDate = new Date()
        const nextYear = currentDate.getFullYear() + 1
        //find the prev month's object
        const next_year_transact = await Year.findOne({year: nextYear}) 
        //end find

        if (next_year_transact) {
            await Year.findOneAndUpdate({year: nextYear}, {
                previous_Income: year_transact.income,
                previous_Expense: year_transact.expense,
                previous_Revenue: year_transact.revenue,
            }, {new: true, runValidators:true})
        }
    
    }

    console.log("Uodated Yearly Review Is Ready")

} 

module.exports = {createMonthlyRecords, updateMonthlyRecords, reset_day, lineChart, createYearlyRecords, updateYearlyRecords}