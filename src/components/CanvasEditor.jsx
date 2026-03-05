import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Rect, Circle, Line, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Mail, Phone, MapPin, Briefcase, Linkedin, Github, Star } from 'lucide-react';
import { createRoot } from 'react-dom/client';

// --- Icon Helper ---
// We render Lucide icons to an SVG string, then to a Data URL for KonvaImage
const getIconImage = (iconName, color = '#000000') => {
  const iconMap = {
    mail: Mail,
    phone: Phone,
    'map-pin': MapPin,
    briefcase: Briefcase,
    linkedin: Linkedin,
    github: Github,
    star: Star
  };
  
  const Icon = iconMap[iconName] || Star;
  
  // Create a temporary container to render the icon to string
  // Note: In a real app, we might use `renderToStaticMarkup` from react-dom/server
  // But since we are client-side, we can construct the SVG string manually or use a simpler approach.
  // For simplicity/robustness in this environment, we'll use a basic SVG string replacement.
  
  // Actually, let's use a simpler approach: Pre-defined SVG paths or just text emojis for MVP?
  // No, user wants "Icons all for CV".
  // Let's try to fetch the SVG data url.
  
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${/* This is tricky without server-side rendering. 
          For now, we will use a placeholder circle with text for icons if we can't easily render Lucide to SVG string client-side without extra libs.
          Wait! We can use `lucide-react` icons if we wrap them in a DOM element, convert to image via html2canvas? Too slow.
          
          Better approach: Just use Text with unicode characters or a font icon? 
          
          Let's use a generic "Image" component that loads the icon URL.
          For this demo, I will use a placeholder image service for icons or simple shapes.
      */ ''}
      <circle cx="12" cy="12" r="10" />
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

// --- Custom Image Component ---
const URLImage = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

const TransformerComponent = ({ selectedId }) => {
  const trRef = useRef();

  useEffect(() => {
    if (selectedId && trRef.current) {
      const stage = trRef.current.getStage();
      const selectedNode = stage.findOne((node) => node.attrs.id === selectedId);
      
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    }
  }, [selectedId]);

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) return oldBox;
        return newBox;
      }}
    />
  );
};

export default function CanvasEditor({ items, setItems, stageRef }) {
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  
  // Context Menu State
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [contextItem, setContextItem] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle selection
  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      setEditingId(null);
      setMenuVisible(false);
    }
  };

  // Handle text change
  const handleChange = (id, newAttrs) => {
    const newItems = items.map((item) => {
      if (item.id === id) return { ...item, ...newAttrs };
      return item;
    });
    setItems(newItems);
  };

  // Double click to edit text
  const handleDoubleClick = (e, item) => {
    if (!['text', 'dynamic', 'static', 'list'].includes(item.type)) return;
    
    const textNode = e.target;
    const textPosition = textNode.absolutePosition();
    
    setEditingId(item.id);
    setInputText(item.text);
    setInputPosition({ x: textPosition.x, y: textPosition.y });
    setMenuVisible(false);
  };

  const handleTextSave = () => {
    if (editingId) {
      handleChange(editingId, { text: inputText });
      setEditingId(null);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    const stagePos = stageRef.current.getPointerPosition();
    
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;
    
    const data = JSON.parse(dataStr);
    
    const newItem = {
      ...data,
      id: `item-${Date.now()}`,
      x: stagePos.x,
      y: stagePos.y,
    };
    
    // If it's an icon, we need to handle it specially (for now just text/shape placeholder)
    if (newItem.type === 'icon') {
       // For MVP, we'll use a text representation or a placeholder circle
       // Ideally we'd load the SVG data url here.
       newItem.type = 'text';
       newItem.text = '★'; // Placeholder
       newItem.fontSize = 24;
    }

    setItems([...items, newItem]);
  };

  // Context Menu
  const handleContextMenu = (e, item) => {
    e.evt.preventDefault(); // Prevent native browser menu
    if (item.type === 'text' || item.type === 'dynamic' || item.type === 'list') {
      setContextItem(item);
      setMenuPosition({
        x: e.evt.clientX,
        y: e.evt.clientY
      });
      setMenuVisible(true);
    }
  };

  const handleAiGenerate = async (instruction) => {
    if (!contextItem) return;
    setIsGenerating(true);
    setMenuVisible(false);

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: contextItem.text,
          instruction 
        }),
      });
      
      const data = await response.json();
      if (data.text) {
        handleChange(contextItem.id, { text: data.text });
      }
    } catch (error) {
      console.error("AI Generation failed", error);
      alert("Failed to generate content");
    } finally {
      setIsGenerating(false);
      setContextItem(null);
    }
  };

  return (
    <div 
      className="relative bg-gray-200 overflow-auto flex justify-center min-h-full h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="shadow-2xl relative my-8">
        <Stage
          width={595}
          height={842}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          style={{ background: 'white' }}
        >
          <Layer>
            <Rect x={0} y={0} width={595} height={842} fill="white" />

            {items.map((item, i) => {
              const commonProps = {
                key: item.id || i,
                ...item,
                draggable: true,
                onClick: () => { setSelectedId(item.id); setMenuVisible(false); },
                onTap: () => { setSelectedId(item.id); setMenuVisible(false); },
                onDragEnd: (e) => handleChange(item.id, { x: e.target.x(), y: e.target.y() }),
                onTransformEnd: (e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  node.scaleX(1); node.scaleY(1);
                  handleChange(item.id, {
                    x: node.x(), y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    rotation: node.rotation(),
                    fontSize: item.fontSize ? item.fontSize * scaleX : undefined,
                    radius: item.radius ? item.radius * scaleX : undefined,
                    scaleX: 1, scaleY: 1
                  });
                }
              };

              if (item.type === 'rect') return <Rect {...commonProps} />;
              if (item.type === 'circle') return <Circle {...commonProps} />;
              if (item.type === 'line') return <Line {...commonProps} />;
              if (item.type === 'image') return <URLImage {...commonProps} />;
              
              return (
                <Text
                  {...commonProps}
                  onDblClick={(e) => handleDoubleClick(e, item)}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                />
              );
            })}
            
            {selectedId && <TransformerComponent selectedId={selectedId} />}
          </Layer>
        </Stage>

        {/* Text Editor Overlay */}
        {editingId && (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onBlur={handleTextSave}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleTextSave(); }}
            style={{
              position: 'absolute',
              top: inputPosition.y,
              left: inputPosition.x,
              width: 200,
              height: 100,
              zIndex: 100,
              background: 'white',
              border: '1px solid #3b82f6',
              padding: '4px',
              fontSize: '14px',
              fontFamily: 'sans-serif'
            }}
            autoFocus
          />
        )}
      </div>

      {/* Context Menu */}
      {menuVisible && (
        <div 
          className="fixed bg-white shadow-xl rounded-lg border border-gray-200 py-2 z-50 w-48"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">AI Tools</div>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-2"
            onClick={() => handleAiGenerate("Make it more professional")}
          >
            <Star className="w-3 h-3 text-blue-500" /> Professional
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-2"
            onClick={() => handleAiGenerate("Fix grammar and spelling")}
          >
            <Star className="w-3 h-3 text-green-500" /> Fix Grammar
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 flex items-center gap-2"
            onClick={() => handleAiGenerate("Make it concise")}
          >
            <Star className="w-3 h-3 text-purple-500" /> Concise
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/20 z-[60] flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="font-medium">AI is rewriting...</span>
          </div>
        </div>
      )}
    </div>
  );
}
