import React from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      <MetaTags title="Home" />
      
      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-orange-50 to-white">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Craft Your Perfect Resume <br />
          <span className="text-[#f79003]">Powered by AI</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Generate a professional, ATS-friendly resume in minutes. 
          Our AI writes the content, you choose the style.
        </p>
        <Link to="/editor" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
          Build My Resume <ArrowRight />
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'AI Content Generation', desc: 'Uses Gemini 3 Pro to write professional summaries and bullet points.' },
            { title: 'Drag & Drop Editor', desc: 'Fine-tune your layout with our intuitive canvas editor.' },
            { title: 'PDF Export', desc: 'Download high-quality PDFs ready for job applications.' }
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle className="text-[#f79003] mb-4 h-8 w-8" />
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
