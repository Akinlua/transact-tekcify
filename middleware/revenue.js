const {Transact, transactSchema, ComapnyAccEnum} = require('../model/transact')
const {Records} = require('../model/records')
const {Month} = require('../model/monthTransact')
const { Year } = require('../model/yearlyTransact')


const paymentGatewayTotalTransact = async (type) => {
    const getTran = await Transact.find({paymentGateway: type}).select('Amount')
    if(getTran) {
        let Amt = []
        await getTran.forEach(tran => {
            Amt.push(tran.Amount)
        }); 
        let totalAmountTransacted = 0
        for (let i=0; i<Amt.length; i++) {
            totalAmountTransacted += Amt[i]
        }            
        
        return totalAmountTransacted
    } else {
        return 0
    }
}
const getMonth_year = () => {

    let today = new Date()

    today = new Date(today)

    const day = today.getDate()
    const month = today.toLocaleDateString('default', {month: 'short', })
    const year = today.getFullYear()

    const formattedDay = day < 10 ? `0${day}` : day

    const formattedDate = `${month} ${formattedDay} ${year}`

    // get date in format yyyy-mm-dd
    const day2 = today.getDate().toString().padStart(2, '0')
    const month2 = (today.getMonth() + 1).toString().padStart(2, '0')
    const year2 = today.getFullYear()
    const formattedDate2 = `${year2}-${month2}-${day2}`

    return { TodayMonthYearDay: formattedDate, TodayMonthYearDay2: formattedDate2}

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

    // get it in format yyyy-mm-dd
    const day2 = yesterday.getDate().toString().padStart(2, '0')
    const month2 = (yesterday.getMonth() + 1).toString().padStart(2, '0')
    const year2 = yesterday.getFullYear()
    const formattedDate2 = `${year2}-${month2}-${day2}`
    
    return {formattedDate, prevDay: formattedDate2}


}

const Income = async (forall, month_or_year) => {
    //summ all amounts of transactions that are income
    if(forall == "forall") {
        
        const get_Income_tran = await Transact.find({Type:'Income'}).select('Amount')
        if(get_Income_tran) {
            let incomes_Amt = []
            await get_Income_tran.forEach(tran => {
                incomes_Amt.push(tran.Amount)
            }); 
            let sum_income = 0
            for (let i=0; i<incomes_Amt.length; i++) {
                sum_income += incomes_Amt[i]
            }            
            
            return sum_income
        } else {
            return 0
        }
        
    }
    else if (forall == "Monthly"){
        //get month transaction list
        let month = await new Date().toLocaleString('en', {month: 'long' }).substring(0,3)
        let year = await new Date().getFullYear()

        const currentMonth_year = month + " " + year
        const get_Income_tran = await Transact.find({month_year: month_or_year,Type:'Income' }).select('Amount')
        if(get_Income_tran) {
            let incomes_Amt = []
            await get_Income_tran.forEach(tran => {
                incomes_Amt.push(tran.Amount)
            }); 
            let sum_income = 0
            for (let i=0; i<incomes_Amt.length; i++) {
                sum_income += incomes_Amt[i]
            }            
            
            return sum_income
        } else {
            return 0
        }
    }
    else if (forall == "Day"){
        let {TodayMonthYearDay2} = getMonth_year()

        const get_Income_tran = await Transact.find({dateofTransact: TodayMonthYearDay2, Type:'Income'}).select('Amount')
        if (get_Income_tran) {
            let incomes_Amt = []
            await get_Income_tran.forEach(tran => {
                incomes_Amt.push(tran.Amount)
            }); 

            let sum_income = 0
            for (let i=0; i<incomes_Amt.length; i++) {
                sum_income += incomes_Amt[i]
            }            
            return sum_income
        } else {
            return 0
        }
        

    } else if (forall == "Yearly"){
        
        const get_Income_tran = await Month.find({year: month_or_year}).select('income')
        if (get_Income_tran) {
            let incomes_Amt = []
            await get_Income_tran.forEach(tran => {
                incomes_Amt.push(tran.income)
            }); 
            let sum_income = 0
            for (let i=0; i<incomes_Amt.length; i++) {
                sum_income += incomes_Amt[i]
            }            
            
            return sum_income
        } else {
            return 0
        }
        
    } else if( forall == "Prev") {
        let {prevDay} = getYesterdaydate()

        const get_Income_tran = await Transact.find({dateofTransact: prevDay, Type:'Income'}).select('Amount')
        if (get_Income_tran) {
            let incomes_Amt = []
            await get_Income_tran.forEach(tran => {
                incomes_Amt.push(tran.Amount)
            }); 

            let sum_income = 0
            for (let i=0; i<incomes_Amt.length; i++) {
                sum_income += incomes_Amt[i]
            }            
            return sum_income
        } else {
            return 0
        }
        
    }   
    
}

