import React, { useState, useEffect } from "react";
import { 
  Briefcase, DollarSign, Clock, CheckCircle, AlertCircle, MapPin, 
  Calendar, User, Loader2, Plus, TrendingUp, XCircle, FileText, Trash2, Image as ImageIcon
} from "lucide-react";
import { ProviderAPI } from "../services/providerApi";
import { BookingAPI } from "../services/bookingApi";
import AddServiceModal from "./AddServiceModal";

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); 
  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [hiddenIds, setHiddenIds] = useState(() => JSON.parse(localStorage.getItem("hiddenProviderBookings") || "[]"));
  
  const [completingJobId, setCompletingJobId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");

  const mockGraphData = [
    { day: "Mon", height: "40%", amount: 400 },
    { day: "Tue", height: "70%", amount: 700 },
    { day: "Wed", height: "30%", amount: 300 },
    { day: "Thu", height: "90%", amount: 900 },
    { day: "Fri", height: "50%", amount: 500 },
    { day: "Sat", height: "100%", amount: 1000 },
    { day: "Sun", height: "60%", amount: 600 }
  ];

  useEffect(() => { refreshDashboardData(); }, []);

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

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const statusToSend = newStatus === "ACCEPTED" ? "CONFIRMED" : newStatus;
      await BookingAPI.updateStatus(bookingId, { status: statusToSend });
      
      if (newStatus === "REJECTED") {
        setRequests(requests.filter(req => req.id !== bookingId));
      } else {
        setRequests(requests.map(req => req.id === bookingId ? { ...req, bookingStatus: "CONFIRMED" } : req));
      }
    } catch (error) {
      alert(`Failed to update request.`);
    }
  };

  const handleInitiateCompletion = async (bookingId) => {
    try {
      await BookingAPI.sendBookingOtp(bookingId);
      setCompletingJobId(bookingId);
    } catch (error) {
      alert(error.message || "Failed to send OTP to the customer.");
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpCode || otpCode.length < 4) return alert("Please enter a valid OTP.");
    setIsSubmittingOtp(true);
    
    try {
      const formData = new FormData();
      formData.append("otp", otpCode);
      if (beforeImage) formData.append("beforeImage", beforeImage);
      if (afterImage) formData.append("afterImage", afterImage);
      
      await BookingAPI.completeBooking(completingJobId, formData);
      
      setCompletionMessage("The Service has been completed.");
      setRequests(requests.map(req => req.id === completingJobId ? { ...req, bookingStatus: "COMPLETED" } : req));
      
      setTimeout(() => {
        setCompletingJobId(null);
        setOtpCode("");
        setBeforeImage(null);
        setAfterImage(null);
        setCompletionMessage("");
        refreshDashboardData(); 
      }, 2000);
      
    } catch (error) {
      alert(error.message || "Invalid OTP. Please check with the customer.");
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleDeleteCard = (id) => {
    if(window.confirm("Are you sure you want to delete this booking from your dashboard?")) {
      const updated = [...hiddenIds, id];
      setHiddenIds(updated);
      localStorage.setItem("hiddenProviderBookings", JSON.stringify(updated));
    }
  };

  const visibleRequests = requests.filter(r => !hiddenIds.includes(r.id));

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provider Workspace</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm">
          <Plus size={18} /> New Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div onClick={() => setActiveTab("earnings")} className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 ${activeTab === "earnings" ? "border-indigo-500 shadow-md ring-2 ring-indigo-100" : "border-gray-100 dark:border-gray-700 bg-white"}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center"><DollarSign size={28} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{dashboardData?.totalEarning || 0}</h3>
            </div>
          </div>
        </div>
        
        <div onClick={() => setActiveTab("completed")} className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 ${activeTab === "completed" ? "border-indigo-500 shadow-md ring-2 ring-indigo-100" : "border-gray-100 dark:border-gray-700 bg-white"}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><CheckCircle size={28} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.completedJobs || 0}</h3>
            </div>
          </div>
        </div>

        <div onClick={() => setActiveTab("requests")} className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 ${activeTab === "requests" ? "border-indigo-500 shadow-md ring-2 ring-indigo-100" : "border-gray-100 dark:border-gray-700 bg-white"}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center"><Clock size={28} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Requests</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{visibleRequests.filter(r => r.bookingStatus === "PENDING").length}</h3>
            </div>
          </div>
        </div>
      </div>

      {activeTab === "earnings" && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3"><TrendingUp className="text-indigo-600" /><h2 className="text-xl font-bold dark:text-white">Earnings History</h2></div>
            <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-bold text-gray-600 dark:text-gray-300">This Week</span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2 md:px-10 pb-6 border-b border-gray-100 dark:border-gray-700 relative">
             <div className="absolute left-0 top-0 h-full border-l border-gray-100 dark:border-gray-700 pointer-events-none"></div>
             
             {mockGraphData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">₹{data.amount}</span>
                  <div 
                     className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-700 ease-in-out hover:brightness-110 shadow-sm"
                     style={{ height: data.height }}
                  ></div>
                  <span className="text-xs text-gray-500 font-medium mt-3">{data.day}</span>
                </div>
             ))}
          </div>
        </div>
      )}

      {(activeTab === "requests" || activeTab === "completed" || activeTab === "overview") && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-xl font-bold dark:text-white">{activeTab === "completed" ? "Job History" : "Active Service Requests"}</h2>
          
          {visibleRequests.filter(job => activeTab === "completed" ? job.bookingStatus === "COMPLETED" : job.bookingStatus !== "COMPLETED").length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300"><Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No requests to display.</p></div>
          ) : (
            visibleRequests
              .filter(job => activeTab === "completed" ? job.bookingStatus === "COMPLETED" : job.bookingStatus !== "COMPLETED")
              .map((job) => {
                const note = job.CostumerRequest || job.customerRequest || job.note;
                
                // THE FIX: Provide the exact, pure base price without any added platform fees.
                const providerCost = job.price || job.serviceOffering?.price || 0;

                return (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm p-6 relative">
                  
                  <button onClick={() => handleDeleteCard(job.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-full shadow-sm" title="Delete from dashboard">
                    <Trash2 size={18} />
                  </button>

                  <div className="flex justify-between items-start mb-4 pr-12">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.ServiceName || job.serviceOffering?.name || "Service Requested"}</h3>
                      <p className="text-sm font-mono text-gray-500 mt-1">Booking ID: #{job.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{providerCost}</p>
                      <span className="inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full uppercase bg-gray-100 text-gray-800">
                        {job.bookingStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><Calendar className="w-4 h-4 text-gray-400 mt-0.5" /> <span><strong>Time:</strong> <br/>{new Date(job.scheduledTime).toLocaleString()}</span></p>
                    <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /> <span><strong>Location:</strong> <br/>{job.workLocation}</span></p>
                    <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"><User className="w-4 h-4 text-gray-400 mt-0.5" /> <span><strong>Customer:</strong> <br/>{job.customer?.firstName} {job.customer?.lastName}</span></p>
                    
                    {note && (
                      <p className="flex items-start gap-2 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg md:col-span-2 mt-2">
                        <FileText className="w-4 h-4 mt-0.5 shrink-0" /> 
                        <span><strong>Customer's Note:</strong> <br/>{note}</span>
                      </p>
                    )}
                  </div>

                  {job.bookingStatus === "PENDING" && (
                    <div className="flex gap-4 pt-2">
                      <button onClick={() => handleStatusChange(job.id, "ACCEPTED")} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Accept Request</button>
                      <button onClick={() => handleStatusChange(job.id, "REJECTED")} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition">Reject Request</button>
                    </div>
                  )}

                  {(job.bookingStatus === "CONFIRMED" || job.bookingStatus === "ACCEPTED") && (
                    <div className="pt-2">
                      <button onClick={() => handleInitiateCompletion(job.id)} className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition flex justify-center items-center gap-2 shadow-sm">
                        <CheckCircle size={20} /> Mark as Complete
                      </button>
                    </div>
                  )}
                </div>
              )})
          )}
        </div>
      )}
      
      {completingJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

            {completionMessage ? (
              <div className="py-6 animate-in zoom-in">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  <CheckCircle className="text-white w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completionMessage}</h3>
              </div>
            ) : (
              <>
                <button onClick={() => { setCompletingJobId(null); setBeforeImage(null); setAfterImage(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white z-10"><XCircle size={24} /></button>
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-indigo-600 dark:text-indigo-400 w-8 h-8" /></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Complete Service</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Enter the customer's 4-digit OTP and upload proof of work.</p>
                
                <input 
                  type="text" placeholder="Enter 4-digit OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border-2 border-white/50 bg-white/50 dark:bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 shadow-inner" maxLength={6}
                />

                <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-white/50">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><ImageIcon size={12}/> Before Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setBeforeImage(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-xl border border-white/50">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><ImageIcon size={12}/> After Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setAfterImage(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                </div>

                <button onClick={handleOtpSubmit} disabled={isSubmittingOtp} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex justify-center items-center">
                  {isSubmittingOtp ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Complete"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <AddServiceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => refreshDashboardData()} />
    </div>
  );
}