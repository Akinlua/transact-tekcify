const {Transact, transactSchema, ComapnyAccEnum} = require('../model/transact')
const transactLayout = '../views/layouts/index'
const dasboardLayout = '../views/layouts/dasboard.ejs'
const {updateDate,createDate, checkDate, checkTime, convertDate} = require('../middleware/date')
const {Income, appearedMostPerMonth, Expense, calcPercYear, paymentGatewayTotalTransact,
     calcPerc, ThisMonthRecord, prevMonthRecord, ThisYearRecord, prevYearRecord} = require('../middleware/revenue')
const {Month} = require('../model/monthTransact')
const {createMonthlyRecords, updateMonthlyRecords, updateYearlyRecords, lineChart} = require('../middleware/cron')
const {Records} = require('../model/records')
const User = require('../model/User')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const handlebars = require('handlebars')
const ExcelJS = require('exceljs')
const {exec} = require('child_process')
const {createPDF} = require('../middleware/pdf')
const noLayout = '../views/layouts/nothing.ejs'
const path = require('path')
const { Year } = require('../model/yearlyTransact')
const pagination = require('../middleware/pagination')
const {Notice} = require('../model/notification')


const dashboard = async (req, res) => {
    
    let transact_ = Transact.find({}).sort('-dateofTransact')
    let transact = await transact_.sort("-timeofTransact").limit(5)

    // //total amount transacted for each payment gateway (4 data)
    let stripeTotalTransAmt = await  paymentGatewayTotalTransact("Stripe")
    let paypalTotalTransAmt = await paymentGatewayTotalTransact("Paypal")
    let paystackTotalTransAmt = await paymentGatewayTotalTransact("Paystack")
    let flutterTotalTransAmt = await paymentGatewayTotalTransact("Flutterwave")

    console.log(stripeTotalTransAmt, paypalTotalTransAmt, paystackTotalTransAmt, flutterTotalTransAmt)
    //calc sum of income, expense for alll transact and Revenue(profit)
    let sum_income = await Income("forall")
    let sum_expens = await  Expense("forall")
    let Revenue = sum_income-sum_expens

    // clac sum of income daily
    let sum_incomeDaily = await Income("Day")
    let sum_expensDaily  = await Expense("Day")
    let RevenueDaily  = sum_incomeDaily-sum_expensDaily


    // calc sum of prev day income
    let sum_incomePrevDaily = await Income("Prev")
    let sum_expensPrevDaily  = await Expense("Prev")
    let RevenuePrevDaily  = sum_incomePrevDaily-sum_expensPrevDaily
    //find All records
    let AllRecords = await Records.findOneAndUpdate({ID: "daily"}, {
        Total_Income:  sum_income,
        Total_Expense: sum_expens,
        Total_Revenue: Revenue,
        income: sum_incomeDaily,
        expense: sum_expensDaily,
        revenue: RevenueDaily,
        previous_Income:sum_incomePrevDaily,
        previous_Expense: sum_expensPrevDaily,
        previous_Revenue: RevenuePrevDaily,
    }, {upsert: true, new: true, runValidators: true})



    //find the increase/decrease percentage income/expense - for daily
    let per_increase_decrease = await calcPerc(AllRecords, Records,"daily", null)
    // end

    //find all month records, paginated it
    let monthRecords_ = Month.find({}).sort("-createdAt")
    const count = await Month.count()
    const {modelinstances, hasNextPage, nextPage, prevPage, hasPrevPage, page, noOfPages} = await pagination(monthRecords_,count, req, res)
    monthRecords_ = await modelinstances

    let monthRecords = null
    if (monthRecords_) {
        monthRecords = monthRecords_
    }
    //find this month record
    const PrevMonthRecord_ = await prevMonthRecord()

    
    //find the percentage increase or decrease - Monthly
    let PrevMonthRecord = null
    let per_month_inc_dec = null
    if(PrevMonthRecord_) {
        PrevMonthRecord = PrevMonthRecord_
        per_month_inc_dec  = await calcPerc(PrevMonthRecord_, Month, "month", PrevMonthRecord_.month)
    }

    //find current User, if login
    let current_user = null
    const currentUser = await User.findById(req.userId)
    // console.log(currentUser)
    if (currentUser) {
        current_user = currentUser
    }

    //get month year and total revnue for line chart
    const {monthYear_arr, Total_Revenue_arr, month_Revenue,year_arr, year_Revenue, Total_Revenue_arr_Yr} = await lineChart()
    // const Total_Revenue_arr = await lineChart()

    //calculate incr/dec perc for year
    const prevyearRecord = await prevYearRecord()
    console.log("Previous year record: " + prevyearRecord.year)
    //find the percentage increase or decrease - Yearly
    let PrevYearRecord = null
    let perIncrease_decYear = null
    if(prevyearRecord) {
        PrevYearRecord = prevyearRecord
        perIncrease_decYear  = await calcPercYear(prevyearRecord, Year, null, prevyearRecord.year)
    }

    // newly added, get notifications 
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)

    res.render('dashboard', {layout: dasboardLayout,transact, sum_expens, sum_income, Revenue, monthRecords, AllRecords, 
        per_increase_decrease, PrevMonthRecord, per_month_inc_dec, current_user,monthYear_arr, 
        Total_Revenue_arr, month_Revenue,prevyearRecord, perIncrease_decYear,
        year_arr, year_Revenue, Total_Revenue_arr_Yr, stripeTotalTransAmt, paypalTotalTransAmt, paystackTotalTransAmt, 
        flutterTotalTransAmt, hasNextPage, nextPage, prevPage, hasPrevPage, page, noOfPages, notifications})
}