const Expense = async (forall, month_or_year) => {
    if(forall == "forall") {

        const get_Expen_tran = await Transact.find({Type:'Expenditure'}).select('Amount')
        if (get_Expen_tran) {
            let expens_Amt = []
            await get_Expen_tran.forEach(tran => {
                expens_Amt.push(tran.Amount)
            });
            let sum_expens = 0
                for (let i=0; i<expens_Amt.length; i++) {
                    sum_expens += expens_Amt[i]
                }
            return sum_expens
        } else {
            return 0
        }
        
    } 
    else  if (forall == "Monthly") {
        //get month transaction list
        let month = await new Date().toLocaleString('en', {month: 'long' }).substring(0,3)
        let year = await new Date().getFullYear()
        
        const currentMonth_year = month + " " + year
        const get_Expense_tran = await Transact.find({month_year: month_or_year,Type:'Expenditure' }).select('Amount')
        if (get_Expense_tran) {
            let expens_Amt = []
            await get_Expense_tran.forEach(tran => {
                expens_Amt.push(tran.Amount)
            });
            let sum_expens = 0
                for (let i=0; i<expens_Amt.length; i++) {
                    sum_expens += expens_Amt[i]
                }
            return sum_expens
        } else {
            return 0
        }
       
    } 
    else if (forall == "Yearly") {
        //get month transaction list
        let year = await new Date().getFullYear()
        year = year.toString()

        const get_Expense_tran = await Month.find({year: month_or_year}).select('expense')
        if (get_Expense_tran) {
            let expens_Amt = []
            await get_Expense_tran.forEach(tran => {
                expens_Amt.push(tran.expense)
            });
            
            let sum_expens = 0
                for (let i=0; i<expens_Amt.length; i++) {
                    sum_expens += expens_Amt[i]
                }
            
            return sum_expens
        }  else {
            return 0
        }
        
    } else if(forall == "Day") {
        
        let {TodayMonthYearDay2} = getMonth_year()

        const get_Expense_tran = await Transact.find({dateofTransact: TodayMonthYearDay2, Type:'Expenditure'}).select('Amount')
        if(get_Expense_tran) {
            let expens_Amt = []
            await get_Expense_tran.forEach(tran => {
                expens_Amt.push(tran.Amount)
            }); 

            let sum_expens = 0
            for (let i=0; i<expens_Amt.length; i++) {
                sum_expens += expens_Amt[i]
            }            
            return sum_expens
        } else {
            return 0
        }
        
    } else if (forall == "Prev") {

        let {prevDay} = getYesterdaydate()

        const get_Expense_tran = await Transact.find({dateofTransact: prevDay, Type:'Expenditure'}).select('Amount')
        if(get_Expense_tran) {
            let expens_Amt = []
            await get_Expense_tran.forEach(tran => {
                expens_Amt.push(tran.Amount)
            }); 

            let sum_expens = 0
            for (let i=0; i<expens_Amt.length; i++) {
                sum_expens += expens_Amt[i]
            }            
            return sum_expens
        } else {
            return 0
        }
    }

}

