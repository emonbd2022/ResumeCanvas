import React from 'react';
import MetaTags from '../components/MetaTags';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <MetaTags title="Privacy Policy" />
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p>We do not store your personal data on our servers permanently. Data is processed in real-time to generate your resume and is then discarded or stored locally on your device.</p>
    </div>
  );
}