const getTransactions = async (req, res) => {

    // PAGINATION
    let result = Transact.find({})
    result = result.sort("-dateofTransact")
    result = result.sort("-timeofTransact")
    const count = await Transact.count()
    const {modelinstances, hasNextPage, nextPage, prevPage, hasPrevPage, page, noOfPages} = await pagination(result,count, req, res)
    let transact = await modelinstances
    // //total amount transacted for each payment gateway (4 data)
    let stripeTotalTransAmt = await  paymentGatewayTotalTransact("Stripe")
    let paypalTotalTransAmt = await paymentGatewayTotalTransact("Paypal")
    let paystackTotalTransAmt = await paymentGatewayTotalTransact("Paystack")
    let flutterTotalTransAmt = await paymentGatewayTotalTransact("Flutterwave")

    //calc sum of income, expense for alll transact and Revenue(profit)
    let sum_income = await Income("forall")
    let sum_expens = await  Expense("forall")
    let Revenue = sum_income-sum_expens

    // clac sum of income daily
    let sum_incomeDaily = await Income("Day")
    let sum_expensDaily  = await  Expense("Day")
    let RevenueDaily  = sum_incomeDaily-sum_expensDaily
    console.log(sum_incomeDaily)

    // calc sum of prev day income
    let sum_incomePrevDaily = await Income("Prev")
    const newLocal = "Prev"
    let sum_expensPrevDaily  = await Expense(newLocal)
    let RevenuePrevDaily  = sum_incomePrevDaily-sum_expensPrevDaily
    console.log("Sum prev: " + sum_expensPrevDaily) 
    //find All records
    let AllRecords = await Records.findOneAndUpdate({ID: "daily"}, {
        Total_Income:  sum_income,
        Total_Expense: sum_expens,
        Total_Revenue: Revenue,
        income: sum_incomeDaily,
        expense: sum_expensDaily,
        revenue: RevenueDaily,
        previous_Income:sum_incomePrevDaily,
        previous_Expense: sum_expensPrevDaily,
        previous_Revenue: RevenuePrevDaily,
    }, {upsert: true, new: true, runValidators: true})


    let per_increase_decrease = await calcPerc(AllRecords, Records,"daily", null)

    //new records containing percentage increase or decrease

    //find current User, if login
    let current_user = null
    const currentUser = await User.findById(req.userId)
    console.log(currentUser)
    if (currentUser) {
        current_user = currentUser
    }
    //get month year and total revnue for line chart
    const {monthYear_arr, Total_Revenue_arr} = lineChart()

    // newly added , get notifications, last 4
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)

    res.render('transact', {layout: dasboardLayout, transact, AllRecords, per_increase_decrease, 
        current_user, monthYear_arr, Total_Revenue_arr, 
        hasNextPage, nextPage, prevPage, hasPrevPage, page, noOfPages, stripeTotalTransAmt, paypalTotalTransAmt, paystackTotalTransAmt, 
        flutterTotalTransAmt, notifications})
}

