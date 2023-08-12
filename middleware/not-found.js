const noLayout = '../views/layouts/nothing.ejs'


const notFound = (req, res) =>  {return res.render("errors/error-404", {layout: noLayout}) }

module.exports = notFound
