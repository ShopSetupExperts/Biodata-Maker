import jsPDF from 'jspdf';
import { BioData, SectionDetails, SectionList } from '../types';

export const generatePDF = (data: BioData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // Reduced margin for compactness
  const contentWidth = pageWidth - (margin * 2);
  
  let yPos = margin;

  // -- Helper Functions --
  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const drawLine = (y: number) => {
    doc.setDrawColor(217, 119, 6); // amber-600
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const addSectionTitle = (title: string, y: number) => {
    checkPageBreak(15);
    doc.setFont("times", "bold");
    doc.setFontSize(13); // Slightly smaller for compactness
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(title.toUpperCase(), margin, y);
    drawLine(y + 1.5);
    return y + 8;
  };

  const addField = (label: string, value: string, y: number, isLong = false): number => {
    doc.setFont("times", "bold");
    doc.setFontSize(10.5); // Compact font
    doc.setTextColor(71, 85, 105); // slate-600
    
    // Check height before rendering
    // Estimate height: usually 1 line (6mm) or more
    
    const labelWidth = 45;
    const valueX = margin + labelWidth;
    const maxValueWidth = contentWidth - labelWidth;

    doc.setFont("times", "normal"); // Switch to normal to calculate text size
    const splitTitle = doc.splitTextToSize(value, maxValueWidth);
    const heightNeeded = (splitTitle.length * 5) + 2; // Compact line height

    if (checkPageBreak(heightNeeded)) {
        y = yPos;
    }

    // Render Label
    doc.setFont("times", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(label + ":", margin, y);

    // Render Value
    doc.setFont("times", "normal");
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(splitTitle, valueX, y);
    
    return y + heightNeeded; 
  };

  // -- BORDER --
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(1);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // -- IMAGE (Centered Top) --
  if (data.imageUrl) {
     try {
        const imgSize = 35; // Size in mm (Compact)
        const xPos = (pageWidth - imgSize) / 2;
        doc.addImage(data.imageUrl, 'JPEG', xPos, yPos, imgSize, imgSize);
        yPos += imgSize + 5; 
     } catch (e) {
         console.warn("Could not add image to PDF", e);
     }
  } else {
      yPos += 5;
  }

  // -- HEADER --
  yPos += 8;
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text("BIO DATA", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 12;

  // -- SUMMARY --
  if (data.summary) {
    yPos = addSectionTitle("Professional Summary", yPos);
    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    const splitSummary = doc.splitTextToSize(data.summary, contentWidth);
    doc.text(splitSummary, margin, yPos);
    yPos += (splitSummary.length * 5) + 4;
  }

  // -- DYNAMIC SECTIONS --
  data.sections.forEach((section) => {
      // Skip empty sections? No, user might want to see headers. 
      // But for "deletable" requirement, if user deleted all fields, we assume they removed the section in the UI.
      // Here we render whatever is in the data.
      
      yPos = addSectionTitle(section.title, yPos);

      if (section.type === 'details') {
          const details = section as SectionDetails;
          details.fields.forEach(field => {
              if (field.value.trim()) { // Only print if has value
                  yPos = addField(field.label, field.value, yPos, field.value.length > 30);
              }
          });
      } else if (section.type === 'list') {
          const list = section as SectionList;
          doc.setFont("times", "normal");
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          
          list.items.forEach(item => {
              if (item.trim()) {
                  const splitItem = doc.splitTextToSize("• " + item, contentWidth);
                  const height = splitItem.length * 5;
                  if (checkPageBreak(height)) {
                      yPos = addSectionTitle(section.title + " (Cont.)", yPos); // Re-add title if broken? Or just continue
                      // Actually addSectionTitle advances Y, so we just continue text
                  }
                  doc.text(splitItem, margin, yPos);
                  yPos += height + 1; // Small spacing
              }
          });
          yPos += 2;
      }
      
      yPos += 3; // Section spacing
  });

  // -- FOOTER --
  const today = new Date().toLocaleDateString();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated on: ${today}`, margin, pageHeight - 12);

  // Find name for filename
  let filename = "BioData";
  for(const s of data.sections) {
      if(s.type === 'details') {
          const nameField = (s as SectionDetails).fields.find(f => f.label.toLowerCase() === 'name');
          if(nameField) filename = nameField.value.replace(/\s+/g, '_');
      }
  }

  doc.save(`${filename}_BioData.pdf`);
};