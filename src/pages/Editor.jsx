import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Save, ArrowLeft, LayoutTemplate, Palette, Type, Image as ImageIcon } from 'lucide-react';
import CanvasEditor from '../components/CanvasEditor';
import Sidebar from '../components/Sidebar';
import { jsPDF } from 'jspdf';

const Editor = () => {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const [step, setStep] = useState('form'); // form, editor
  const [resumeData, setResumeData] = useState(null);
  const [canvasItems, setCanvasItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState('template-1');
  const [templates, setTemplates] = useState([]);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        // Load all 4 templates
        const loadedTemplates = [];
        for (let i = 1; i <= 4; i++) {
          const response = await fetch(`/templates/template-${i}.json`);
          if (response.ok) {
            loadedTemplates.push(await response.json());
          }
        }
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error("Failed to load templates", error);
      }
    };
    loadTemplates();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    summary: '',
    experience: '',
    education: '',
    skills: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadTemplate = async (templateId) => {
    const response = await fetch(`/templates/${templateId}.json`);
    return await response.json();
  };

  const mapContentToTemplate = (content, template) => {
    return template.layout.map(item => {
      // Static content
      if (item.type === 'static' || item.type === 'rect' || item.type === 'circle' || item.type === 'line') {
        return { ...item, text: item.content || '' };
      }

      // Dynamic fields
      if (item.type === 'dynamic') {
        const value = getNestedValue(content, item.field);
        return { ...item, text: value || 'Placeholder' };
      }

      // Lists (Experience, Education, Skills)
      if (item.type === 'list') {
        const listData = getNestedValue(content, item.field);
        if (Array.isArray(listData)) {
          const formattedText = listData.map(entry => {
            let text = item.format;
            // Replace placeholders like {company} with actual values
            Object.keys(entry).forEach(key => {
              const val = entry[key];
              // Handle array values in list items (e.g. highlights)
              if (Array.isArray(val)) {
                 text = text.replace(`{${key}}`, val.map(v => `• ${v}`).join('\n'));
              } else {
                 text = text.replace(`{${key}}`, val || '');
              }
            });
            return text;
          }).join('\n\n');
          return { ...item, text: formattedText };
        }
      }

      return item;
    });
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formData, templateId: currentTemplateId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate resume');
      }

      if (data.resume) {
        setResumeData(data.resume);
        
        // Initial render
        const template = await loadTemplate(currentTemplateId);
        const items = mapContentToTemplate(data.resume, template);
        setCanvasItems(items);
        setStep('editor');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (stageRef.current) {
      const stage = stageRef.current;
      
      // High quality export
      const dataUrl = stage.toDataURL({ pixelRatio: 2 });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [595, 842] // A4 size in points (approx)
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('resume.pdf');
    }
  };

  const handleTemplateSwitch = async (templateId) => {
    setCurrentTemplateId(templateId);
    if (resumeData) {
      const template = await loadTemplate(templateId);
      const items = mapContentToTemplate(resumeData, template);
      setCanvasItems(items);
    }
  };

  const handleUploadImage = (imageDataUrl) => {
    const newItem = {
      id: `img-${Date.now()}`,
      type: 'image',
      src: imageDataUrl,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      draggable: true
    };
    setCanvasItems([...canvasItems, newItem]);
  };

  // Start from scratch handler
  const handleStartFromScratch = () => {
    setResumeData({}); // Empty data
    setCanvasItems([]); // Blank canvas
    setStep('editor');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ResumeCraft
          </h1>
        </div>
        
        {step === 'editor' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {step === 'form' ? (
          <div className="max-w-4xl mx-auto w-full p-8 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Resume</h2>
                <p className="text-gray-500">Enter your details and let AI structure it perfectly.</p>
                <button 
                  onClick={handleStartFromScratch}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                >
                  Or start from scratch (Blank Canvas)
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Software Engineer" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary (Draft)</label>
                  <textarea name="summary" value={formData.summary} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Experienced developer with a passion for..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Paste raw text)</label>
                  <textarea name="experience" value={formData.experience} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Senior Dev at Tech Co (2020-Present)..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <textarea name="education" value={formData.education} onChange={handleInputChange} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="BS CS, University of Tech..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                  <input name="skills" value={formData.skills} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="React, Node.js, TypeScript..." />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating with AI...
                    </>
                  ) : (
                    'Generate Resume with AI'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full h-full">
            {/* Sidebar Tools */}
            <Sidebar onUploadImage={handleUploadImage} />

            {/* Canvas Area */}
            <div className="flex-1 relative bg-gray-200 flex flex-col">
              {/* Template Switcher Bar */}
              <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4 overflow-x-auto">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Templates:</span>
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSwitch(t.id)}
                    className={`h-10 px-3 rounded border text-xs font-medium whitespace-nowrap transition-colors ${
                      currentTemplateId === t.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-auto">
                <CanvasEditor 
                  items={canvasItems} 
                  setItems={setCanvasItems} 
                  stageRef={stageRef} 
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Editor;
