import React from 'react';
import MetaTags from '../components/MetaTags';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <MetaTags title="About" />
      <h1 className="text-3xl font-bold mb-6">About ResumeCraft</h1>
      <p className="mb-4">ResumeCraft is a demonstration project showcasing the power of Generative AI in practical web applications.</p>
      <p className="mb-4">Built with React, Vite, and Google's Gemini 3 Pro model, it aims to simplify the job application process by automating the tedious task of resume writing and formatting.</p>
    </div>
  );
}
