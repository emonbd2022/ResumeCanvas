import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Rect, Transformer } from 'react-konva';

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
        // limit resize
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
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

  // Handle selection
  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      setEditingId(null);
    }
  };

  // Handle text change from dragging/transforming
  const handleChange = (id, newAttrs) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, ...newAttrs };
      }
      return item;
    });
    setItems(newItems);
  };

  // Handle double click to edit
  const handleDoubleClick = (e, item) => {
    const textNode = e.target;
    const stage = textNode.getStage();
    const textPosition = textNode.absolutePosition();
    const stageContainer = stage.container();
    
    // Calculate position for the textarea overlay
    // We need to account for the stage position relative to the viewport
    const areaPosition = {
      x: textPosition.x,
      y: textPosition.y,
    };

    setEditingId(item.id);
    setInputText(item.text);
    setInputPosition(areaPosition);
  };

  // Save edited text
  const handleTextSave = () => {
    if (editingId) {
      handleChange(editingId, { text: inputText });
      setEditingId(null);
    }
  };

  return (
    <div className="relative bg-gray-200 p-8 overflow-auto flex justify-center min-h-[800px]">
      <div className="shadow-2xl relative">
        <Stage
          width={595} // A4 width at 72 DPI approx
          height={842} // A4 height
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          style={{ background: 'white' }}
        >
          <Layer>
            {/* Background */}
            <Rect x={0} y={0} width={595} height={842} fill="white" />

            {items.map((item, i) => {
              if (item.type === 'rect') {
                 return <Rect key={item.id || i} {...item} />;
              }
              return (
                <Text
                  key={item.id}
                  {...item}
                  draggable
                  onClick={() => setSelectedId(item.id)}
                  onTap={() => setSelectedId(item.id)}
                  onDblClick={(e) => handleDoubleClick(e, item)}
                  onDragEnd={(e) => {
                    handleChange(item.id, {
                      x: e.target.x(),
                      y: e.target.y(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    
                    // Reset scale and update font size/width instead
                    node.scaleX(1);
                    node.scaleY(1);
                    
                    handleChange(item.id, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(5, node.width() * scaleX),
                      rotation: node.rotation(),
                      fontSize: item.fontSize * scaleX // Optional: scale font size
                    });
                  }}
                />
              );
            })}
            
            {selectedId && (
              <TransformerComponent selectedId={selectedId} />
            )}
          </Layer>
        </Stage>

        {/* Inline Text Editor Overlay */}
        {editingId && (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onBlur={handleTextSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleTextSave();
              }
            }}
            style={{
              position: 'absolute',
              top: inputPosition.y,
              left: inputPosition.x,
              width: 200,
              height: 100,
              zIndex: 100,
              background: 'white',
              border: '1px solid #f79003',
              padding: '4px',
              fontSize: '14px',
              fontFamily: 'sans-serif'
            }}
            autoFocus
          />
        )}
      </div>
    </div>
  );
}
