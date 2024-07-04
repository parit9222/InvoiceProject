import React, { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GeneratePdf() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedUsers } = location.state || { selectedUsers: [] };
    console.log(selectedUsers);

    const getPaymentDetails = (invoiceNumber) => {
        const user = selectedUsers.find(user => user.invoiceNumber === invoiceNumber);
        return user ? { paidAmount: user.paidAmount } : { paidAmount: 0 };
    };
    

    useEffect(() => {
        const generatePdf = () => {
            const doc = new jsPDF();
            
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text("Invoice", 90, 30);
            
            doc.setLineWidth(0.5);
            doc.line(14, 56, 196, 56);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text("Invoice Number: ", 14, 64);
            doc.text(selectedUsers[0]?.invoiceNumber || '', 50, 64);
            doc.text("Date: ", 14, 72);
            doc.text(selectedUsers[0]?.purchaseDate || '', 50, 72);
            doc.text("Customer Name: ", 14, 80);
            doc.text(selectedUsers[0]?.customerName || '', 50, 80);
            doc.text("Customer Mobile: ", 14, 88);
            doc.text(selectedUsers[0]?.customerMobileNumber || '', 50, 88);

            const tableColumn = [
                "Product Name",
                "Quantity",
                "Rate",
                "Amount",
                "Discount %",
                "Discount Amount",
            ];

            const tableRows = [];
            selectedUsers.forEach(user => {
                user.items.forEach(item => {
                    const rowData = [
                        item.productname,
                        item.qty,
                        item.rate,
                        item.amount,
                        item.discountper,
                        item.discountamount,
                    ];
                    tableRows.push(rowData);
                });
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 100,
                theme: 'grid',
                headStyles: { fillColor: [100, 100, 255] },
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 20 },
                    4: { cellWidth: 20 },
                    5: { cellWidth: 20 },
                },
            });

            const paymentDetails = getPaymentDetails(selectedUsers[0]?.invoiceNumber);
            const paidAmount = paymentDetails.paidAmount;
            const pendingAmount = selectedUsers[0]?.totalAmount - paidAmount;

            doc.text("Total Amount: ", 14, doc.lastAutoTable.finalY + 20);
            doc.text(`${selectedUsers[0]?.totalAmount || 0}`, 50, doc.lastAutoTable.finalY + 20);
            doc.text("Paid Amount: ", 14, doc.lastAutoTable.finalY + 28);
            doc.text(`${paidAmount}`, 50, doc.lastAutoTable.finalY + 28);
            doc.text("Pending Amount: ", 14, doc.lastAutoTable.finalY + 36);
            doc.text(`${pendingAmount}`, 50, doc.lastAutoTable.finalY + 36);

            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            URL.revokeObjectURL(pdfUrl);

            navigate('/');
        };

        if (selectedUsers.length > 0) {
            generatePdf();
        }
    }, [selectedUsers, navigate]);

    return null;
}
