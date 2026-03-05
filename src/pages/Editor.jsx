import React, { useState, useRef, useEffect } from 'react';
import ResumeForm from '../components/ResumeForm';
import CanvasEditor from '../components/CanvasEditor';
import TemplateSelector from '../components/TemplateSelector';
import PreviewControls from '../components/PreviewControls';
import MetaTags from '../components/MetaTags';
import { mapContentToTemplate } from '../lib/utils';

export default function Editor() {
  const [step, setStep] = useState('form'); // form | editor
  const [isLoading, setIsLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [currentTemplateId, setCurrentTemplateId] = useState('template-1');
  const [canvasItems, setCanvasItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const stageRef = useRef(null);

  // Load template definition
  const loadTemplate = async (templateId) => {
    try {
      const res = await fetch(`/templates/${templateId}.json`);
      const template = await res.json();
      return template;
    } catch (e) {
      console.error("Failed to load template", e);
      return null;
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formData, templateId: currentTemplateId }),
      });
      
      const data = await response.json();
      
      if (data.resume) {
        setResumeData(data.resume);
        
        // Initial render
        const template = await loadTemplate(currentTemplateId);
        const items = mapContentToTemplate(data.resume, template);
        setCanvasItems(items);
        setStep('editor');
      }
    } catch (error) {
      alert('Error generating resume. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = async (templateId) => {
    setCurrentTemplateId(templateId);
    if (resumeData) {
      const template = await loadTemplate(templateId);
      const items = mapContentToTemplate(resumeData, template);
      setCanvasItems(items);
    }
  };

  // Undo/Redo logic
  const updateCanvasItems = (newItems) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newItems);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanvasItems(newItems);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasItems(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasItems(history[historyIndex + 1]);
    }
  };

  const handleSave = () => {
    localStorage.setItem('resumeCraftData', JSON.stringify({
      resumeData,
      canvasItems,
      currentTemplateId
    }));
    alert('Saved to local storage!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags title="Editor" />
      
      {step === 'form' && (
        <div className="max-w-3xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Let's build your resume</h1>
          <ResumeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      )}

      {step === 'editor' && (
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <TemplateSelector 
            currentTemplate={currentTemplateId} 
            onSelect={handleTemplateChange} 
          />
          
          <div className="flex-grow overflow-auto py-8">
            <CanvasEditor 
              items={canvasItems} 
              setItems={updateCanvasItems} 
              stageRef={stageRef} 
            />
          </div>

          <PreviewControls 
            stageRef={stageRef}
            onSave={handleSave}
            onUndo={handleUndo}
            onRedo={handleRedo}
            resumeData={resumeData}
          />
        </div>
      )}
    </div>
  );
}
