import React, { useState, useRef } from 'react'
import { Upload, Download, CheckCircle, AlertCircle, FileText, Loader2 } from 'lucide-react'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import { api } from '../../api'

const SAMPLE_CSV_CONTENT = `customer_name,mobile,business_name,business_type,city,pincode,required_loan_amount,monthly_turnover,vintage,gst_available,itr_available,banking_available,cibil_range,loan_type,ownership_type
Rajesh Kumar,9876543210,Sharma Traders,Wholesale,Bengaluru,560001,1500000,850000,4.5,Yes,Yes,Yes,740-760,Business Loan,Owned
Sunita Agarwal,8765432109,Agarwal Textiles,Manufacturing,Mumbai,400001,2500000,1200000,6,Yes,Yes,Yes,760-780,Working Capital,Rented`

export default function CSVUpload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [toast, setToast] = useState(null)
  const fileRef = useRef()

  const handleFile = (f) => {
    if (f && f.name.endsWith('.csv')) {
      setFile(f)
      setResult(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const data = await api.uploadCsv(file)
      setResult(data)
      if (data.created_count > 0) {
        setToast({ message: `${data.created_count} leads imported successfully!`, type: 'success' })
      } else {
        setToast({ message: 'No new leads were imported. Check duplicates and errors below.', type: 'warning' })
      }
    } catch (err) {
      setToast({ message: err.message || 'Upload failed', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'sample_leads.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Import Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload a CSV file to add business loan leads in bulk.</p>
        </div>
        <button onClick={downloadSample} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
          <Download size={16} /> Download Sample CSV
        </button>
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
          dragging ? 'border-indigo-500 bg-indigo-50' : file ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'
        }`}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            <FileText size={40} className="text-emerald-500 mb-3" />
            <p className="font-semibold text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change file</p>
          </>
        ) : (
          <>
            <Upload size={40} className="text-gray-400 mb-3" />
            <p className="font-semibold text-gray-700">Drag & drop your CSV here</p>
            <p className="text-sm text-gray-500 mt-1">or</p>
            <p className="text-sm font-semibold text-indigo-600 mt-1">Browse Files</p>
            <p className="text-xs text-gray-400 mt-3">Supported: .csv · Max size: 5MB</p>
          </>
        )}
      </div>

      {/* Upload button */}
      {file && !result && (
        <div className="flex gap-3">
          <button onClick={() => { setFile(null); setResult(null) }} className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <Button onClick={handleUpload} loading={uploading} size="md">
            {uploading ? 'Uploading...' : 'Upload & Import'}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="font-semibold text-gray-900">Import Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Rows', value: result.total_rows || 0, color: 'bg-gray-50 border-gray-200' },
              { label: 'Created', value: result.created_count || 0, color: 'bg-emerald-50 border-emerald-200' },
              { label: 'Duplicates', value: result.duplicate_count || 0, color: 'bg-amber-50 border-amber-200' },
              { label: 'Errors', value: (result.errors || []).length, color: 'bg-red-50 border-red-200' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Duplicates */}
          {result.duplicates_flagged && result.duplicates_flagged.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">Duplicates Flagged ({result.duplicates_flagged.length})</h3>
              <div className="space-y-1.5">
                {result.duplicates_flagged.slice(0, 5).map((d, i) => (
                  <div key={i} className="text-xs text-amber-700">Row {d.row}: {d.name} ({d.mobile}) — {d.reason}</div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Errors ({result.errors.length})</h3>
              <div className="space-y-1.5">
                {result.errors.slice(0, 5).map((e, i) => (
                  <div key={i} className="text-xs text-red-700">Row {e.row}: {e.error}</div>
                ))}
              </div>
            </div>
          )}

          {/* Success state */}
          {result.created_count > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-emerald-900">Import Complete!</h2>
              <p className="text-emerald-700 text-sm mt-1">{result.created_count} leads have been added to the CRM successfully.</p>
              <button onClick={() => { setFile(null); setResult(null) }} className="mt-4 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
                Upload Another File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