const appearedMostPerMonth = async (fieldName, type1, type2, monthUpdated, req, res) => {

    let currentMonth_year = ""
    if(monthUpdated == "") {
        //get month transaction list
        let month = await new Date().toLocaleString('en', {month: 'long' }).substring(0,3)
        let year = await new Date().getFullYear()

        let Month_year = month + " " + year
        currentMonth_year += Month_year
        //check for most indiividual app
    
    }



    const m_transact = await Transact.find({month_year: {$in: [currentMonth_year, monthUpdated]}, Type: {$in: [type1, type2]} })


    //count the Occurences of each name 
    const nameOccurences = {};
    m_transact.forEach(tran => {
        const fieldValue = tran[fieldName]
        if(nameOccurences[fieldValue]) {
            nameOccurences[fieldValue]++
        } else {
            nameOccurences[fieldValue] = 1
        }
    });

    //Find the name that appears most
    let mostAppearedName = null
    let mostOccrences = 0
    for (const value in nameOccurences) {
        if(nameOccurences[value] > mostOccrences) {
            mostAppearedName = value
            mostOccrences = nameOccurences[value]
        }
    }

    if(mostAppearedName) {
        // console.log(`The name ${mostAppearedName} appeared ${mostOccrences} times`)
    } else {
        console.log('No data Found')
    }
    if (mostAppearedName == null) mostAppearedName = ""

    return {value: mostAppearedName, month_year: currentMonth_year}
    // return { vaue: mostAppearedName, count: mostOccrences}

}

// model, model instance , All you need is the Model you want to calcultae the percentage increse or decrease on
const calcPerc = async (ModelInstance, Model,type, id) => {
    
    const Income_increase_dec_perc = (ModelInstance.income - ModelInstance.previous_Income) / ModelInstance.previous_Income  * 100
    const Expense_increase_dec_perc = (ModelInstance.expense - ModelInstance.previous_Expense) / ModelInstance.previous_Expense  * 100
    const Revenue_increase_dec_perc = (ModelInstance.revenue - ModelInstance.previous_Revenue) / ModelInstance.previous_Revenue  * 100
    
  
    let perc_Income = null
    let perc_Expense = null
    let perc_Revenue = null

    //send values only if there is percentage calculated
    if(Income_increase_dec_perc == Infinity)  perc_Income = null
    if(Expense_increase_dec_perc == Infinity)  perc_Expense = null
    if(Expense_increase_dec_perc == Infinity)  perc_Revenue = null
    
    if( (typeof Income_increase_dec_perc == "number" && Income_increase_dec_perc !== Infinity && !isNaN(Income_increase_dec_perc) ) || Income_increase_dec_perc == 0) {
        perc_Income = Income_increase_dec_perc.toFixed(2)
    }
    if((typeof Expense_increase_dec_perc == "number" && Expense_increase_dec_perc !== Infinity && !isNaN(Expense_increase_dec_perc))  || Expense_increase_dec_perc == 0) {
        perc_Expense = Expense_increase_dec_perc.toFixed(2)
    } 
    if ((typeof Revenue_increase_dec_perc == "number" && Revenue_increase_dec_perc !== Infinity && !isNaN(Revenue_increase_dec_perc) )  || Revenue_increase_dec_perc == 0){
        perc_Revenue = Revenue_increase_dec_perc.toFixed(2)
    }

    let per_increase_decrease = null
    if (type == "daily") {
        per_increase_decrease = await Model.findOneAndUpdate({ID: "daily"}, {
            perincrease_income: perc_Income, 
            perincrease_expense: perc_Expense,
            perincrease_revenue: perc_Revenue,
        }, {upsert:true, new: true, runValidators: true})
    }  else if (type == "month") {
        
        //check if month exist
        const check_month = await Model.findOne({month: id})
        if (check_month) {
            per_increase_decrease = await Model.findOneAndUpdate({month: id}, {
                perincrease_income: perc_Income, 
                perincrease_expense: perc_Expense,
                perincrease_revenue: perc_Revenue,
            }, {new: true, runValidators: true})
        }
        
    }
    
    
    return per_increase_decrease
}

