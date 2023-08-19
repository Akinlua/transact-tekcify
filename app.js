require('dotenv').config()
require('express-async-errors');
const bodyParser = require('body-parser')
const connectDB = require('./db/connect')
const mainRouter = require('./routes/main')
const userRouter = require('./routes/User')
const methodOverride = require('method-override')
const express = require('express')
const expressLayout = require('express-ejs-layouts')
const {createMonthlyRecords, reset_day, createYearlyRecords} = require('./middleware/cron')
const {authMiddleware} = require('./middleware/authentication')

const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const session = require('express-session')

const Chart = require('chart.js')
const Canvas = require('canvas')
const path = require('path')
const {Month} = require('./model/monthTransact')
const noLayout = '../views/layouts/nothing.ejs'

// //extra security packages
// const helmet = require('helmet')
// const cors = require('cors')
// const xss = require('xss-clean')


//CRON JOB
var cron = require('node-cron')

cron.schedule('59 59 23 28-31 * *', createMonthlyRecords)
cron.schedule('59 59 23 31 12 *', createYearlyRecords)
// cron.schedule('* * * * * *', createMonthlyRecords)
// cron.schedule('0 0 * * *', createMonthlyRecords)
// cron.schedule('* * * * *', reset_day)
cron.schedule('59 59 23 * * *', reset_day)





// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const app = express()


app.use(bodyParser.json())


app.use(expressLayout)
app.set('layout', './layouts/index')
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    // cookie: { maxAge: new Date ( Date.n00ow() + (36000) ) } 

}))

// app.use(helmet())
// app.use(cors())
// app.use(xss())

app.use(express.static('public'))
app.use('', userRouter)
app.use('', authMiddleware, mainRouter)

app.get('/line-graph', async (req, res) => {


    const month_year = await Month.find({})

    //only if there is total revenue , there will be graph
    let monthYear_arr  = []
    let Total_Revenue_arr = []

    if (!month_year) {
        return res.status(404).json({message: "There isn't any month reecords"})
    }
    month_year.forEach(tran => {
        monthYear_arr.push(tran.month)
        Total_Revenue_arr.push(tran.Total_Revenue)
    });

    console.log(monthYear_arr, Total_Revenue_arr)
    res.render('line-chart', {layout:noLayout,  monthYear_arr, Total_Revenue_arr})
})


//error handler
app.use(errorHandlerMiddleware);

app.use(notFoundMiddleware);






const port = process.env.PORT || 3000


const start = async () => {
    try{
        //connect DB
        await connectDB()
        console.log("Connected to DB")
        app.listen(port,  "0.0.0.0", console.log(`Server is listening to port ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start();
