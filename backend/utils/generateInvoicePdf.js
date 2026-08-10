const PDFDocument = require("pdfkit");

const BRAND = {
  name: "MediCare Hospital",
  tagline: "Advanced Care, Simplified",
  address: "No. 45, Lotus Avenue, Colombo 07, Sri Lanka",
  email: "billing@medicare.health",
  phone: "+94 11 234 5678",
  primaryColor: "#0f4c4c",
  darkColor: "#20262b",
  mutedColor: "#5c6670",
};

const formatCurrency = (value = 0) => `Rs. ${Number(value).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

/**
 * Streams a PDF invoice directly to the HTTP response.
 * @param {import('express').Response} res
 * @param {object} bill - a populated Billing mongoose document
 */
const streamInvoicePdf = (res, bill) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${bill.invoiceNumber}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fillColor(BRAND.primaryColor).fontSize(22).text(BRAND.name, 50, 50, { continued: false });
  doc.fillColor(BRAND.mutedColor).fontSize(10).text(BRAND.tagline);
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor(BRAND.mutedColor).text(BRAND.address).text(`${BRAND.email}  |  ${BRAND.phone}`);

  doc.fillColor(BRAND.darkColor).fontSize(18).text("INVOICE", 400, 50, { align: "right" });
  doc.fontSize(10).fillColor(BRAND.mutedColor).text(`# ${bill.invoiceNumber}`, 400, 75, { align: "right" });
  doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 400, 90, { align: "right" });

  doc.moveDown(3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
  doc.moveDown(1);

  // Billed to
  doc.fillColor(BRAND.darkColor).fontSize(11).text("Billed To", 50, doc.y);
  doc.fontSize(10).fillColor(BRAND.mutedColor);
  doc.text(bill.patient?.user?.name || "N/A");
  doc.text(bill.patient?.user?.email || "");
  doc.text(bill.patient?.user?.phone || "");

  doc.moveDown(1.5);

  // Table header
  const tableTop = doc.y;
  doc.fontSize(10).fillColor("#fff");
  doc.rect(50, tableTop, 495, 22).fill(BRAND.primaryColor);
  doc.fillColor("#fff").text("Description", 60, tableTop + 6);
  doc.text("Qty", 320, tableTop + 6, { width: 40, align: "right" });
  doc.text("Unit Price", 370, tableTop + 6, { width: 80, align: "right" });
  doc.text("Total", 460, tableTop + 6, { width: 75, align: "right" });

  let rowY = tableTop + 22;
  doc.fillColor(BRAND.darkColor);
  (bill.items || []).forEach((item, idx) => {
    const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
    doc.rect(50, rowY, 495, 22).fill(bg);
    doc.fillColor(BRAND.darkColor).fontSize(10);
    doc.text(item.description, 60, rowY + 6, { width: 250 });
    doc.text(String(item.quantity), 320, rowY + 6, { width: 40, align: "right" });
    doc.text(formatCurrency(item.unitPrice), 370, rowY + 6, { width: 80, align: "right" });
    doc.text(formatCurrency(item.total), 460, rowY + 6, { width: 75, align: "right" });
    rowY += 22;
  });

  doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor("#e2e8f0").stroke();
  rowY += 12;

  const summaryLine = (label, value, bold = false) => {
    doc.fontSize(bold ? 12 : 10).fillColor(bold ? BRAND.darkColor : BRAND.mutedColor);
    doc.text(label, 350, rowY, { width: 110, align: "right" });
    doc.text(value, 460, rowY, { width: 75, align: "right" });
    rowY += bold ? 20 : 16;
  };

  summaryLine("Subtotal", formatCurrency(bill.subTotal));
  summaryLine("Discount", `- ${formatCurrency(bill.discount)}`);
  summaryLine("Tax", formatCurrency(bill.tax));
  summaryLine("Grand Total", formatCurrency(bill.grandTotal), true);
  summaryLine("Amount Paid", formatCurrency(bill.amountPaid));
  summaryLine("Balance Due", formatCurrency(Math.max(bill.grandTotal - bill.amountPaid, 0)));

  doc.moveDown(3);
  doc.fontSize(9).fillColor(BRAND.mutedColor);
  doc.text(`Payment Status: ${bill.paymentStatus.toUpperCase()}`, 50, rowY + 20);
  doc.text("Thank you for choosing MediCare Hospital. This is a system-generated invoice.", 50, rowY + 36);

  doc.end();
};

module.exports = { streamInvoicePdf };
