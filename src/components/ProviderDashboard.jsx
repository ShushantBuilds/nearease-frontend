import React, { useState, useEffect } from "react";
import { 
  Briefcase, DollarSign, Clock, CheckCircle, 
  AlertCircle, MapPin, Calendar, User, Loader2, Plus, TrendingUp, XCircle
} from "lucide-react";
import { ProviderAPI } from "../services/providerApi";
import { BookingAPI } from "../services/bookingApi";
import AddServiceModal from "./AddServiceModal";

export default function ProviderDashboard() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'earnings', 'completed', 'requests'
  
  // Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    refreshDashboardData();
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

  // --- NEW BOOKING LIFECYCLE (ACCEPT, REJECT, COMPLETE) ---
  const handleAction = async (bookingId, actionType) => {
    try {
      if (actionType === "REJECTED") {
        await BookingAPI.updateStatus(bookingId, { status: "REJECTED" });
        // Remove the rejected request from UI immediately
        setRequests(requests.filter(req => req.id !== bookingId));
        alert("Service request rejected.");
      } 
      else if (actionType === "ACCEPTED") {
        await BookingAPI.updateStatus(bookingId, { status: "ACCEPTED" });
        // Update the card to show the "Mark as Complete" button
        setRequests(requests.map(req => req.id === bookingId ? { ...req, status: "ACCEPTED" } : req));
        alert("Service request accepted!");
      }
      else if (actionType === "COMPLETED") {
        await BookingAPI.completeBooking(bookingId, { status: "COMPLETED" });
        setRequests(requests.map(req => req.id === bookingId ? { ...req, status: "COMPLETED" } : req));
        alert("Service marked as completed!");
        refreshDashboardData(); // Refresh to update earnings & completed count
      }
    } catch (error) {
      alert(`Failed to update booking to ${actionType}. Please try again.`);
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

  // SAFETY NET 2: Backend Crash / Empty Data Check
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provider Workspace</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} /> New Service
        </button>
      </div>

      {/* --- INTERACTIVE METRIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Clickable Earnings Card */}
        <div 
          onClick={() => setActiveTab("earnings")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 ${activeTab === "earnings" ? "border-indigo-500 shadow-md ring-2 ring-indigo-100 dark:ring-indigo-900" : "border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md bg-white"}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{dashboardData?.totalEarning || 0}</h3>
            </div>
          </div>
        </div>
        
        {/* Clickable Completed Jobs Card */}
        <div 
          onClick={() => setActiveTab("completed")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 ${activeTab === "completed" ? "border-indigo-500 shadow-md ring-2 ring-indigo-100 dark:ring-indigo-900" : "border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md bg-white"}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.completedJobs || 0}</h3>
            </div>
          </div>
        </div>

        {/* Clickable Pending Requests Card */}
        <div 
          onClick={() => setActiveTab("requests")}
          className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 ${activeTab === "requests" ? "border-indigo-500 shadow-md ring-2 ring-indigo-100 dark:ring-indigo-900" : "border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md bg-white"}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Requests</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{requests.filter(r => r.status === "PENDING").length}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* --- DYNAMIC VIEWS BASED ON TAB SELECTION --- */}
      
      {/* 1. EARNINGS VIEW */}
      {activeTab === "earnings" && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold dark:text-white">Earnings History</h2>
          </div>
          <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400">
            [ Earnings Graph Placeholder ]
          </div>
        </div>
      )}

      {/* 2. REQUESTS & COMPLETED VIEWS */}
      {(activeTab === "requests" || activeTab === "completed" || activeTab === "overview") && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold dark:text-white">
            {activeTab === "completed" ? "Job History" : "Active Service Requests"}
          </h2>
          
          {requests.length === 0 || (activeTab === "completed" && requests.filter(r => r.status === "COMPLETED").length === 0) || (activeTab === "requests" && requests.filter(r => r.status !== "COMPLETED").length === 0) ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No requests to display in this category.</p>
            </div>
          ) : (
            requests
              .filter(job => activeTab === "completed" ? job.status === "COMPLETED" : (activeTab === "requests" ? job.status !== "COMPLETED" : true))
              .map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.serviceOffering?.name || "Service Requested"}</h3>
                    <p className="text-indigo-600 font-extrabold text-lg">₹{job.serviceOffering?.price || 0}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                    ${job.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : 
                      job.status === "ACCEPTED" ? "bg-blue-100 text-blue-800" : 
                      job.status === "COMPLETED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-6">
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" /> {new Date(job.scheduleTime).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" /> {job.workLocation}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 md:col-span-2">
                    <User className="w-4 h-4 text-gray-400" /> Customer: {job.customer?.firstName} {job.customer?.lastName}
                  </p>
                </div>

                {/* --- THE NEW BOOKING LIFECYCLE BUTTONS --- */}
                {job.status === "PENDING" && (
                  <div className="flex gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <button 
                      onClick={() => handleAction(job.id, "ACCEPTED")} 
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                    >
                      Accept Service Request
                    </button>
                    <button 
                      onClick={() => handleAction(job.id, "REJECTED")} 
                      className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}

                {job.status === "ACCEPTED" && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <button 
                      onClick={() => handleAction(job.id, "COMPLETED")} 
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition flex justify-center items-center gap-2 shadow-sm"
                    >
                      <CheckCircle size={20} /> Mark as Complete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Add Service Modal */}
      <AddServiceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => refreshDashboardData()}
        hasExistingService={dashboardData?.activeServices?.length > 0} 
      />
    </div>
  );
}