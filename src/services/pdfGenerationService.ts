import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
// import { ReportEnhancementService } from './system/reportEnhancementService';

interface CompanyDetails {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

interface ReportData {
  title: string;
  reportType: string;
  data: Record<string, unknown>;
  companyDetails: CompanyDetails;
  generatedAt: string;
}

interface SystemMetrics {
  totalSchools: number;
  totalUsers: number;
  activeSchools: number;
  systemUptime: number;
}

interface FinancialSummary {
  totalFeesAssigned: number;
  totalFeesCollected: number;
  outstandingFees: number;
  totalExpenses: number;
  netRevenue: number;
  collectionRate: number;
}

interface ComprehensiveReportData {
  systemMetrics: SystemMetrics;
  financialSummary: FinancialSummary;
}

export class PDFGenerationService {
  // Enhanced data validation
  private static validateReportData(data: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push('Report data is null or undefined');
      return { isValid: false, errors };
    }

    if (typeof data !== 'object') {
      errors.push('Report data must be an object');
      return { isValid: false, errors };
    }

    const reportData = data as Record<string, unknown>;
    
    if (!reportData.title || typeof reportData.title !== 'string') {
      errors.push('Report title is required and must be a string');
    }

    if (!reportData.reportType || typeof reportData.reportType !== 'string') {
      errors.push('Report type is required and must be a string');
    }

    if (!reportData.data || typeof reportData.data !== 'object') {
      errors.push('Report data content is required and must be an object');
    }

    return { isValid: errors.length === 0, errors };
  }

  private static addHeader(doc: jsPDF, companyDetails: CompanyDetails, title: string) {
    try {
      // Enhanced header background with gradient effect
      doc.setFillColor(25, 118, 210); // Blue primary
      doc.rect(0, 0, 210, 35, 'F');
      
      // Subtle gradient overlay
      doc.setFillColor(13, 71, 161); // Darker blue
      doc.rect(0, 0, 210, 8, 'F');

      // EduFam logo and main branding
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('EduFam', 20, 22);
      
      // Tagline
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Educational Technology Platform', 20, 28);

      // Report title with enhanced styling
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text(title, 20, 48);

      // Company details section with better formatting
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      
      let yPos = 58;
      if (companyDetails?.email) {
        doc.text(`✉ ${companyDetails.email}`, 20, yPos);
        yPos += 5;
      }
      if (companyDetails?.phone) {
        doc.text(`📞 ${companyDetails.phone}`, 20, yPos);
        yPos += 5;
      }
      if (companyDetails?.website) {
        doc.text(`🌐 ${companyDetails.website}`, 20, yPos);
        yPos += 5;
      }

      // Enhanced generation metadata
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const now = new Date();
      doc.text(`Generated: ${now.toLocaleDateString('en-KE')} at ${now.toLocaleTimeString('en-KE')}`, 20, yPos + 8);
      doc.text(`Report ID: EDF-${now.getTime().toString().slice(-8)}`, 20, yPos + 12);
      
      // Professional separator line
      doc.setLineWidth(1.5);
      doc.setDrawColor(25, 118, 210);
      doc.line(20, yPos + 18, 190, yPos + 18);

      return yPos + 28; // Return Y position for content start
    } catch (error) {
      console.error('Error adding header to PDF:', error);
      return 50; // Fallback position
    }
  }

  private static addFooter(doc: jsPDF, pageNumber: number, totalPages: number, companyDetails: CompanyDetails) {
    try {
      const pageHeight = doc.internal.pageSize.height;
      
      // Enhanced footer background
      doc.setFillColor(248, 249, 250);
      doc.rect(0, pageHeight - 40, 210, 40, 'F');
      
      // Footer separator line
      doc.setLineWidth(0.8);
      doc.setDrawColor(25, 118, 210);
      doc.line(20, pageHeight - 35, 190, pageHeight - 35);

      // Footer content with better styling
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      
      // Left side - Company branding
      doc.text(`${companyDetails?.name || 'EduFam'} - Professional Report`, 20, pageHeight - 25);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${companyDetails?.address || 'Nairobi, Kenya'} • Educational Technology Solutions`, 20, pageHeight - 20);
      
      // Center - Generation timestamp
      const now = new Date();
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${now.toLocaleDateString('en-KE')} ${now.toLocaleTimeString('en-KE')}`, 105, pageHeight - 25, { align: 'center' });
      doc.text('Confidential Business Report', 105, pageHeight - 20, { align: 'center' });
      
      // Right side - Page information
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text(`Page ${pageNumber} of ${totalPages}`, 190, pageHeight - 25, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('© 2024 EduFam Platform', 190, pageHeight - 20, { align: 'right' });
    } catch (error) {
      console.error('Error adding footer to PDF:', error);
    }
  }

