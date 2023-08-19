const {Transact, transactSchema, ComapnyAccEnum} = require('../model/transact')

const checkDate = async (date,req,res) => {

    
    let date_regex = /^\d{4}-\d{2}-\d{2}$/
    let checkDate = date_regex.test(date)
    if(checkDate == false){
        return false
    } else {
        return true
    }
}

const checkTime = async(time, req, res) => {
    let time_regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][-0-9]$/
    let checkTime = time_regex.test(time)
    if(checkTime == false){
        return false
    }else {
        return true
    }
}
const updateDate = async (id, newModel, Model, res,req) => {

    let update = newModel.updatedAt
    let date = update.toDateString()
    date = date.substring(4)
    let time = update.toTimeString()
    time = time.substring(0,5)
    update =  date + " | " + time
    
    let dateofTransact = newModel.dateofTransact
    //now converts to normal date   
    let {month_year} = await convertDate(dateofTransact)

    const transact_updated = await Model.findOneAndUpdate({_id: newModel._id},{updateAt: update, month_year: month_year}, {new: true, runValidators:true})
    return transact_updated

}

// function to convert date
const convertDate = (date) => {

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const parts = date.split('-');
    const year = parts[0]
    const month = months[parseInt(parts[1])- 1]
    const day = parts[2]

    // take half month
    const month_ = month.substring(0,3)

    const month_year = month_ + " " + year

    const month_year_day = month_ + " " + day + " " + year
    //return after conversion
    return {month_year: month_year, month_year_day: month_year_day }
}

const createDate = async (newModel, Model) => {

    let create = newModel.createdAt
    let date1 = create.toDateString()
    date1 = date1.substring(4)
    let time1 = create.toTimeString()
    time1 = time1.substring(0,5)
    create =  date1 + " | " + time1
    month= create.substring(0,3)
    year = create.substring(7,11)
    // let month_year = month + " " + year//dont use this method to get the month year

    //get the dateoftransact and covert to sth like Aug 2023
    //firstly get dateoftransact
    let dateofTransact = newModel.dateofTransact
    //now converts to normal date   
    let {month_year} = await convertDate(dateofTransact)



        
    const transact1 = await Model.findOneAndUpdate({_id: newModel._id}, {createAt: create, month_year: month_year}, {new: true, runValidators:true})


    return transact1

}
module.exports = {
    updateDate,
    createDate,
    checkDate,
    checkTime,
    convertDate,
}