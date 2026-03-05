import React from 'react';

export default function MetaTags({ title, description }) {
  React.useEffect(() => {
    document.title = title ? `${title} | ResumeCraft` : 'ResumeCraft - AI Resume Builder';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || 'Build professional resumes in minutes with AI.');
    }
  }, [title, description]);

  return null;
}
