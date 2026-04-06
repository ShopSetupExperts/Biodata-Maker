import React from 'react';
import { BioData, SectionDetails, SectionList } from '../types';

interface Props {
  data: BioData;
  scale?: number;
}

export const BioDataPreview: React.FC<Props> = ({ data, scale = 1 }) => {
  return (
    <div 
      className="bg-white shadow-2xl mx-auto overflow-hidden relative"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '20mm', // 20mm padding
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      {/* Decorative Border */}
      <div className="absolute inset-4 border-2 border-amber-600 pointer-events-none"></div>
      <div className="absolute inset-5 border border-slate-800 pointer-events-none"></div>

      {/* Image (Centered Top) */}
      {data.imageUrl && (
        <div className="flex justify-center mt-8 mb-4 relative z-10">
            <div className="w-36 h-36 bg-slate-100 border-2 border-slate-300 shadow-inner overflow-hidden">
                <img src={data.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
        </div>
      )}

      {/* Header */}
      <div className={`text-center mb-6 relative ${!data.imageUrl ? 'mt-12' : ''}`}>
        <h1 className="text-4xl font-serif font-bold text-amber-700 tracking-wider">BIO DATA</h1>
        <div className="w-24 h-1 bg-amber-600 mx-auto mt-4"></div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6 px-4">
            <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-600">
                <h3 className="text-amber-800 font-bold font-serif mb-1 text-sm">About</h3>
                <p className="text-sm text-slate-700 italic font-serif leading-relaxed text-center">{data.summary}</p>
            </div>
        </div>
      )}

      {/* Dynamic Sections */}
      <div className="space-y-6">
        {data.sections.map(section => (
          <div key={section.id}>
             {/* Section Title */}
             <h2 className="text-lg font-serif font-bold text-slate-800 border-b border-amber-600 pb-1 mb-3 uppercase tracking-wide">
               {section.title}
             </h2>

             {/* Section Content */}
             <div className="space-y-2">
                {section.type === 'details' ? (
                   (section as SectionDetails).fields.map(field => (
                     field.value.trim() && (
                       <div key={field.id} className="flex items-baseline">
                          <span className="w-40 flex-shrink-0 text-sm font-bold text-slate-600 uppercase tracking-tight">{field.label}</span>
                          <span className="text-slate-600 mx-2">:</span>
                          <span className="flex-1 text-sm text-slate-800 leading-relaxed font-medium">{field.value}</span>
                       </div>
                     )
                   ))
                ) : (
                   <ul className="list-disc ml-5 space-y-1">
                      {(section as SectionList).items.map((item, idx) => (
                        item.trim() && (
                          <li key={idx} className="text-slate-700 text-sm leading-relaxed">
                            {item}
                          </li>
                        )
                      ))}
                   </ul>
                )}
             </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 left-0 w-full text-center text-slate-400 text-[10px]">
        <p>Created with Elegant BioData Maker</p>
      </div>
    </div>
  );
};