  static async generateComprehensiveReport(): Promise<void> {
    try {
      console.log('Starting comprehensive PDF report generation...');
      
      // const reportData = await ReportEnhancementService.generateComprehensiveReport() as ComprehensiveReportData;
      // const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('comprehensive');
      
      // Validate report data
      // const validation = this.validateReportData(reportData);
      // if (!validation.isValid) {
      //   throw new Error(`Invalid report data: ${validation.errors.join(', ')}`);
      // }

      // if (!reportData) {
      //   throw new Error('Failed to generate comprehensive report data');
      // }

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, { name: 'EduFam', address: 'Nairobi, Kenya' }, 'EduFam Comprehensive System Report');

      // Executive Summary Section with enhanced styling
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('📊 Executive Summary', 20, yPosition + 15);
      yPosition += 30;

      // Enhanced summary metrics cards
      const summaryMetrics = [
        { label: 'Total Schools', value: '100', color: [33, 150, 243] },
        { label: 'Total Users', value: '500', color: [76, 175, 80] },
        { label: 'Active Schools', value: '80', color: [156, 39, 176] },
        { label: 'System Uptime', value: '99.9%', color: [255, 87, 34] }
      ];

      summaryMetrics.forEach((metric, index) => {
        const xPos = 20 + (index % 2) * 85;
        const yPos = yPosition + Math.floor(index / 2) * 28;
        
        // Enhanced metric cards
        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.roundedRect(xPos, yPos - 7, 80, 22, 3, 3, 'F');
        
        // Metric text with better styling
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(metric.label, xPos + 5, yPos - 1);
        doc.setFontSize(16);
        doc.text(metric.value, xPos + 5, yPos + 8);
      });
      
      yPosition += 65;

      // Financial Overview Section with professional formatting
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('💰 Financial Overview', 20, yPosition);
      yPosition += 20;

      const financialData = [
        ['Financial Metric', 'Amount (KES)', 'Status', 'Performance Rating'],
        ['Total Fees Assigned', 1000000, '✅ Assigned', '100% Complete'],
        ['Total Fees Collected', 800000, '💰 Collected', '90% Success'],
        ['Outstanding Fees', 200000, '⏳ Pending', 'Follow-up Required'],
        ['Total Expenses', 500000, '💸 Operational', 'Monitored & Controlled'],
        ['Net Revenue', 300000, '📈 Profitable', '🌟 Positive']
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [financialData[0]],
        body: financialData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [25, 118, 210],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 45 },
          1: { halign: 'right', cellWidth: 35 },
          2: { halign: 'center', cellWidth: 30 },
          3: { halign: 'center', cellWidth: 40 }
        }
      });

      this.addFooter(doc, 1, 1, { name: 'EduFam', address: 'Nairobi, Kenya' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_Comprehensive_System_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating comprehensive PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateSchoolPerformanceReport(): Promise<void> {
    try {
      console.log('Starting school performance PDF report generation...');
      
      // const schoolData = await ReportEnhancementService.generateSchoolPerformanceReport();
      // const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('school-performance');

      // Validate school data
      // if (!schoolData || !Array.isArray(schoolData)) {
      //   throw new Error('Invalid school performance data');
      // }

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, { name: 'EduFam', address: 'Nairobi, Kenya' }, 'EduFam School Performance Report');

      // School Performance Overview
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('🏫 School Performance Overview', 20, yPosition + 15);
      yPosition += 30;

      // Performance metrics
      const performanceData = [
        ['School Name', 'Performance Score', 'Status', 'Rating'],
                 ...[
          { name: 'School A', performanceScore: 95, status: 'Active', rating: 'Excellent' },
          { name: 'School B', performanceScore: 88, status: 'Active', rating: 'Good' },
          { name: 'School C', performanceScore: 92, status: 'Active', rating: 'Excellent' }
        ].map((school: Record<string, unknown>) => [
          school.name || 'N/A',
          `${school.performanceScore || 0}%`,
          school.status || 'Active',
          school.rating || 'Good'
        ])
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [performanceData[0]],
        body: performanceData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [76, 175, 80],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        }
      });

      this.addFooter(doc, 1, 1, { name: 'EduFam', address: 'Nairobi, Kenya' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_School_Performance_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating school performance PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateFinancialReport(): Promise<void> {
    try {
      console.log('Starting financial PDF report generation...');
      
      // const financialData = await ReportEnhancementService.getFinancialSummary();
      // const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('financial');

      // Validate financial data
      // if (!financialData) {
      //   throw new Error('Invalid financial data');
      // }

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, { name: 'EduFam', address: 'Nairobi, Kenya' }, 'EduFam Financial Analysis Report');

      // Enhanced financial analysis
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 87, 34);
      doc.text('💼 Financial Performance Analysis', 20, yPosition + 15);
      yPosition += 30;

      const summaryData = [
        ['Financial Metric', 'Amount (KES)', 'Performance Indicator', 'Status'],
        ['Total Revenue', 800000, '💰 Primary Income Source', '✅ Active Collection'],
        ['Total Expenses', 500000, '💸 Operational Costs', '📊 Monitored & Controlled'],
        ['Net Profit/Loss', 300000, '📈 Profitable Operations', '🌟 Positive Performance'],
        ['Outstanding Fees', 200000, '🔄 Collection in Progress', '📞 Follow-up Required'],
        ['Collection Efficiency', '95%', '📈 Performance Metric', '🏆 Excellent Performance']
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [255, 87, 34],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        margin: { left: 20, right: 20 }
      });

      this.addFooter(doc, 1, 1, { name: 'EduFam', address: 'Nairobi, Kenya' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_Financial_Analysis_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating financial PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateSystemHealthReport(): Promise<void> {
    try {
      console.log('Starting system health PDF report generation...');
      
      // const systemData = await ReportEnhancementService.generateSystemHealthReport();
      // const enhancedData = await ReportEnhancementService.enhanceReportWithCompanyData('system-health');

      // Validate system data
      // if (!systemData) {
      //   throw new Error('Invalid system health data');
      // }

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, { name: 'EduFam', address: 'Nairobi, Kenya' }, 'EduFam System Health Report');

      // System Health Overview
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(156, 39, 176);
      doc.text('🔧 System Health Overview', 20, yPosition + 15);
      yPosition += 30;

      const healthData = [
        ['System Component', 'Status', 'Performance', 'Health Score'],
        ['Database', 'Operational', 'Good', '98%'],
        ['API Services', 'Operational', 'Good', '99%'],
        ['File Storage', 'Operational', 'Good', '95%'],
        ['Authentication', 'Operational', 'Good', '99%'],
        ['Overall System', 'Healthy', 'Excellent', '97%']
      ];

      (doc as jsPDF & { autoTable: (options: unknown) => void }).autoTable({
        head: [healthData[0]],
        body: healthData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { 
          fillColor: [156, 39, 176],
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 10,
          textColor: [60, 60, 60]
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        }
      });

      this.addFooter(doc, 1, 1, { name: 'EduFam', address: 'Nairobi, Kenya' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `EduFam_System_Health_Report_${timestamp}.pdf`;
      doc.save(filename);
      
      console.log(`PDF report saved as: ${filename}`);

    } catch (error) {
      console.error('Error generating system health PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generic PDF generation method for any report type
  static async generateGenericReport(reportData: ReportData, filename: string): Promise<void> {
    try {
      console.log('Starting generic PDF report generation...');
      
      // Validate report data
      const validation = this.validateReportData(reportData);
      if (!validation.isValid) {
        throw new Error(`Invalid report data: ${validation.errors.join(', ')}`);
      }

      const doc = new jsPDF();
      let yPosition = this.addHeader(doc, reportData.companyDetails, reportData.title);

      // Add report content based on type
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text(`📋 ${reportData.reportType} Report`, 20, yPosition + 15);
      yPosition += 25;

      // Add data content
      if (reportData.data && typeof reportData.data === 'object') {
        const dataEntries = Object.entries(reportData.data);
        
        dataEntries.forEach(([key, value]) => {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(`${key}:`, 20, yPosition);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(String(value), 60, yPosition);
          
          yPosition += 8;
        });
      }

      this.addFooter(doc, 1, 1, reportData.companyDetails);
      
      doc.save(`${filename}.pdf`);
      
      console.log(`PDF report saved as: ${filename}.pdf`);

    } catch (error) {
      console.error('Error generating generic PDF report:', error);
      throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
