import React from 'react';
import { Download, Save, Undo, Redo, FileJson } from 'lucide-react';
import jsPDF from 'jspdf';

export default function PreviewControls({ stageRef, onSave, onUndo, onRedo, resumeData }) {
  
  const handleExportPDF = () => {
    if (!stageRef.current) return;
    
    const pdf = new jsPDF('p', 'px', [595, 842]);
    
    // Convert stage to image
    // pixelRatio 2 for better quality
    const dataUri = stageRef.current.toDataURL({ pixelRatio: 2 });
    
    pdf.addImage(dataUri, 'PNG', 0, 0, 595, 842);
    pdf.save('resume.pdf');
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "resume_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-xl px-6 py-3 flex items-center gap-4 border border-gray-200 z-50">
      <div className="flex gap-2 border-r border-gray-200 pr-4">
        <button onClick={onUndo} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer" title="Undo">
          <Undo size={20} />
        </button>
        <button onClick={onRedo} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer" title="Redo">
          <Redo size={20} />
        </button>
      </div>
      
      <button onClick={onSave} className="flex items-center gap-2 text-gray-700 hover:text-[#f79003] font-medium cursor-pointer">
        <Save size={18} /> Save
      </button>
      
      <button onClick={handleDownloadJSON} className="flex items-center gap-2 text-gray-700 hover:text-[#f79003] font-medium cursor-pointer">
        <FileJson size={18} /> JSON
      </button>

      <button onClick={handleExportPDF} className="btn-primary flex items-center gap-2 ml-2 cursor-pointer">
        <Download size={18} /> Export PDF
      </button>
    </div>
  );
}