const changeToInt = async (value, req, res) => {
    value = await Number(value)
    if (isNaN(value) ){
        value = -1234567890987654345678
    }

    return value
}   

const transactSearch = async (req, res) => {

    // //total amount transacted for each payment gateway (4 data)
    let stripeTotalTransAmt = await  paymentGatewayTotalTransact("Stripe")
    let paypalTotalTransAmt = await paymentGatewayTotalTransact("Paypal")
    let paystackTotalTransAmt = await paymentGatewayTotalTransact("Paystack")
    let flutterTotalTransAmt = await paymentGatewayTotalTransact("Flutterwave")

    let  searchTerm = ""
    if (req.body.searchTerm )
        searchTerm = req.body.searchTerm 
    if(req.query.searchTerm)
        searchTerm = req.query.searchTerm

    // set the search value to be used for amount
    let searchValue = await changeToInt(searchTerm)
    console.log('search: ' + searchValue)
    
    let searchTransact = Transact.find({
        $or: [
            {companyAcc: {$regex: searchTerm, $options: 'i'}},
            {IndividualAcc: {$regex: searchTerm, $options: 'i'}},
            {itemBoughtSold: {$regex: searchTerm, $options: 'i'}},
            {paymentGateway: {$regex: searchTerm, $options: 'i'}},
            {TransactionId: {$regex: searchTerm, $options: 'i'}},
            {Type: {$regex: searchTerm, $options: 'i'}},
            {month_year: {$regex: searchTerm, $options: 'i'}},
            {updateAt: {$regex: searchTerm, $options: 'i'}},
            {createAt: {$regex: searchTerm, $options: 'i'}},
            {dateofTransact: {$regex: searchTerm, $options: 'i'}},
            {timeofTransact: {$regex: searchTerm, $options: 'i'}},
            {Amount: searchValue}
        ]
    })
    searchTransact = searchTransact.sort("-dateofTransact")
    searchTransact = searchTransact.sort("-timeofTransact")
    // count
    let count = await Transact.find({
        $or: [
            {companyAcc: {$regex: searchTerm, $options: 'i'}},
            {IndividualAcc: {$regex: searchTerm, $options: 'i'}},
            {itemBoughtSold: {$regex: searchTerm, $options: 'i'}},
            {paymentGateway: {$regex: searchTerm, $options: 'i'}},
            {TransactionId: {$regex: searchTerm, $options: 'i'}},
            {Type: {$regex: searchTerm, $options: 'i'}},
            {month_year: {$regex: searchTerm, $options: 'i'}},
            {updateAt: {$regex: searchTerm, $options: 'i'}},
            {createAt: {$regex: searchTerm, $options: 'i'}},
            {dateofTransact: {$regex: searchTerm, $options: 'i'}},
            {timeofTransact: {$regex: searchTerm, $options: 'i'}},
            {Amount: searchValue}
        ]
    }).count()

    // if its amount
    // if(Number(searchTerm)) {
    //     let amountTransact = []
    //     let amount = Transact.find({
    //         $or: [
    //             {Amount: searchTerm}
    //         ]
    //     })
    //     amountTransact.push(amount)
    //     let count2 = await Transact.find({
    //         $or: [
    //             {Amount: searchTerm}
    //         ]
    //     }).count()
    //     amountTransact.forEach(tran => {
    //         searchTransact.push(tran)
    //     })
    //     count = count + count2
    //     console.log("Amount: " + amountTransact.skip(2))
    // }

    // / PAGINATION
    let result = searchTransact
    const {modelinstances, hasNextPage, nextPage, prevPage, hasPrevPage, page, noOfPages} = await pagination(result,count, req, res)
    searchTransact  = await modelinstances
    console.log(modelinstances)

    // for DASHBOARD
    const AllRecords = await Records.findOneAndUpdate({ID: "daily"}, {}, {upsert: true, new: true, runValidators: true})
    //end find

    per_increase_decrease = await calcPerc(AllRecords, Records,"daily", null)

    
    //new records containing percentage increase or decrease

    //find current User, if login
    let current_user = null
    const currentUser = await User.findById(req.userId)
    if (currentUser) {
        current_user = currentUser
    }

    //get month year and total revnue for line chart
    const {monthYear_arr, Total_Revenue_arr} = lineChart()

    //newly added, get notifications
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)

    // set page 
    let page_ = ""
    // remove query page
    res.render('search', {
        searchTransact,searchTerm, layout: dasboardLayout, AllRecords, 
        per_increase_decrease, current_user, monthYear_arr, 
        Total_Revenue_arr,hasNextPage, nextPage, prevPage, hasPrevPage, page, noOfPages, page_,
        stripeTotalTransAmt, paypalTotalTransAmt, paystackTotalTransAmt, 
        flutterTotalTransAmt, notifications,
    })


}
const getMonthlyTransactions = async (req, res) => {

    let transact = Transact.find({month_year: req.params.month}).sort("-dateofTransact")
    transact = transact.sort("-timeofTransact")
    transact = await transact
    if (transact.length == 0) {
        return res.render("errors/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: `There are currently no transactions in the month \'${req.params.month}\'`})
    }

    let current_user = null
    const currentUser = await User.findById(req.userId)
    console.log(currentUser)
    if (currentUser) {
        current_user = currentUser
    }

    const notifications = await Notice.find({}).sort("-createdAt").limit(3)

    res.render('monthlyT', { transact, current_user, month: req.params.month, notifications}) 
}


const getMonth_year = () => {

    let today = new Date()

    today = new Date(today)

    const day = today.getDate()
    const month = today.toLocaleDateString('default', {month: 'short', })
    const year = today.getFullYear()

    const formattedDay = day < 10 ? `0${day}` : day

    const formattedDate = `${month} ${formattedDay} ${year}`
    
    return { TodayMonthYearDay: formattedDate}

}

const getYesterdaydate = () => {
    const today = new Date()

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const day = yesterday.getDate()
    const month = yesterday.toLocaleDateString('default', {month: 'short', })
    const year = yesterday.getFullYear()

    const formattedDay = day < 10 ? `0${day}` : day

    const formattedDate = `${month} ${formattedDay} ${year}`
    return formattedDate


}

const createTransactions = async (req, res) => {

    const checkTransactID = await Transact.findOne({TransactionId: req.body.TransactionId})
    if(!checkTransactID){

        //check if date and time are correctly inputted
        let checkdate = await checkDate(req.body.dateofTransact, req,res)
        if (checkdate == false){
            return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Error, check date input"})
        }
        let checktime = await checkTime(req.body.timeofTransact, req, res)

        if (checktime == false){
            return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Error, check time input"})
        }
        //end

        const transact = await Transact.create({...req.body})
        let create_ID = transact._id

        const newTransact = await createDate(transact, Transact)

        // find the just created transact with the stored ID
        const transact_ = await Transact.findOne({_id: create_ID})
        console.log(transact_)
        
        
        updateMonthlyRecords(transact.month_year, req, res)//update month with initial month date
        updateMonthlyRecords(newTransact.month_year, req, res)// /update month with new month date 
        
        // get the initial year of transact
        if ( transact.month_year) {
            let iniyear = transact.month_year
            iniyear = iniyear.split(" ")
            iniyear = iniyear[1]
        }

        //get the year of the transact updated 
        let year = newTransact.month_year 
        console.log(year, typeof year)
        year = year.split(" ")
        year = year[1]

        if ( transact.month_year) {
            updateYearlyRecords(iniyear, req, res)//only update if there was initial transact with a mont-year
        }
        updateYearlyRecords(year, req, res)


        res.redirect('/transactions')

    }
    else {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Make sure Transaction ID is unique"})
    }

}
const transactPage = async (req,res) => {
    let current_user = null
    const currentUser = await User.findById(req.userId)
    if (currentUser) {
        current_user = currentUser
    }
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)

    res.render('add-transact', {ComapnyAccEnum, current_user, notifications})
}


