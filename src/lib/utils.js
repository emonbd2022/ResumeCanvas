// Helper to flatten the nested resume JSON into a flat list of renderable items based on template slots
export const mapContentToTemplate = (content, template) => {
  if (!content || !template) return [];

  const items = [];
  
  // Helper to safely get value from dot notation string (e.g. "basics.name")
  const getValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  template.layout.forEach((slot) => {
    let value = '';
    
    if (slot.type === 'static') {
      value = slot.content;
    } else if (slot.type === 'dynamic') {
      value = getValue(content, slot.field);
    } else if (slot.type === 'list') {
      // Handle arrays like work experience
      const listData = getValue(content, slot.field) || [];
      // This is a simplified list mapper. In a real app, you'd generate multiple text blocks
      // For this demo, we join them with newlines
      if (Array.isArray(listData)) {
        value = listData.map(item => {
          if (typeof item === 'string') return `• ${item}`;
          // For objects like work history, we format a string block
          if (slot.format) {
            return slot.format.replace(/{(\w+)}/g, (_, key) => item[key] || '');
          }
          return JSON.stringify(item);
        }).join('\n\n');
      }
    }

    if (value) {
      items.push({
        ...slot,
        id: slot.id || Math.random().toString(36).substr(2, 9),
        text: String(value),
      });
    }
  });

  return items;
};
