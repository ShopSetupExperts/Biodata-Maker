import React, { useState } from 'react';
import { BioData, INITIAL_BIO_DATA } from './types';
import { BioDataForm } from './components/BioDataForm';
import { BioDataPreview } from './components/BioDataPreview';
import { generatePDF } from './services/pdfService';
import { Download, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<BioData>(INITIAL_BIO_DATA);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const handleDownload = () => {
    generatePDF(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* Navigation / Header */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-amber-500" />
              <span className="font-serif font-bold text-xl tracking-wide">Elegant BioData</span>
            </div>
            <button 
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Tabs */}
        <div className="lg:hidden flex space-x-2 mb-6 bg-white p-1 rounded-lg shadow-sm">
          <button 
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === 'edit' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Edit
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Preview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className={`lg:block ${activeTab === 'edit' ? 'block' : 'hidden'}`}>
             <BioDataForm data={data} onChange={setData} />
          </div>

          {/* Right Column: Preview */}
          <div className={`lg:block ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
             <div className="sticky top-24">
                <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-xl font-bold text-slate-800 font-serif">Live Preview</h2>
                    <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">A4 Size</span>
                </div>
                
                {/* Preview Container - Scaled for better visibility on smaller screens */}
                <div className="overflow-x-auto pb-8 flex justify-center bg-slate-200/50 rounded-xl p-4 border border-slate-200">
                    <div className="origin-top transform scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.65] xl:scale-[0.8]">
                        <BioDataPreview data={data} />
                    </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;