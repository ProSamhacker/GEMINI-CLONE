// src/app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { getChatMessages } from '../../../lib/firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { chatId, title } = await req.json();

    const messages = await getChatMessages(chatId);

    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = doc.internal.pageSize.width - 2 * margin;

    // Add title
    doc.setFontSize(18);
    doc.text(title || 'Chat Export', margin, yPosition);
    yPosition += 15;

    // Add messages
    doc.setFontSize(11);
    messages.forEach((message) => {
      const role = message.role === 'user' ? 'You' : 'Gemini';
      const timestamp = new Date(message.timestamp.seconds * 1000).toLocaleString();

      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Role and timestamp
      doc.setFont('helvetica', 'bold');
      doc.text(`${role} - ${timestamp}`, margin, yPosition);
      yPosition += 7;

      // Message content
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(message.content, maxWidth);

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });

      yPosition += 5; // Space between messages
    });

    // Generate PDF as buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title || 'chat'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
