import React, { useState, useEffect } from "react";
import { 
  Briefcase, DollarSign, Clock, CheckCircle, 
  AlertCircle, MapPin, Calendar, User, Loader2, Plus 
} from "lucide-react";
import { ProviderAPI } from "../services/providerApi";
import { BookingAPI } from "../services/bookingApi";
import AddServiceModal from "./AddServiceModal";

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); 
  const [dashboardData, setDashboardData] = useState(null); // Unified name
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [completingJobId, setCompletingJobId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  
  // Unified modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    refreshDashboardData(); // Unified function name
  }, []);

  const refreshDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, requestsData] = await Promise.all([
        ProviderAPI.getDashboard().catch(() => null),
        BookingAPI.getBookingRequests().catch(() => [])
      ]);
      
      setDashboardData(statsData);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await BookingAPI.updateStatus(bookingId, { status: newStatus });
      setRequests(requests.map(req => req.id === bookingId ? { ...req, status: newStatus } : req));
    } catch (error) {
      alert("Failed to update booking status.");
    }
  };

  const handleCompleteJob = async (bookingId) => {
    if (!otpCode || otpCode.length < 4) {
      alert("Please enter a valid OTP provided by the customer.");
      return;
    }
    
    try {
      await BookingAPI.completeBooking(bookingId, { 
        otp: otpCode,
        beforeImage: "placeholder_url", 
        afterImage: "placeholder_url" 
      });
      
      setRequests(requests.map(req => req.id === bookingId ? { ...req, status: "COMPLETED" } : req));
      setCompletingJobId(null);
      setOtpCode("");
      alert("Job marked as completed successfully!");
    } catch (error) {
      alert("Failed to complete job. Check the OTP and try again.");
    }
  };

  // SAFETY NET 1: Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading your workspace...</p>
      </div>
    );
  }

  // SAFETY NET 2: Backend Crash / Empty Data Check (Prevents White Screen)
  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Failed to load data</h2>
        <p className="text-gray-500 max-w-md mt-2">
          We could not connect to your provider profile. Ensure your backend is running and the database is connected properly.
        </p>
        <button 
          onClick={refreshDashboardData}
          className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provider Workspace</h1>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === "overview" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900"}`}
          >
            Overview
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm ml-1 mr-1"
          >
            <Plus size={18} /> New Service
          </button>

          <button 
            onClick={() => setActiveTab("requests")}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${activeTab === "requests" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900"}`}
          >
            Job Requests
            {requests.filter(r => r.status === "PENDING").length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {requests.filter(r => r.status === "PENDING").length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- TAB 1: OVERVIEW --- */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
              <DollarSign className="text-green-600 dark:text-green-400 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{dashboardData?.totalEarning || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <CheckCircle className="text-blue-600 dark:text-blue-400 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.completedJobs || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
              <Clock className="text-yellow-600 dark:text-yellow-400 w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Requests</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.pendingRequest || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: JOB REQUESTS --- */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {requests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs yet</h3>
              <p className="text-gray-500">When customers book your services, they will appear here.</p>
            </div>
          ) : (
            requests.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.serviceOffering?.name || "Service"}</h3>
                      <p className="text-indigo-600 font-extrabold text-lg">₹{job.serviceOffering?.price || 0}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                      ${job.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : 
                        job.status === "CONFIRMED" ? "bg-blue-100 text-blue-800" : 
                        job.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-4">
                    <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-400" /> {new Date(job.scheduleTime).toLocaleString()}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400" /> {job.workLocation}
                    </p>
                    {job.customer && (
                      <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 md:col-span-2">
                        <User className="w-4 h-4 text-gray-400" /> Customer: {job.customer.firstName} {job.customer.lastName}
                      </p>
                    )}
                  </div>

                  {job.status === "PENDING" && (
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => handleUpdateStatus(job.id, "CONFIRMED")} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition">
                        Accept Job
                      </button>
                      <button onClick={() => handleUpdateStatus(job.id, "CANCELLED")} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-100 transition">
                        Decline
                      </button>
                    </div>
                  )}

                  {job.status === "CONFIRMED" && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      {completingJobId === job.id ? (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Enter Customer OTP" 
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button onClick={() => handleCompleteJob(job.id)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                            Submit
                          </button>
                          <button onClick={() => setCompletingJobId(null)} className="px-4 text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setCompletingJobId(job.id)} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Mark as Completed
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Properly synced Modal implementation */}
      <AddServiceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => refreshDashboardData()}
        hasExistingService={dashboardData?.activeServices?.length > 0} 
      />
    </div>
  );
}