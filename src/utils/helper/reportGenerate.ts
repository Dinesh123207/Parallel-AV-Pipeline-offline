import { jsPDF } from 'jspdf';
import combined from '../../../logs/combined_report.json';
import db from '../../../public/db.json';
import pathMapping from '../../../public/path_mapping.json';
import { mapThreatFiles } from './viewLogsHelper';

export function parseThreadFiles(threadFiles: string[]): string[] {
    const replacedThreadFiles = mapThreatFiles(threadFiles, pathMapping);
    // const cleanedThreats = replacedThreadFiles.map((threats: string) => threats.split("->")[0]);

    const uniqueThreats = replacedThreadFiles.reduce((acc: string[], curr: string) => {
        if (!acc.includes(curr)) {
            acc.push(curr);
        }
        return acc;
    }, [] as string[]);

    return uniqueThreats;
}


export function generateReport(timestamp: string): Blob | null {
    const logData = combined.find((d: any) => d.timestamp === timestamp);

    if (!logData) {
        console.error(`No data found for timestamp: ${timestamp}`);
        return null;
    }

    const pdf = new jsPDF();
    const margin = 10;
    const lineHeight = 10;
    let y = margin;

    // Function to handle page breaks
    const handlePageBreak = (pdf: jsPDF, currentY: number, lineHeight: number) => {
        if (currentY + lineHeight > pdf.internal.pageSize.height - margin) {
            pdf.addPage();
            return margin; // Reset y to the top margin of the new page
        }
        return currentY;
    };

    const antivirusLogs = logData.data.antivirus_logs;
    const combinedSummary = logData.data.combined_summary;

    // ** Header Section **
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Antivirus Scan Summary Report', pdf.internal.pageSize.width / 2, y, {
        align: 'center',
    });
    y += lineHeight;

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Report Generated on: ${new Date().toLocaleString()}`, pdf.internal.pageSize.width / 2, y, {
        align: 'center',
    });
    y += lineHeight * 2;

    // ** Combined Summary **
    pdf.setFont('Helvetica', 'bold');
    pdf.text('Combined Summary', margin, y);
    y += lineHeight;

    pdf.setFont('Helvetica', 'normal');
    pdf.text(`Total Unique Threat Files Detected: ${combinedSummary.total_threat_files}`, margin, y);
    y += lineHeight;

    pdf.text('Unique Infected File Paths:', margin, y);
    y += lineHeight;
    if (combinedSummary.unique_threat_file_paths.length > 0) {
        parseThreadFiles(combinedSummary.unique_threat_file_paths).forEach((path: string) => {
            y = handlePageBreak(pdf, y, lineHeight); // Handle page break
            pdf.text(`  - ${path}`, margin + 10, y);
            y += lineHeight;
        });
    } else {
        y = handlePageBreak(pdf, y, lineHeight); // Handle page break
        pdf.text('  None', margin + 10, y);
        y += lineHeight;
    }

    // ** Threat Details **
    const windowsDefenderThreat = antivirusLogs['Windows Defender']?.WindowsDefender?.threat_name;
    const threatDetails = db.find((data: any) => data.threat_name === windowsDefenderThreat);

    pdf.setFont('Helvetica', 'bold');
    pdf.text('Threat Details', margin, y);
    y += lineHeight;

    if (threatDetails) {
        pdf.setFont('Helvetica', 'normal');
        pdf.text(`Name: ${threatDetails.threat_name}`, margin, y);
        y += lineHeight;
        y = handlePageBreak(pdf, y, lineHeight); // Handle page break
        pdf.text(`Description: ${threatDetails.details.description}`, margin, y);
        y += lineHeight;
        y = handlePageBreak(pdf, y, lineHeight); // Handle page break
        pdf.text(`Severity: ${threatDetails.details.severity}`, margin, y);
        y += lineHeight;
        pdf.text(`Recommendation: ${threatDetails.details.recommendation}`, margin, y);
        y += lineHeight;
    } else {
        pdf.text('No specific threat details found in the database.', margin, y);
        y += lineHeight;
    }

    // ** Detailed Antivirus Logs **
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('Detailed Antivirus Logs', margin, y);
    y += lineHeight;

    for (const [antivirusName, antivirusData] of Object.entries(antivirusLogs)) {
        const details = (antivirusData as any)[Object.keys(antivirusData as any)[0]];

        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(12);
        y = handlePageBreak(pdf, y, lineHeight); // Handle page break
        pdf.text(`${antivirusName}`, margin, y);
        y += lineHeight;

        pdf.setFont('Helvetica', 'normal');
        pdf.text(`Total Threat Files: ${details.total_threat_files || details.total_threats_detected || 'N/A'}`, margin, y);
        y += lineHeight;

        if (antivirusName === 'Windows Defender') {
            pdf.text(`Threat Name: ${details.threat_name || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text('Threat Files:', margin, y);
            y += lineHeight;

            if (details.threat_files && details.threat_files.length > 0) {
                parseThreadFiles(details.threat_files).forEach((file: string) => {
                    y = handlePageBreak(pdf, y, lineHeight); // Handle page break
                    pdf.text(`  - ${file}`, margin + 10, y);
                    y += lineHeight;
                });
            } else {
                pdf.text('  None', margin + 10, y);
                y += lineHeight;
            }
        } else if (antivirusName === 'CLAMAV') {
            pdf.text(`Total Files Scanned: ${details.total_files_scanned || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Scan Time: ${details.scan_time || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Scanned Directories: ${details.scanned_directories || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Data Scanned: ${details.data_scanned || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text('Threat Files:', margin, y);
            y += lineHeight;

            if (details.threat_files && details.threat_files.length > 0) {
                parseThreadFiles(details.threat_files).forEach((file: any) => {
                    y = handlePageBreak(pdf, y, lineHeight); // Handle page break
                    pdf.text(`  - ${file.path}`, margin + 10, y);
                    y += lineHeight;
                });
            } else {
                pdf.text('  None', margin + 10, y);
                y += lineHeight;
            }
        } else if (antivirusName === 'ESET AV') {
            pdf.text(`Total Files Scanned: ${details.total_files_scanned || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Scan Time: ${details.scan_time || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text('Threat Files:', margin, y);
            y += lineHeight;

            if (details.threat_file_paths && details.threat_file_paths.length > 0) {
                parseThreadFiles(details.threat_file_paths).forEach((file: string) => {
                    y = handlePageBreak(pdf, y, lineHeight); // Handle page break
                    pdf.text(`  - ${file}`, margin + 10, y);
                    y += lineHeight;
                });
            } else {
                pdf.text('  None', margin + 10, y);
                y += lineHeight;
            }
        }
        else if (antivirusName === 'KASPERSKY') {
            console.log(details)
            pdf.text(`Total Files Scanned: ${details.total_files_scanned || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Total Detected Files: ${details.total_detected_files || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Total OK Files: ${details.total_ok_files || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Total Suspicions: ${details.total_suspicions || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Password Protected Files: ${details.password_protected || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text(`Scan Time: ${details.scan_time || 'N/A'}`, margin, y);
            y += lineHeight;
            pdf.text('Threat Files:', margin, y);
            y += lineHeight;

            if (details.threat_files && details.threat_files.length > 0) {
                details.threat_files.forEach((file: any) => {
                    y = handlePageBreak(pdf, y, lineHeight); // Handle page break
                    pdf.text(`  - ${file.path}`, margin + 10, y);
                    y += lineHeight;
                });
            } else {
                pdf.text('  None', margin + 10, y);
                y += lineHeight;
            }
        }
    }

    // Generate Blob
    const pdfBlob = pdf.output('blob');
    if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `REPORT_${timestamp}.pdf`; // Simulating the logs folder
        a.click();
        URL.revokeObjectURL(url);
    } else {
        console.error('Failed to generate the report.');
    }

    return pdfBlob;
}