const deleteTransactions = async (req, res) => {

    const transact = await Transact.findOne({ _id: req.params.id } )
    console.log("delete: "+ transact.month_year)
    await Transact.deleteOne( { _id: req.params.id } ); 

    
    await updateMonthlyRecords(transact.month_year, req, res)
    //get the year of the transact updated 
    let year = transact.month_year
    year = year.split(" ")
    year = year[1]
    console.log("year: " + year)
    await updateYearlyRecords(year, req, res)
    
    res.redirect('/transactions')
}

const changeTransactionsPage = async (req, res) => {


    const transact = await Transact.findOne({_id: req.params.id })
    if (!transact) {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Bad request, wrong ID'"})
    }

    let current_user = null
    const currentUser = await User.findById(req.userId)
    if (currentUser) {
        current_user = currentUser
    }
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)


    res.render('edit-transact', {transact, layout: transactLayout, ComapnyAccEnum, current_user, notifications})
}
const editTransactions = async (req,res) => {

    //check if date and time are correctly inputted
    let checkdate = await checkDate(req.body.dateofTransact, req,res)
    if (checkdate == false){
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Error, check date input"})
    }
    let checktime = await checkTime(req.body.timeofTransact, req, res)

    if (checktime == false){
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Error, check time input"})
    }
    //end
    const presentTransact =  await Transact.findOne({_id: req.params.id})

    const transact = await Transact.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, runValidators:true})
    if (!transact) {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Bad request, wrong ID'"})
    }
    const newTransact = await updateDate(req.params.id, transact, Transact, res, req)


    await updateMonthlyRecords(transact.month_year, req, res)//update month with initial month date
    await updateMonthlyRecords(newTransact.month_year, req, res)//update month with new month date 
    // get the initial year of transact
    let iniyear = transact.month_year
    iniyear = iniyear.split(" ")
    iniyear = iniyear[1]

    //get the year of the transact updated 
    let year = newTransact.month_year
    year = year.split(" ")
    year = year[1]
    
    console.log("year: " + year)
    await updateYearlyRecords(iniyear, req, res)//only update if there was initial transact with a mont-year

    await updateYearlyRecords(year, req, res)


    res.redirect(`/transactions`);
}

