import React, { useState } from 'react';
import * as XLSX from 'xlsx';


// Function to generate financial years
const generateFinancialYears = () => {
  const years = [];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  let startYear = 2017;
  let endYear = currentYear;

  if (currentMonth < 4) {
    endYear -= 1;
  }

  for (let year = startYear; year <= endYear; year++) {
    const fy = `${year}-${(year + 1).toString().slice(-2)}`;
    years.push(fy);
  }
  return years;
};

const GstRecoPage = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const financialYears = generateFinancialYears();
  const [selectedFy, setSelectedFy] = useState(financialYears[financialYears.length - 1]);
  const [recoType, setRecoType] = useState('As per 2B');
  const [dataAsPerGst, setDataAsPerGst] = useState({
    records: 0,
    taxableValue: 0.00,
    igst: 0.00,
    cgst: 0.00,
    sgst: 0.00,
    cess: 0.00,
    totalTax: 0.00,
  });
  const [dataAsPerBooks, setDataAsPerBooks] = useState({
    records: 0,
    taxableValue: 0.00,
    igst: 0.00,
    cgst: 0.00,
    sgst: 0.00,
    cess: 0.00,
    totalTax: 0.00,
  });

  // Reconciliation data is now an empty array.
  const reconciliationData = [];

  // Function to calculate summary data based on reconciliation data
  const calculateSummary = (data, summaryType) => {
    const summary = {};
    data.forEach(row => {
      const key = row[summaryType];
      if (!summary[key]) {
        summary[key] = {
          Description: key,
          Records: 0,
          Taxable_Value: 0,
          IGST: 0,
          CGST: 0,
          SGST: 0,
          Cess: 0,
          Total_Tax: 0,
        };
      }
      summary[key].Records += 1;
      summary[key].Taxable_Value += (row.Taxable_Value_2B || 0);
      summary[key].IGST += (row.IGST_2B || 0);
      summary[key].CGST += (row.CGST_2B || 0);
      summary[key].SGST += (row.SGST_2B || 0);
      summary[key].Cess += (row.Cess_2B || 0);
      summary[key].Total_Tax += (row.IGST_2B || 0) + (row.CGST_2B || 0) + (row.SGST_2B || 0) + (row.Cess_2B || 0);
    });
    return Object.values(summary);
  };

  const summaryStatus = calculateSummary(reconciliationData, 'Status');
  const summary3BStatus = calculateSummary(reconciliationData, 'ThreeB_Status');

  const calculateTotals = (data) => {
    return data.reduce((acc, current) => {
      acc.Records += current.Records;
      acc.Taxable_Value += current.Taxable_Value;
      acc.IGST += current.IGST;
      acc.CGST += current.CGST;
      acc.SGST += current.SGST;
      acc.Cess += current.Cess;
      acc.Total_Tax += current.Total_Tax;
      return acc;
    }, {
      Description: 'Total', Records: 0, Taxable_Value: 0, IGST: 0, CGST: 0, SGST: 0, Cess: 0, Total_Tax: 0
    });
  };

  const totals3B = calculateTotals(summary3BStatus);
  const totalsStatus = calculateTotals(summaryStatus);

  const handleDownloadFormat = () => {
    const header = [
      'MONTH', 'GSTIN', 'Supplier_Name', 'Invoice_No', 'Invoice_Date',
      'Taxable_Value', 'IGST', 'CGST', 'SGST', 'Cess'
    ];
    const sampleData = [
      'JUL-24', '27ABCDE1234F1Z5', 'Sample Supplier', 'INV001', '01-07-2024', 1000, 90, 90, 90, 0
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Format');
    XLSX.writeFile(wb, 'data_format.xlsx');
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      let totalRecords = data.length;
      let totalTaxableValue = 0;
      let totalIgst = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalCess = 0;

      data.forEach(row => {
        totalTaxableValue += row.Taxable_Value || 0;
        totalIgst += row.IGST || 0;
        totalCgst += row.CGST || 0;
        totalSgst += row.SGST || 0;
        totalCess += row.Cess || 0;
      });

      const totalTax = totalIgst + totalCgst + totalSgst + totalCess;

      const updatedData = {
        records: totalRecords,
        taxableValue: totalTaxableValue,
        igst: totalIgst,
        cgst: totalCgst,
        sgst: totalSgst,
        cess: totalCess,
        totalTax: totalTax,
      };

      if (type === 'gstr') {
        setDataAsPerGst(updatedData);
      } else if (type === 'books') {
        setDataAsPerBooks(updatedData);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadReport = () => {
    const wb = XLSX.utils.book_new();

    const borderStyle = { style: 'thin', color: { rgb: "000000" } };
    const allBorders = {
        top: borderStyle,
        bottom: borderStyle,
        left: borderStyle,
        right: borderStyle
    };
    
    // Create Reco Sheet
    const recoHeaders = [
      'Invoice FY 2B', 'Invoice FY PR', 'Invoice Month 2B', 'Invoice Month PR', 'GSTIN', 'Supplier Name',
      'Invoice No 2B', 'Invoice No PR', 'Invoice Date 2B', 'Invoice Date PR',
      'Taxable Value 2B', 'Taxable Value PR', 'IGST 2B', 'IGST PR', 'CGST 2B', 'CGST PR',
      'SGST 2B', 'SGST PR', 'Cess 2B', 'Cess PR',
      'Diff Taxable', 'Diff IGST', 'Diff CGST', 'Diff SGST', 'Diff Cess', 'Status', 'ThreeB Status'
    ];
    
    const recoDataForExcel = reconciliationData.map(row => [
      row.Invoice_FY_2B, row.Invoice_FY_PR, row.Invoice_Month_2B, row.Invoice_Month_PR, row.GSTIN, row.Supplier_Name,
      row.Invoice_No_2B, row.Invoice_No_PR, row.Invoice_Date_2B, row.Invoice_Date_PR,
      row.Taxable_Value_2B, row.Taxable_Value_PR, row.IGST_2B, row.IGST_PR, row.CGST_2B, row.CGST_PR,
      row.SGST_2B, row.SGST_PR, row.Cess_2B, row.Cess_PR,
      row.Diff_Taxable, row.Diff_IGST, row.Diff_CGST, row.Diff_SGST, row.Diff_Cess, row.Status, row.ThreeB_Status
    ]);

    const wsReco = XLSX.utils.aoa_to_sheet([recoHeaders, ...recoDataForExcel]);
    XLSX.utils.book_append_sheet(wb, wsReco, 'Reco');

    // Apply styles to all cells in Reco sheet
    const rangeReco = XLSX.utils.decode_range(wsReco['!ref']);
    for(let R = rangeReco.s.r; R <= rangeReco.e.r; ++R) {
        for(let C = rangeReco.s.c; C <= rangeReco.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({c:C, r:R});
            if(!wsReco[cellRef]) continue;
            if(!wsReco[cellRef].s) wsReco[cellRef].s = {};
            wsReco[cellRef].s.border = allBorders;
        }
    }

    // Header specific styles for Reco sheet
    for(let C = rangeReco.s.c; C <= rangeReco.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({c:C, r:0});
        if(!wsReco[cellRef]) continue;
        if(!wsReco[cellRef].s) wsReco[cellRef].s = {};
        wsReco[cellRef].s.fill = { fgColor: { rgb: "ADD8E6" } };
        wsReco[cellRef].s.font = { bold: true };
    }

    // Auto-fit columns for Reco sheet
    const wscolsReco = recoHeaders.map(header => ({ wch: Math.max(...(recoDataForExcel.map(row => (row[recoHeaders.indexOf(header)] || "").toString().length)), header.length) + 2 }));
    wsReco['!cols'] = wscolsReco;

    // Create Summary Sheet
    const summaryHeaders = ['Description', 'Records', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Cess', 'Total Tax'];
    let summaryData = [];
    if (recoType === 'As per 2B') {
      summaryData = [
        ...summary3BStatus.map(row => Object.values(row)),
        Object.values(totals3B)
      ];
    }
    summaryData.push(
      ...summaryStatus.map(row => Object.values(row)),
      Object.values(totalsStatus)
    );
    
    const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Apply styles to all cells in Summary sheet
    const rangeSummary = XLSX.utils.decode_range(wsSummary['!ref']);
    for(let R = rangeSummary.s.r; R <= rangeSummary.e.r; ++R) {
        for(let C = rangeSummary.s.c; C <= rangeSummary.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({c:C, r:R});
            if(!wsSummary[cellRef]) continue;
            if(!wsSummary[cellRef].s) wsSummary[cellRef].s = {};
            wsSummary[cellRef].s.border = allBorders;
        }
    }

    // Header specific styles for Summary sheet
    for(let C = rangeSummary.s.c; C <= rangeSummary.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({c:C, r:0});
        if(!wsSummary[cellRef]) continue;
        if(!wsSummary[cellRef].s) wsSummary[cellRef].s = {};
        wsSummary[cellRef].s.fill = { fgColor: { rgb: "ADD8E6" } };
        wsSummary[cellRef].s.font = { bold: true };
    }

    // Auto-fit columns for Summary sheet
    const wscolsSummary = summaryHeaders.map(header => ({ wch: Math.max(...(summaryData.map(row => (row[summaryHeaders.indexOf(header)] || "").toString().length)), header.length) + 2 }));
    wsSummary['!cols'] = wscolsSummary;

    XLSX.writeFile(wb, 'GST_Reco_Report.xlsx');
  };

  const handleRunReconciliation = () => {
    alert('Running reconciliation...');
  };

  const TabSelector = ({ activeTab, setActiveTab }) => {
    const tabs = ['Summary', 'Gst.Reconciliation', 'Reco Summary'];
    return (
      <div className="tab-selector">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };

  const ActionButtons = () => {
    return (
      <div className="action-buttons">
        <button className="download-button" onClick={handleDownloadFormat}>Download Format</button>
        <label className="import-button gstr">
          Import GSTR 2A OR 2B
          <input type="file" onChange={(e) => handleFileUpload(e, 'gstr')} style={{ display: 'none' }} />
        </label>
        <label className="import-button books">
          Import AS PER BOOKES
          <input type="file" onChange={(e) => handleFileUpload(e, 'books')} style={{ display: 'none' }} />
        </label>
      </div>
    );
  };

  const DataTable = ({ data }) => {
    const { records, taxableValue, igst, cgst, sgst, cess, totalTax } = data;
    return (
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>RECORDS</th>
              <th>TAXABLE VALUE</th>
              <th>IGST</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>CESS</th>
              <th>TOTAL TAX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{records.toFixed(0)}</td>
              <td>{taxableValue.toFixed(2)}</td>
              <td>{igst.toFixed(2)}</td>
              <td>{cgst.toFixed(2)}</td>
              <td>{sgst.toFixed(2)}</td>
              <td>{cess.toFixed(2)}</td>
              <td>{totalTax.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const RecoTable = ({ data, recoType }) => {
    const headers = [
      'Invoice_FY_2B', 'Invoice_FY_PR', 'Invoice_Month_2B', 'Invoice_Month_PR', 'GSTIN', 'Supplier_Name',
      'Invoice_No_2B', 'Invoice_No_PR', 'Invoice_Date_2B', 'Invoice_Date_PR',
      'Taxable_Value_2B', 'Taxable_Value_PR', 'IGST_2B', 'IGST_PR', 'CGST_2B', 'CGST_PR',
      'SGST_2B', 'SGST_PR', 'Cess_2B', 'Cess_PR',
      'Diff_Taxable', 'Diff_IGST', 'Diff_CGST', 'Diff_SGST', 'Diff_Cess', 'Status'
    ];

    if (recoType === 'As per 2B') {
      headers.push('ThreeB_Status');
    }

    return (
      <div className="table-responsive">
        <table className="reco-table">
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {headers.map(header => (
                  <td key={header}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const SummaryTable = ({ title, data, totals }) => (
    <div className="data-section">
      <h2>{title}</h2>
      <div className="table-responsive">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Records</th>
              <th>Taxable Value</th>
              <th>IGST</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>Cess</th>
              <th>Total Tax</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.Description}</td>
                <td>{row.Records}</td>
                <td>{row.Taxable_Value}</td>
                <td>{row.IGST}</td>
                <td>{row.CGST}</td>
                <td>{row.SGST}</td>
                <td>{row.Cess}</td>
                <td>{row.Total_Tax}</td>
              </tr>
            ))}
            <tr className="totals-row">
              <td>{totals.Description}</td>
              <td>{totals.Records}</td>
              <td>{totals.Taxable_Value.toFixed(2)}</td>
              <td>{totals.IGST.toFixed(2)}</td>
              <td>{totals.CGST.toFixed(2)}</td>
              <td>{totals.SGST.toFixed(2)}</td>
              <td>{totals.Cess.toFixed(2)}</td>
              <td>{totals.Total_Tax.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const cssStyles = `
    /* Base Styles */
    body, html, #root {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      box-sizing: border-box;
    }

    .gst-reco-container {
      font-family: Arial, sans-serif;
      padding: 20px;
      background-color: #f0f2f5;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 95%; 
      margin: 20px auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 24px;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .select-dropdown {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      color: #555;
    }

    .select-dropdown select {
      padding: 5px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    .tab-selector {
      display: flex;
      gap: 5px;
      margin-bottom: 20px;
      border-bottom: 1px solid #ccc;
      overflow-x: auto;
      white-space: nowrap;
    }

    .tab-button {
      background-color: transparent;
      border: none;
      padding: 10px 15px;
      cursor: pointer;
      font-size: 16px;
      color: #555;
      border-bottom: 3px solid transparent;
      flex-shrink: 0;
    }

    .tab-button.active {
      color: #007bff;
      font-weight: bold;
      border-bottom-color: #007bff;
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .import-button, .download-button, .report-download-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .download-button {
        background-color: #6c757d;
    }

    .import-button.gstr {
      background-color: #007bff;
    }

    .import-button.books {
      background-color: #28a745;
    }

    .report-download-button {
        background-color: #ffc107;
    }

    .data-section {
      background-color: #fff;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .data-section h2 {
      font-size: 18px;
      color: #333;
      margin-top: 0;
      margin-bottom: 10px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table, .reco-table, .summary-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
      table-layout: auto;
    }
    
    .reco-table {
      min-width: 1800px;
    }

    .data-table th, .data-table td, 
    .reco-table th, .reco-table td,
    .summary-table th, .summary-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: center;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .data-table th, .reco-table th, .summary-table th {
      background-color: #f8f9fa;
      font-weight: bold;
      color: #333;
    }

    .reconciliation-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .reconciliation-actions span {
      font-size: 14px;
      color: #555;
    }

    .run-button {
      padding: 10px 25px;
      background-color: #17a2b8;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
    }

    .totals-row {
      font-weight: bold;
      background-color: #e9ecef;
    }
    
    .reco-summary-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }
      .header-actions {
        width: 100%;
        justify-content: space-between;
      }
      .reconciliation-actions {
        justify-content: center;
      }
      .action-buttons {
          justify-content: space-between;
          flex-direction: column;
      }
    }
  `;

  return (
    <>
      <style>{cssStyles}</style>
      <div className="gst-reco-container">
        <div className="header">
          <h1>GST RECO</h1>
          <div className="header-actions">
            <div className="select-dropdown">
              <span>Reco Type:</span>
              <select value={recoType} onChange={(e) => setRecoType(e.target.value)}>
                <option>As per 2B</option>
                <option>As per 2A</option>
              </select>
            </div>
            <div className="select-dropdown">
              <span>F.Y.:</span>
              <select value={selectedFy} onChange={(e) => setSelectedFy(e.target.value)}>
                {financialYears.map(fy => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'Summary' && (
          <div className="summary-content">
            <ActionButtons />
            
            <div className="data-section">
              <h2>As per 2B OR 2A</h2>
              <DataTable data={dataAsPerGst} />
            </div>

            <div className="data-section">
              <h2>As per books</h2>
              <DataTable data={dataAsPerBooks} />
            </div>

            <div className="reconciliation-actions">
              <span>Click here to run reconciliation</span>
              <button className="run-button" onClick={handleRunReconciliation}>Run</button>
            </div>
          </div>
        )}

        {activeTab === 'Gst.Reconciliation' && (
          <div className="reconciliation-content">
            <RecoTable data={reconciliationData} recoType={recoType} />
          </div>
        )}

        {activeTab === 'Reco Summary' && (
          <div className="reco-summary-content">
            <div className="reco-summary-header">
                <button className="report-download-button" onClick={handleDownloadReport}>Download Report</button>
            </div>
            {recoType === 'As per 2B' && (
              <SummaryTable title="Summary As per 3B Status" data={summary3BStatus} totals={totals3B} />
            )}
            <SummaryTable title="Summary As per Status" data={summaryStatus} totals={totalsStatus} />
          </div>
        )}
      </div>
    </>
  );
};

export default GstRecoPage;