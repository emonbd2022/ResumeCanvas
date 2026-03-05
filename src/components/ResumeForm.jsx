import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ResumeForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    skills: '',
    experience: '',
    education: '',
    summary: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              required
              name="name"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f79003] outline-none"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Job Title</label>
            <input
              required
              name="title"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f79003] outline-none"
              placeholder="Software Engineer"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            required
            type="email"
            name="email"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f79003] outline-none"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professional Summary / Bio
            <span className="text-gray-400 font-normal ml-2 text-xs">(We'll polish this)</span>
          </label>
          <textarea
            name="summary"
            rows="3"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f79003] outline-none"
            placeholder="Experienced developer with a passion for frontend..."
            value={formData.summary}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Experience
            <span className="text-gray-400 font-normal ml-2 text-xs">(Company, Role, Dates, Key Tasks)</span>
          </label>
          <textarea
            required
            name="experience"
            rows="4"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f79003] outline-none"
            placeholder="Acme Corp, Senior Dev, 2020-Present. Led team of 5, improved site speed by 50%."
            value={formData.experience}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
          <textarea
            name="education"
            rows="2"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f79003] outline-none"
            placeholder="University of Tech, BS Computer Science, 2019"
            value={formData.education}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
          <input
            name="skills"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#f79003] outline-none"
            placeholder="React, Node.js, Leadership, Agile"
            value={formData.skills}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary flex justify-center items-center gap-2 mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Resume with AI'}
        </button>
      </form>
    </div>
  );
}
