import React, { useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useLocation, useNavigate } from 'react-router-dom';

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export default function GeneratePdf() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedUsers } = location.state || { selectedUsers: [] };
    const emailSent = useRef(false);

    const getPaymentDetails = (invoiceNumber) => {
        const user = selectedUsers.find(user => user.invoiceNumber === invoiceNumber);
        return user ? { paidAmount: user.paidAmount } : { paidAmount: 0 };
    };

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

        return doc.output('blob'); 
    };

    const handleSendEmail = async (pdfBlob) => {
        try {
            const pdfBase64 = await blobToBase64(pdfBlob);

            const emailData = {
                email: 'jenilmalaviya980@gmail.com',
                subject: 'Your Invoice PDF',
                text: 'Please find attached your invoice PDF.',
                attachments: [
                    {
                        filename: 'invoice.pdf',
                        content: pdfBase64,
                        encoding: 'base64'
                    }
                ]
            };

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (response.ok) {
                console.log('Email sent successfully');
            } else {
                console.error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    useEffect(() => {
        if (!emailSent.current) {
            const pdfBlob = generatePdf();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            handleSendEmail(pdfBlob);

            emailSent.current = true;
        }

        navigate('/');
    }, [selectedUsers, navigate]);

    return null;
}
