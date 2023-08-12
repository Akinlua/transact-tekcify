const fs = require('fs');
const PDFDocument = require('pdfkit');



function generateTableRow(doc, y, c1, c2, c3, c4, c5, Bold) {
	doc.fontSize(10)
		.text(c1, 50, y, {bold: Bold})
		.text(c2, 150, y, {bold: Bold})
		.text(c3, 230, y, { bold: Bold, width: 90, align: 'left' })
		.text(c4, 370, y, { bold: Bold, width: 90, align: 'left' })
		.text(c5, 0, y, { bold: Bold, align: 'right' });
        
}

function generateInvoiceTable(doc, items) {
	let i,
		invoiceTableTop = 50;
    const position = invoiceTableTop;
    generateTableRow(
        doc,
        position,
        "Company\'s Acc",
        "Amount",
        "Individual\'s Acc",
        "Payment Gateway",
        "Type of Payment",
        true,
    );

	for (i = 0; i < items.length; i++) {
		const item = items[i];
		const position = invoiceTableTop + (i + 1) * 30;
        newTop = position
		generateTableRow(
			doc,
			position,
			item.companyAcc,
			item.Amount,
			item.IndividualAcc,
			item.paymentGateway,
			item.Type,
            false,
		);
        //check if a new page is needed, then reset invoiceTbaleTop,
        if(doc.y >= doc.page.height - doc.page.margins.top - doc.page.margins.bottom) {
            doc.addPage()
            invoiceTableTop = 20
        }
	}
    doc.moveDown();

    //new table

    if(doc.y >= doc.page.height - doc.page.margins.top - doc.page.margins.bottom) {
        doc.addPage()
        invoiceTableTop = 20
    }

    newTop = newTop + 100;
    const position2 = newTop
    generateTableRow(
        doc,
        position2,
        "Date of Transact",
        "Time of Transact",
        "Transaction ID",
        "Item Bought/ Sold",
        "Created",
        true,
    );
    
    for (i = 0; i < items.length; i++) {
		const item = items[i];
		const position2 = newTop + (i + 1) * 30;
		generateTableRow(
			doc,
            position2,
            item.dateofTransact,
            item.timeofTransact,
            item.TransactionId,
            item.itemBoughtSold,
            item.createAt,
            false,
		);
	}

}

function createPDF(items, path, req, res) {
    //create new PDF
	let doc = new PDFDocument({ margin: 50 });

    //pipe the PDF to the response stream
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.pdf"')
    doc.pipe(res)
    
    //Add content to the PDF
	// generateHeader(doc); // Invoke `generateHeader` function.
	// generateFooter(doc); // Invoke `generateFooter` function.
    generateInvoiceTable(doc, items)
    // outputStream = fs.createWriteStream(path)
	// doc.pipe(outputStream);

    //finalize the PDF
	doc.end();

    console.log('check')

    
}
module.exports = {
	createPDF,
};