'use client';

import { jsPDF } from 'jspdf';

interface DownloadCertificateButtonProps {
  certificateData: {
    studentName: string;
    courseName: string;
    duration: number | null;
    verificationCode: string;
    issueDate: string;
    instructorName: string;
    instructorRole: string;
  };
}

export default function DownloadCertificateButton({
  certificateData,
}: DownloadCertificateButtonProps) {
  const generatePDF = async () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Fondo del certificado con borde decorativo
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Borde exterior
    doc.setDrawColor(37, 99, 235); // blue-600
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

    // Borde interior
    doc.setDrawColor(99, 102, 241); // indigo-500
    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');

    // Cargar y agregar logo PNG
    try {
      const logoUrl = 'https://zksisjytdffzxjtplwsd.supabase.co/storage/v1/object/public/images/team/logo_oficial_png.png';

      // Crear imagen y esperar a que cargue
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = logoUrl;
      });

      // Agregar logo al PDF (centrado arriba del nombre de la empresa)
      const logoSize = 15; // tamaño del logo en mm
      doc.addImage(img, 'PNG', pageWidth / 2 - logoSize / 2, 20, logoSize, logoSize);
    } catch (error) {
      console.error('Error cargando logo:', error);
      // Continuar sin logo si hay error
    }

    // Logo/Encabezado - "Iron Makers & AI"
    doc.setFontSize(32);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.setFont('helvetica', 'bold');
    doc.text('Iron Makers & AI', pageWidth / 2, 45, { align: 'center' });

    // Línea decorativa
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 50, 50, pageWidth / 2 + 50, 50);

    // Título "CERTIFICADO"
    doc.setFontSize(28);
    doc.setTextColor(55, 65, 81); // gray-700
    doc.text('CERTIFICADO DE FINALIZACIÓN', pageWidth / 2, 65, {
      align: 'center',
    });

    // Texto "Se otorga a"
    doc.setFontSize(14);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.setFont('helvetica', 'normal');
    doc.text('Se otorga a', pageWidth / 2, 80, { align: 'center' });

    // Nombre del estudiante
    doc.setFontSize(24);
    doc.setTextColor(17, 24, 39); // gray-900
    doc.setFont('helvetica', 'bold');
    doc.text(certificateData.studentName, pageWidth / 2, 95, {
      align: 'center',
    });

    // Línea debajo del nombre
    doc.setDrawColor(209, 213, 219); // gray-300
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 60, 98, pageWidth / 2 + 60, 98);

    // Texto "Por completar exitosamente"
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text('Por completar exitosamente el curso', pageWidth / 2, 110, {
      align: 'center',
    });

    // Limpiar texto de caracteres no soportados (emojis, etc)
    const cleanText = (text: string) => {
      return text
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[^\u0000-\u00FF]/g, '') // Eliminar caracteres fuera de Latin-1
        .trim();
    };

    // Nombre del curso
    let fontSize = 20;
    doc.setFontSize(fontSize);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.setFont('helvetica', 'bold');

    const cleanedCourseName = cleanText(certificateData.courseName);
    // Reducir ancho máximo a 170mm para evitar cortes
    let courseNameLines = doc.splitTextToSize(cleanedCourseName, 170);

    // Si el título es muy largo (más de 2 líneas), reducir el tamaño de fuente
    if (courseNameLines.length > 2) {
      fontSize = 16;
      doc.setFontSize(fontSize);
      courseNameLines = doc.splitTextToSize(cleanedCourseName, 170);
    }

    doc.text(courseNameLines, pageWidth / 2, 122, { align: 'center' });

    // Duración del curso (si está disponible)
    if (certificateData.duration) {
      const hours = Math.floor(certificateData.duration / 60);
      const minutes = certificateData.duration % 60;
      let durationText = 'Duración: ';

      if (hours > 0) {
        durationText += `${hours} hora${hours !== 1 ? 's' : ''}`;
        if (minutes > 0) {
          durationText += ` ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        }
      } else {
        durationText += `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      }

      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(durationText, pageWidth / 2, 135, { align: 'center' });
    }

    // Fecha de emisión
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Fecha de emisión: ${new Date(certificateData.issueDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      pageWidth / 2,
      certificateData.duration ? 145 : 140,
      { align: 'center' }
    );

    // Sección de firma con sello
    const signatureY = 155;
    const sealX = pageWidth / 2 + 60; // Posición del sello a la derecha
    const sealY = signatureY;
    const sealRadius = 22;

    // Dibujar sello circular con código de verificación
    // Círculo exterior (borde azul)
    doc.setDrawColor(37, 99, 235); // blue-600
    doc.setLineWidth(1.5);
    doc.circle(sealX, sealY, sealRadius, 'S');

    // Círculo interior
    doc.setLineWidth(0.5);
    doc.circle(sealX, sealY, sealRadius - 3, 'S');

    // Texto del sello - parte superior curva "IRON MAKERS & AI"
    doc.setFontSize(7);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('IRON MAKERS & AI', sealX, sealY - 10, { align: 'center' });

    // Texto del sello - "CERTIFICADO"
    doc.setFontSize(6);
    doc.text('CERTIFICADO', sealX, sealY - 5, { align: 'center' });

    // Código de verificación en el centro del sello
    doc.setFontSize(6);
    doc.setFont('courier', 'bold');
    const codeLines = certificateData.verificationCode.match(/.{1,8}/g) || [];
    let codeY = sealY - 1;
    codeLines.forEach((line, index) => {
      doc.text(line, sealX, codeY + (index * 3), { align: 'center' });
    });

    // Texto inferior del sello
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('VERIFICACIÓN', sealX, sealY + 12, { align: 'center' });

    // Línea de firma (a la izquierda del sello)
    doc.setDrawColor(107, 114, 128);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 60, signatureY + 5, pageWidth / 2 + 20, signatureY + 5);

    // Nombre del instructor
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text(certificateData.instructorName, pageWidth / 2 - 20, signatureY + 12, {
      align: 'center',
    });

    // Rol del instructor
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(certificateData.instructorRole, pageWidth / 2 - 20, signatureY + 17, {
      align: 'center',
    });

    // Nota de verificación en el pie
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Este certificado puede ser verificado usando el código mostrado en el sello oficial',
      pageWidth / 2,
      pageHeight - 18,
      { align: 'center' }
    );

    // Guardar el PDF
    const fileName = `Certificado_${cleanedCourseName.replace(/\s+/g, '_')}_${certificateData.studentName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <button
      onClick={generatePDF}
      className="w-full bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Descargar Certificado
    </button>
  );
}
