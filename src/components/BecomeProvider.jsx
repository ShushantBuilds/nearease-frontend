import React, { useState } from "react";
import { Briefcase, CheckCircle, Loader2 } from "lucide-react";
import { ProviderAPI } from "../services/providerApi";

import GoBackButton from "./GoBackButton";

export default function BecomeProvider({ user, onBack }) {
  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    experience: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Split comma-separated skills into an array if your backend expects it, 
      // or just send as a string depending on your Spring Boot entity.
      await ProviderAPI.apply(formData);
      setIsSuccess(true);
    } catch (err) {
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Application Submitted!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Thank you for applying to be a NearEase Provider. Our admin team will review your application shortly. 
          Once approved, you will gain access to the Provider Dashboard!
        </p>
        <button onClick={onBack} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 md:p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shrink-0">
          <Briefcase className="text-indigo-600 dark:text-indigo-400 w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Become a Professional</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Join NearEase and start earning by offering your services.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Professional Bio</label>
          <textarea 
            required rows="3" placeholder="Tell customers about yourself and your work ethic..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills / Expertise</label>
            <input 
              required type="text" placeholder="e.g. Plumbing, Carpentry"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Years of Experience</label>
            <input 
              required type="number" min="0" placeholder="e.g. 5"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Business Address</label>
          <input 
            required type="text" placeholder="Full address for verification"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onBack} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex-[2] flex justify-center items-center">
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}