const ThisMonthRecord = async () => {
    let month = await new Date().toLocaleString('en', {month: 'long' }).substring(0,3)
    let year = await new Date().getFullYear()

    let Month_year = month + " " + year
    let currentMonth_year = Month_year
    let ThisMonthRecord = await Month.findOne({month: currentMonth_year})
    ThisMonthRecord = ThisMonthRecord

    return ThisMonthRecord
}

const ThisYearRecord = async () => {
    let year = await new Date().getFullYear()
    year = year.toString()

    let ThisYearRecord = await Year.findOne({year: year})

    return ThisYearRecord
}


const prevMonthRecord = async () => {

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
   

   //find the prev month's object
   const preMonthRecord = await Month.findOne({month: prev_month_year})

   //end find


    return preMonthRecord
}

const prevYearRecord = async () => {

    // get the previous year
    const currentDate = new Date()
    let year = currentDate.getFullYear() - 1
    year = year.toString()
    // end get
    //find the prev year's object
    const preYearRecord = await Year.findOne({year: year})
 
    //end find
 
 
     return preYearRecord
 }
 


// model, model instance , All you need is the Model you want to calcultae the percentage increse or decrease on
const calcPercYear = async (ModelInstance, Model,type, id) => {//id must be previous year
    
    const Income_increase_dec_perc = (ModelInstance.income - ModelInstance.previous_Income) / ModelInstance.previous_Income  * 100
    const Expense_increase_dec_perc = (ModelInstance.expense - ModelInstance.previous_Expense) / ModelInstance.previous_Expense  * 100
    const Revenue_increase_dec_perc = (ModelInstance.revenue - ModelInstance.previous_Revenue) / ModelInstance.previous_Revenue  * 100
    
    //send values only if there is percentage calculated
    //send values only if there is percentage calculated
    let perc_Income = null
    let perc_Expense = null
    let perc_Revenue = null

    if(Income_increase_dec_perc == Infinity)  perc_Income = null
    if(Expense_increase_dec_perc == Infinity)  perc_Expense = null
    if(Expense_increase_dec_perc == Infinity)  perc_Revenue = null

    if( (typeof Income_increase_dec_perc == "number" && Income_increase_dec_perc != Infinity && !isNaN(Income_increase_dec_perc) ) || Income_increase_dec_perc == 0) {
        perc_Income = Income_increase_dec_perc.toFixed(2)
    }
    if((typeof Expense_increase_dec_perc == "number" && Expense_increase_dec_perc != Infinity && !isNaN(Expense_increase_dec_perc))  || Expense_increase_dec_perc == 0) {
        perc_Expense = Expense_increase_dec_perc.toFixed(2)
    } 
    if ((typeof Revenue_increase_dec_perc == "number" && Revenue_increase_dec_perc != Infinity && !isNaN(Revenue_increase_dec_perc))   || Revenue_increase_dec_perc == 0){
        perc_Revenue = Revenue_increase_dec_perc.toFixed(2)
    }

    
    per_increase_decrease = await Model.findOneAndUpdate({year: id}, {
        perincrease_income: perc_Income, 
        perincrease_expense: perc_Expense,
        perincrease_revenue: perc_Revenue,
    }, {new: true, runValidators: true})
    
    
    
    return per_increase_decrease
}

module.exports = {
    Income,
    Expense,
    appearedMostPerMonth,
    calcPerc,
    ThisMonthRecord,
    prevMonthRecord,
    calcPercYear,
    ThisYearRecord,
    prevYearRecord,
    paymentGatewayTotalTransact,
}
