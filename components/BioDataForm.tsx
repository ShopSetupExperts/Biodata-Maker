import React, { useState } from 'react';
import { BioData, Section, SectionDetails, SectionList, Field } from '../types';
import { generateBioSummary } from '../services/geminiService';
import { Sparkles, Loader2, Plus, Trash2, Upload, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  data: BioData;
  onChange: (data: BioData) => void;
}

function SortableSectionItem({
  section,
  sIdx,
  updateSectionTitle,
  removeSection,
  updateField,
  removeField,
  addField,
  updateListItem,
  removeListItem,
  addListItem
}: {
  section: Section;
  sIdx: number;
  updateSectionTitle: (index: number, title: string) => void;
  removeSection: (index: number) => void;
  updateField: (sIdx: number, fIdx: number, key: 'label' | 'value', val: string) => void;
  removeField: (sIdx: number, fIdx: number) => void;
  addField: (sIdx: number) => void;
  updateListItem: (sIdx: number, iIdx: number, val: string) => void;
  removeListItem: (sIdx: number, iIdx: number) => void;
  addListItem: (sIdx: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative group">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center flex-1">
          <button
            {...attributes}
            {...listeners}
            className="mr-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <input 
            value={section.title}
            onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
            className="text-lg font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none transition-colors w-full mr-4"
          />
        </div>
        <button 
          onClick={() => removeSection(sIdx)}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          title="Delete Section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Section Content */}
      <div className="space-y-2">
        {section.type === 'details' ? (
          <>
            {(section as SectionDetails).fields.map((field, fIdx) => (
              <div key={field.id} className="flex gap-2 items-start group/field">
                 <div className="w-1/3">
                    <input 
                      value={field.label}
                      onChange={(e) => updateField(sIdx, fIdx, 'label', e.target.value)}
                      className="w-full p-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded focus:border-amber-500 focus:outline-none"
                      placeholder="Label"
                    />
                 </div>
                 <div className="flex-1">
                    <input 
                      value={field.value}
                      onChange={(e) => updateField(sIdx, fIdx, 'value', e.target.value)}
                      className="w-full p-2 text-sm text-slate-800 bg-white border border-slate-200 rounded focus:border-amber-500 focus:outline-none"
                      placeholder="Value"
                    />
                 </div>
                 <button 
                   onClick={() => removeField(sIdx, fIdx)}
                   className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover/field:opacity-100 transition-opacity"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            ))}
            <button 
              onClick={() => addField(sIdx)}
              className="text-xs text-amber-600 font-bold hover:text-amber-700 flex items-center mt-2"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Field
            </button>
          </>
        ) : (
          <>
            {(section as SectionList).items.map((item, iIdx) => (
              <div key={iIdx} className="flex gap-2 items-center group/item">
                 <span className="text-slate-400">•</span>
                 <input 
                    value={item}
                    onChange={(e) => updateListItem(sIdx, iIdx, e.target.value)}
                    className="flex-1 p-2 text-sm text-slate-800 bg-white border border-slate-200 rounded focus:border-amber-500 focus:outline-none"
                    placeholder="Item description..."
                 />
                 <button 
                   onClick={() => removeListItem(sIdx, iIdx)}
                   className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover/item:opacity-100 transition-opacity"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            ))}
             <button 
              onClick={() => addListItem(sIdx)}
              className="text-xs text-amber-600 font-bold hover:text-amber-700 flex items-center mt-2"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const BioDataForm: React.FC<Props> = ({ data, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = data.sections.findIndex((s) => s.id === active.id);
      const newIndex = data.sections.findIndex((s) => s.id === over.id);

      onChange({
        ...data,
        sections: arrayMove(data.sections, oldIndex, newIndex),
      });
    }
  };

  // -- Top Level Handlers --

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const summary = await generateBioSummary(data);
      onChange({ ...data, summary });
    } catch (e) {
      setError("Failed to generate summary. Ensure API Key is valid.");
    } finally {
      setIsGenerating(false);
    }
  };

  // -- Section Handlers --

  const addSection = (type: 'details' | 'list') => {
    const newSection: Section = type === 'details' 
      ? { id: Date.now().toString(), title: "New Section", type: 'details', fields: [] }
      : { id: Date.now().toString(), title: "New List", type: 'list', items: [] };
    
    onChange({ ...data, sections: [...data.sections, newSection] });
  };

  const removeSection = (index: number) => {
    const newSections = [...data.sections];
    newSections.splice(index, 1);
    onChange({ ...data, sections: newSections });
  };

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...data.sections];
    newSections[index] = { ...newSections[index], title };
    onChange({ ...data, sections: newSections });
  };

  // -- Field/Item Handlers --

  const addField = (sectionIndex: number) => {
    const newSections = [...data.sections];
    const section = newSections[sectionIndex] as SectionDetails;
    section.fields.push({ id: Date.now().toString(), label: "New Label", value: "" });
    onChange({ ...data, sections: newSections });
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...data.sections];
    const section = newSections[sectionIndex] as SectionDetails;
    section.fields.splice(fieldIndex, 1);
    onChange({ ...data, sections: newSections });
  };

  const updateField = (sectionIndex: number, fieldIndex: number, key: 'label' | 'value', val: string) => {
    const newSections = [...data.sections];
    const section = newSections[sectionIndex] as SectionDetails;
    section.fields[fieldIndex] = { ...section.fields[fieldIndex], [key]: val };
    onChange({ ...data, sections: newSections });
  };

  const addListItem = (sectionIndex: number) => {
    const newSections = [...data.sections];
    const section = newSections[sectionIndex] as SectionList;
    section.items.push("");
    onChange({ ...data, sections: newSections });
  };

  const removeListItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...data.sections];
    const section = newSections[sectionIndex] as SectionList;
    section.items.splice(itemIndex, 1);
    onChange({ ...data, sections: newSections });
  };

  const updateListItem = (sectionIndex: number, itemIndex: number, val: string) => {
    const newSections = [...data.sections];
    const section = newSections[sectionIndex] as SectionList;
    section.items[itemIndex] = val;
    onChange({ ...data, sections: newSections });
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-800">Edit Details</h2>
        <p className="text-slate-500 text-sm">Customize fields, labels, and content. Add or remove sections as needed.</p>
      </div>

      {/* Image Upload */}
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden rounded">
          {data.imageUrl ? (
             <img src={data.imageUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
             <span className="text-xs text-slate-400">No Photo</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo</label>
          <div className="flex items-center">
             <label htmlFor="photo-upload" className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded transition">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
             </label>
             <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
             />
             {data.imageUrl && (
                 <button onClick={() => onChange({...data, imageUrl: undefined})} className="ml-2 text-red-500 text-xs hover:underline">Remove</button>
             )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-amber-900">Professional Summary</label>
            <button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="flex items-center space-x-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded-full transition disabled:opacity-50"
            >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>{isGenerating ? "Thinking..." : "Generate with AI"}</span>
            </button>
        </div>
        <textarea
            className="w-full p-2 text-sm border-amber-200 rounded focus:ring-amber-500 focus:border-amber-500 bg-white"
            rows={4}
            value={data.summary || ""}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            placeholder="Click 'Generate with AI' to create a summary..."
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      {/* Sections */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={data.sections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {data.sections.map((section, sIdx) => (
              <SortableSectionItem 
                key={section.id}
                section={section}
                sIdx={sIdx}
                updateSectionTitle={updateSectionTitle}
                removeSection={removeSection}
                updateField={updateField}
                removeField={removeField}
                addField={addField}
                updateListItem={updateListItem}
                removeListItem={removeListItem}
                addListItem={addListItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Section Buttons */}
      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button 
          onClick={() => addSection('details')}
          className="flex-1 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:border-amber-500 hover:text-amber-600 transition flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Details Section
        </button>
        <button 
          onClick={() => addSection('list')}
          className="flex-1 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:border-amber-500 hover:text-amber-600 transition flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add List Section
        </button>
      </div>

    </div>
  );
};