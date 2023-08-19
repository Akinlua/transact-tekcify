const express = require('express')
const router = express.Router()
const { dashboard, getTransactions, deleteTransactions, editTransactions, transactPage, createTransactions,changeTransactionsPage, getMonthlyTransactions, genereatePdf,
    genereateExcel, transactSearch, deletedTransactionPage, undoDelete} = require('../controllers/transact')
const {authMiddleware, authAdmin} = require('../middleware/authentication.js')

router.route('/').get(dashboard)
router.route('/').post(dashboard)
router.route('/transactions').get(getTransactions)
router.delete('/transactions/delete/:id',authAdmin, deleteTransactions)
router.get('/transactions-edit/:id',authAdmin, changeTransactionsPage)
router.patch('/edit-transact/:id', authAdmin, editTransactions)
router.get('/add-transact',authAdmin, transactPage)
router.post('/add-transact', authAdmin, createTransactions)

// router.get('/transactions/:id', getOneTransaction)
router.get('/monthly-transactions/:month', getMonthlyTransactions)
//genrate pdf
router.get('/generate-pdf/:month', genereatePdf)
router.get('/generate-excel/:month', genereateExcel)
router.post('/transactions', transactSearch)

// deleted transaction route page
router.get('/deleted-transactions', authAdmin, deletedTransactionPage)
router.post('/transactions-undo/:id', authAdmin, undoDelete)
module.exports = router