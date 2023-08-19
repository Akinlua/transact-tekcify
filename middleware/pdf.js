const fs = require('fs');
const PDFDocument = require('pdfkit');

const axios = require('axios');
const SVGtoPDF = require('svg-to-pdfkit');
const path = require('path')



function generateHeader(doc, month) {


    const imagePath = path.join(__dirname, 'tekcify.png')
    doc.image(imagePath, 50, 45, { width: 50 }) // Replace x, y, and pdfOptions with appropriate values
    .fillColor('#444444')
    .fontSize(20)
    .text('Tekcify.', 110, 57)
    .fontSize(10)
    .fillColor('blue')
    .text('transactions.tekcify.com', 200, 80, { link: 'https://transactions.tekcify.com', align: 'right' })
    .fillColor('#444444') 
    .fontSize(10)
    .text(`${month} List of transactions`, 200, 65, { align: 'right' })
    .moveDown();

}


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
		invoiceTableTop = 180;
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
        "Most Item Bought/ Sold",
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

function createPDF(items, path, month, req, res) {
    //create new PDF
	let doc = new PDFDocument({ margin: 50 });

    //pipe the PDF to the response stream
    const filename = `${month}_transactions.pdf`
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    doc.pipe(res)
    
    //Add content to the PDF
	// generateHeader(doc); // Invoke `generateHeader` function.
	// generateFooter(doc); // Invoke `generateFooter` function.
    generateHeader(doc, month)
    generateInvoiceTable(doc, items)
    // outputStream = fs.createWriteStream(path)
	// doc.pipe(outputStream);

    //finalize the PDF
	doc.end();


    
}
module.exports = {
	createPDF,
};