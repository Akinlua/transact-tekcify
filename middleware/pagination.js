

const pagination = async (result, count, req, res ) => {

    let page =Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 10

    console.log("REQ: " + req.query.page)
    // check for limit
    if(req.query.limit <= 0)
        limit = 5

    // check for 0 or less pages
    if(req.query.page <= 0)
        page = 1
    // check for last page
    if(req.query.page >  Math.ceil(count / limit))
        page = Math.ceil(count / limit)

    
    let noOfPages =  Math.ceil(count / limit)
    let skip = (page-1) * limit;

    
    
    result = result.skip(skip).limit(limit)

    const transact = await result
    // next page
    const nextPage = page + 1
    // prev page
    let prevPage = page-1
    let hasNextPage = true
    let hasPrevPage = true
    if(nextPage > Math.ceil(count / limit)) {
        hasNextPage = false
    }
    if(prevPage == 0) {
        hasPrevPage = false
    }

    return {modelinstances: transact, noOfPages: noOfPages, hasNextPage: hasNextPage, 
        hasPrevPage: hasPrevPage, nextPage: nextPage, prevPage: prevPage,page: page, count: count}
    // END PAGINATION
}


module.exports = pagination