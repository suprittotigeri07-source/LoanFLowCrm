import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, Download, ArrowRight, RefreshCw, X, ShieldAlert } from 'lucide-react'
import { useAdmin } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'

export default function AdminUploadLeads() {
  const { customers, setCustomers, showToast, addAuditLog } = useAdmin()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Upload, 2: Map, 3: Validate, 4: Preview, 5: Complete
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    valid: 0,
    duplicate: 0,
    invalid: 0,
  })

  // Sample Expected Fields
  const expectedFields = [
    'Customer Name', 'Mobile Number', 'Alternate Number', 'City', 'Location',
    'Pincode', 'Business Name', 'Business Type', 'Business Vintage', 'Business Constitution',
    'GST Available', 'ITR Available', 'Banking Available', 'Monthly Turnover', 'Annual Turnover',
    'Existing Loans', 'Existing EMI', 'CIBIL Range', 'Required Loan Amount', 'Loan Requirement',
    'Lead Source', 'Campaign'
  ]

  // Mock sample CSV download generator
  const downloadSampleTemplate = () => {
    const csvContent =
      'Customer Name,Mobile Number,Alternate Number,City,Location,Pincode,Business Name,Business Type,Business Vintage,Business Constitution,GST Available,ITR Available,Banking Available,Monthly Turnover,Annual Turnover,Existing Loans,Existing EMI,CIBIL Range,Required Loan Amount,Loan Requirement,Lead Source,Campaign\n' +
      'Vikram Sethi,9876543299,9876543298,Hubli,Vidyanagar,580021,Sethi Auto Garage,Auto Services,4 Years,Proprietorship,Yes,Yes,Yes,₹8.5 Lakhs,₹1.02 Crores,₹2.0 Lakhs,₹8500,740-770,1800000,Garage Expansion,IndiaMART,BL-South\n' +
      'Ananya Sharma,9876543210,9876543201,Mumbai,Andheri,400053,Ananya Boutique,Apparel Retail,5 Years,Proprietorship,Yes,Yes,Yes,₹15 Lakhs,₹1.8 Crores,₹0,₹0,760-790,2500000,Inventory Purchase,Google Ads,BL-West\n'

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'LoanFlow_Sample_Leads_Import_Template.csv'
    a.click()
    showToast('Sample CSV template downloaded!')
  }

  // Simulate File Selection / Drop
  const handleFileDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const processFile = (file) => {
    setFileName(file.name)
    // Simulate Parsing File & Detecting Duplicates against current customer database
    const existingMobiles = new Set(customers.map(c => c.mobile.replace(/\D/g, '')))

    const mockImported = [
      { id: 1, name: 'Vikram Sethi', mobile: '9876543299', city: 'Hubli', businessName: 'Sethi Auto Garage', loanAmount: 1800000, leadSource: 'IndiaMART', isDup: false, isValid: true },
      { id: 2, name: 'Ananya Sharma', mobile: '9876543210', city: 'Mumbai', businessName: 'Ananya Boutique', loanAmount: 2500000, leadSource: 'Google Ads', isDup: existingMobiles.has('9876543210'), isValid: !existingMobiles.has('9876543210') },
      { id: 3, name: 'Karan Malhotra', mobile: '9876543297', city: 'Delhi', businessName: 'Malhotra Trading Co', loanAmount: 3500000, leadSource: 'Website', isDup: false, isValid: true },
      { id: 4, name: 'Pooja Hegde', mobile: '9876543296', city: 'Bengaluru', businessName: 'Hegde Enterprise', loanAmount: 2000000, leadSource: 'CSV Upload', isDup: false, isValid: true },
      { id: 5, name: 'Rohan Deshmukh', mobile: '98765', city: 'Pune', businessName: 'Deshmukh Snacks', loanAmount: 500000, leadSource: 'Cold Call', isDup: false, isValid: false, reason: 'Invalid 5-digit mobile' },
    ]

    const total = mockImported.length
    const dupCount = mockImported.filter(r => r.isDup).length
    const invalidCount = mockImported.filter(r => !r.isValid && !r.isDup).length
    const validCount = mockImported.filter(r => r.isValid).length

    setParsedRows(mockImported)
    setValidationSummary({
      total,
      valid: validCount,
      duplicate: dupCount,
      invalid: invalidCount,
    })

    setStep(2)
  }

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid)
    const newLeadItems = validRows.map((r, idx) => ({
      id: `LD-${1050 + idx}`,
      customerId: `CUST-${850 + idx}`,
      name: r.name,
      mobile: r.mobile,
      businessName: r.businessName,
      businessType: 'Retail / Wholesale',
      location: r.city,
      city: r.city,
      loanAmount: r.loanAmount,
      leadSource: r.leadSource,
      assignedTelecaller: '',
      status: 'NEW LEAD',
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: 'Bulk imported via CSV upload.',
    }))

    setCustomers(prev => [...newLeadItems, ...prev])
    addAuditLog('Bulk CSV Import', '—', `${validRows.length} Leads`, 'CSV File', 'Imported')
    showToast(`Successfully imported ${validRows.length} new leads!`)
    setStep(5)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Page Title & Subtitle */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Import bulk business loan leads from Excel or CSV files.</p>
        </div>
        <button
          onClick={downloadSampleTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all border border-indigo-100"
        >
          <Download size={16} /> Download Sample Template
        </button>
      </div>

      {/* 5-Step Process Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between text-xs font-bold">
        {[
          { num: 1, label: 'Upload File' },
          { num: 2, label: 'Map Columns' },
          { num: 3, label: 'Validate Data' },
          { num: 4, label: 'Preview' },
          { num: 5, label: 'Import Complete' },
        ].map(s => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
              step === s.num ? 'bg-indigo-600 text-white shadow-md' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={step === s.num ? 'text-indigo-600 font-bold' : 'text-gray-500'}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: UPLOAD FILE DRAG & DROP AREA */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-12 text-center shadow-sm space-y-4 hover:border-indigo-400 transition-all">
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            className="flex flex-col items-center justify-center space-y-3 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Drag & Drop your Excel / CSV File Here</h3>
            <p className="text-xs text-gray-400">Supports .csv, .xlsx format (up to 10MB per file)</p>

            <label className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all">
              Browse File
              <input type="file" accept=".csv, .xlsx" onChange={handleFileDrop} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* STEP 2 & 3: MAP COLUMNS & VALIDATION SUMMARY */}
      {(step === 2 || step === 3) && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">File: {fileName}</h3>
                <p className="text-xs text-gray-400">Column Mapping & Header Validation</p>
              </div>
              <button onClick={() => setStep(4)} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 flex items-center gap-2">
                Continue to Preview <ArrowRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {expectedFields.slice(0, 9).map(f => (
                <div key={f} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">{f}</span>
                  <span className="text-emerald-600 text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded">AUTO MATCHED ✓</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: PREVIEW & DUPLICATE SUMMARY */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-semibold text-gray-400">Total Rows</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{validationSummary.total}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
              <div className="text-xs font-semibold text-emerald-600">Valid Rows</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{validationSummary.valid}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-sm">
              <div className="text-xs font-semibold text-amber-600">Duplicate Mobile</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">{validationSummary.duplicate}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-red-100 bg-red-50/20 shadow-sm">
              <div className="text-xs font-semibold text-red-600">Invalid Rows</div>
              <div className="text-2xl font-bold text-red-700 mt-1">{validationSummary.invalid}</div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-900">Import Data Validation Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => showToast('Error report downloaded!')}
                  className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold"
                >
                  Download Error Report
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Import {validationSummary.valid} Valid Leads Now
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                    <th className="px-3.5 py-2.5">Customer</th>
                    <th className="px-3.5 py-2.5">Mobile</th>
                    <th className="px-3.5 py-2.5">City</th>
                    <th className="px-3.5 py-2.5">Business</th>
                    <th className="px-3.5 py-2.5">Loan Required</th>
                    <th className="px-3.5 py-2.5">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parsedRows.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3.5 py-3 font-semibold text-gray-900">{r.name}</td>
                      <td className="px-3.5 py-3 font-mono text-gray-700">{r.mobile}</td>
                      <td className="px-3.5 py-3 text-gray-600">{r.city}</td>
                      <td className="px-3.5 py-3 text-gray-800 font-medium">{r.businessName}</td>
                      <td className="px-3.5 py-3 font-bold text-indigo-600">₹{(r.loanAmount / 100000).toFixed(1)}L</td>
                      <td className="px-3.5 py-3">
                        {r.isValid ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">VALID ✓</span>
                        ) : r.isDup ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">DUPLICATE MOBILE ⚠️</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">INVALID DATA ✕</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: IMPORT COMPLETE */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Leads Imported Successfully!</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Your newly imported business loan leads have been added to the master lead pool and are now ready for assignment.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => navigate('/admin/leads')}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md"
            >
              View All Leads
            </button>
            <button
              onClick={() => { setStep(1); setFileName('') }}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