//generate pdf for each month
const genereatePdf = async (req, res) => {

    const monthlyTransact = await Transact.find({month_year: req.params.month});
    createPDF(monthlyTransact, 'transactions.pdf', req, res)

}

const genereateExcel =  async (req, res) => {
    
    const monthlyTransact = await Transact.find({month_year: req.params.month});
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
        {header: 'Company\'s Acc', key: 'companyAcc', width: 20},
        {header: 'Amount', key: 'Amount', width: 20},
        {header: 'Individual\'s Acc', key: 'IndividualAcc', width: 20},
        {header: 'Item Bought/Sold', key: 'itemBoughtSold', width: 20},
        {header: 'Payment Gateway', key: 'paymentGateway', width: 20},
        {header: 'Type of Payment', key: 'Type', width: 20},
        {header: 'Date of Transact', key: 'dateofTransact', width: 20},
        {header: 'Time of Transact', key: 'timeofTransact', width: 20},
        {header: 'Transaction ID', key: 'TransactionId', width: 20},
        {header: 'Created', key: 'createAt', width: 20},
        {header: 'Updated', key: 'updateAt', width: 20},

    ];

    monthlyTransact.forEach(tran => {
        worksheet.addRow(tran)
    });

    res.setHeader('Content-Disposition', 'attachment; filename="transactions.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await workbook.xlsx.write(res)
    res.end();

}

module.exports = {
    dashboard,
    getTransactions,
    deleteTransactions,
    editTransactions,
    transactPage,
    createTransactions,
    changeTransactionsPage,
    getMonthlyTransactions,
    genereatePdf,
    genereateExcel,
    transactSearch,
}
