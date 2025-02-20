const fs = require('fs');
const path = require('path');
const pdf = require('pdfkit');

// Helper function to create a formatted date for the receipt
const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
};

const generateReceipt = (studentName, totalFee, paymentId, filePath) => {
    console.log("Generating professional receipt...");

    // Create a new PDF document
    const doc = new pdf({ size: 'A4', margin: 50 });

    doc.pipe(fs.createWriteStream(filePath));

    // Add the header with branding
    doc.fontSize(16).font('Helvetica-Bold').text('Kodu', { align: 'left' });
    doc.fontSize(12).font('Helvetica').text('Powered By Dhurina', { align: 'left' });

    // Add a line for separation
    doc.moveDown().strokeColor('black').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke();

    // Title of the receipt
    doc.moveDown(2).fontSize(22).font('Helvetica-Bold').text('Payment Receipt', { align: 'center' });

    // Add the student details section
    doc.moveDown().fontSize(12).font('Helvetica').text(`Student Name: ${studentName}`);
    doc.text(`Date: ${getFormattedDate()}`);
    doc.text(`Payment ID: ${paymentId}`);
    
    // Payment details
    doc.moveDown().text(`Total Fee Paid: ₹${totalFee}`);
    
    // Footer
    doc.moveDown().fontSize(10).font('Helvetica').text('Thank you for choosing Kodu!', { align: 'center' });
    doc.text('For any queries, contact support@kodu.com', { align: 'center' });

    // Add the company logo at the bottom (if available)
    // doc.image(path.join(__dirname, 'logo.png'), 200, 650, { width: 100 });

    doc.end();

    // Log after document is finished
    doc.on('end', () => {
        console.log(`Receipt generated at: ${filePath}`);
    });

    return filePath;
};

module.exports = generateReceipt;
