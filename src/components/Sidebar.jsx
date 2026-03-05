import React, { useState } from 'react';
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Image as ImageIcon, 
  Upload, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Github,
  Star,
  Minus
} from 'lucide-react';

const DraggableItem = ({ type, label, icon: Icon, onDragStart, data }) => (
  <div
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData('application/json', JSON.stringify({ type, ...data }));
    }}
    className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md cursor-grab transition-all border border-gray-100"
  >
    <Icon className="w-6 h-6 text-gray-600 mb-2" />
    <span className="text-xs text-gray-500 font-medium">{label}</span>
  </div>
);

export default function Sidebar({ onUploadImage }) {
  const [activeTab, setActiveTab] = useState('elements'); // elements, icons, uploads

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {['elements', 'icons', 'uploads'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize ${
              activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'elements' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Shapes</h3>
              <div className="grid grid-cols-3 gap-3">
                <DraggableItem type="rect" label="Rectangle" icon={Square} data={{ width: 100, height: 100, fill: '#3b82f6' }} />
                <DraggableItem type="circle" label="Circle" icon={CircleIcon} data={{ radius: 50, fill: '#ef4444' }} />
                <DraggableItem type="line" label="Line" icon={Minus} data={{ points: [0, 0, 200, 0], stroke: '#000', strokeWidth: 2 }} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Text</h3>
              <div className="grid grid-cols-2 gap-3">
                <DraggableItem type="text" label="Heading" icon={Type} data={{ text: 'Heading', fontSize: 24, fontStyle: 'bold' }} />
                <DraggableItem type="text" label="Body" icon={Type} data={{ text: 'Body text goes here', fontSize: 12 }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'icons' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Icons</h3>
            <div className="grid grid-cols-4 gap-3">
              <DraggableItem type="icon" label="Mail" icon={Mail} data={{ iconName: 'mail' }} />
              <DraggableItem type="icon" label="Phone" icon={Phone} data={{ iconName: 'phone' }} />
              <DraggableItem type="icon" label="Map" icon={MapPin} data={{ iconName: 'map-pin' }} />
              <DraggableItem type="icon" label="Work" icon={Briefcase} data={{ iconName: 'briefcase' }} />
              <DraggableItem type="icon" label="LinkedIn" icon={Linkedin} data={{ iconName: 'linkedin' }} />
              <DraggableItem type="icon" label="GitHub" icon={Github} data={{ iconName: 'github' }} />
              <DraggableItem type="icon" label="Star" icon={Star} data={{ iconName: 'star' }} />
            </div>
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to upload image</p>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Uploaded images will appear on the canvas automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
