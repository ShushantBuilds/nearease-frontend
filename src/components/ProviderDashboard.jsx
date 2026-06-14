import React, { useState, useEffect } from "react";
import { 
  Briefcase, DollarSign, Clock, CheckCircle, MapPin, 
  Calendar, User, Loader2, Plus, TrendingUp, XCircle, 
  FileText, Trash2, Image as ImageIcon, Maximize2, 
  Settings2, Edit3, Save, Tag
} from "lucide-react";
import { ProviderAPI } from "../services/providerApi";
import { BookingAPI } from "../services/bookingApi";
import AddServiceModal from "./AddServiceModal";
import GoBackButton from "./GoBackButton"; 

export default function ProviderDashboard({ defaultOpenAddService = false }) {
  const [activeTab, setActiveTab] = useState("overview"); 
  const [dashboardData, setDashboardData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(defaultOpenAddService);
  
  const [hiddenIds, setHiddenIds] = useState(() => JSON.parse(localStorage.getItem("hiddenProviderBookings") || "[]"));
  
  // Job Completion States
  const [completingJobId, setCompletingJobId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // --- NEW: EDIT SERVICE STATES ---
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({ price: "", description: "" });
  const [editFile, setEditFile] = useState(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const mockGraphData = [
    { day: "Mon", height: "40%", amount: 400 }, { day: "Tue", height: "70%", amount: 700 },
    { day: "Wed", height: "30%", amount: 300 }, { day: "Thu", height: "90%", amount: 900 },
    { day: "Fri", height: "50%", amount: 500 }, { day: "Sat", height: "100%", amount: 1000 },
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
      if (newStatus === "REJECTED") setRequests(requests.filter(req => req.id !== bookingId));
      else setRequests(requests.map(req => req.id === bookingId ? { ...req, bookingStatus: "CONFIRMED" } : req));
    } catch (error) { window.alert(`Failed to update request.`); }
  };

  const handleInitiateCompletion = async (bookingId) => {
    try {
      await BookingAPI.sendBookingOtp(bookingId);
      setCompletingJobId(bookingId);
    } catch (error) { window.alert(error.message || "Failed to send OTP to the customer."); }
  };

  const handleOtpSubmit = async () => {
    if (!otpCode || otpCode.length < 4) return window.alert("Please enter a valid OTP.");
    setIsSubmittingOtp(true);
    try {
      const formData = new FormData();
      formData.append("otp", otpCode);
      if (beforeImage) formData.append("beforeImages", beforeImage);
      if (afterImage) formData.append("afterImages", afterImage);
      await BookingAPI.completeBooking(completingJobId, formData);
      
      window.alert("Service successfully completed!");
      setRequests(requests.map(req => req.id === completingJobId ? { ...req, bookingStatus: "COMPLETED" } : req));
      setCompletingJobId(null); setOtpCode(""); setBeforeImage(null); setAfterImage(null);
      refreshDashboardData(); 
    } catch (error) { window.alert(error.message || "Invalid OTP. Please check with the customer."); } 
    finally { setIsSubmittingOtp(false); }
  };

  // --- NEW: HANDLE EDIT SUBMISSION ---
  const handleEditSubmit = async () => {
    if (!editForm.price || editForm.price <= 0) return window.alert("Price must be greater than 0.");
    if (!editForm.description.trim()) return window.alert("Description is required.");
    
    setIsSubmittingEdit(true);
    try {
      // Rebuild the ServiceOfferingRequest JSON exactly how Spring Boot expects it
      const serviceRequest = {
        name: editingService.name || editingService.serviceTitle || "Service",
        serviceTypeId: editingService.serviceTypeId || editingService.serviceType?.id || 1, // Fallback if needed
        price: Number(editForm.price),
        description: editForm.description
      };

      const formData = new FormData();
      formData.append("serviceDetails", new Blob([JSON.stringify(serviceRequest)], { type: "application/json" }));
      if (editFile) formData.append("file", editFile);

      await ProviderAPI.editService(editingService.id, formData);
      window.alert("Service updated successfully!");
      setEditingService(null);
      refreshDashboardData(); // Refreshes the active services array
    } catch (error) {
      window.alert(error.message || "Failed to update service.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setEditForm({ price: service.price || "", description: service.description || "" });
    setEditFile(null);
  };

  const visibleRequests = requests.filter(r => !hiddenIds.includes(r.id));

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <GoBackButton />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Provider Workspace</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <Plus size={20} /> New Service
        </button>
      </div>

      {/* --- ENHANCED 4-COLUMN STAT GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div onClick={() => setActiveTab("earnings")} className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 hover:shadow-md ${activeTab === "earnings" ? "border-green-500 shadow-md ring-2 ring-green-100 bg-green-50/30 dark:bg-green-900/10" : "border-gray-100 dark:border-gray-700 bg-white"}`}>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><DollarSign size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">Total Earnings</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">₹{dashboardData?.totalEarning || 0}</h3>
            </div>
          </div>
        </div>
        
        <div onClick={() => setActiveTab("completed")} className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 hover:shadow-md ${activeTab === "completed" ? "border-blue-500 shadow-md ring-2 ring-blue-100 bg-blue-50/30 dark:bg-blue-900/10" : "border-gray-100 dark:border-gray-700 bg-white"}`}>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><CheckCircle size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">Completed Jobs</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{dashboardData?.completedJobs || 0}</h3>
            </div>
          </div>
        </div>

        <div onClick={() => setActiveTab("requests")} className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 hover:shadow-md ${activeTab === "requests" ? "border-amber-500 shadow-md ring-2 ring-amber-100 bg-amber-50/30 dark:bg-amber-900/10" : "border-gray-100 dark:border-gray-700 bg-white"}`}>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Clock size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">Pending Requests</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{visibleRequests.filter(r => r.bookingStatus === "PENDING").length}</h3>
            </div>
          </div>
        </div>

        {/* NEW MY SERVICES TAB */}
        <div onClick={() => setActiveTab("services")} className={`p-6 rounded-2xl border transition-all cursor-pointer dark:bg-gray-800 hover:shadow-md ${activeTab === "services" ? "border-purple-500 shadow-md ring-2 ring-purple-100 bg-purple-50/30 dark:bg-purple-900/10" : "border-gray-100 dark:border-gray-700 bg-white"}`}>
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Settings2 size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">Active Services</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">{dashboardData?.activeServices?.length || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW: MY SERVICES VIEW --- */}
      {activeTab === "services" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Settings2 className="text-purple-600" />
            <h2 className="text-2xl font-bold dark:text-white">Manage My Services</h2>
          </div>

          {!dashboardData?.activeServices || dashboardData.activeServices.length === 0 ? (
             <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
               <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500 font-medium">You haven't added any services yet.</p>
               <button onClick={() => setIsAddModalOpen(true)} className="mt-4 text-purple-600 font-bold hover:underline">Create your first service</button>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.activeServices.map((service) => (
                <div key={service.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                  {/* Service Image */}
                  <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-300"><ImageIcon size={48} /></div>
                    )}
                    <span className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg text-purple-600 dark:text-purple-400">
                      {service.categoryName || "Service"}
                    </span>
                  </div>
                  
                  {/* Service Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{service.name || service.serviceTitle}</h3>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">₹{service.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 flex-1">
                      {service.description}
                    </p>
                    
                    <button 
                      onClick={() => openEditModal(service)}
                      className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                    >
                      <Edit3 size={18} /> Update Service
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- NEW: ENHANCED GLASSMORPHISM EDIT MODAL --- */}
      {editingService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-[2rem] p-8 max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Decorative Glowing Orbs */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

            <button onClick={() => setEditingService(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white z-10 transition-colors">
              <XCircle size={28} />
            </button>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-purple-600 dark:text-purple-400">
                <Edit3 size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Edit Service</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-8">Update the details for "{editingService.name || editingService.serviceTitle}".</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Tag size={14}/> Price (₹)
                  </label>
                  <input 
                    type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-3 rounded-xl outline-none transition font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5 ml-1">
                    <FileText size={14}/> Description
                  </label>
                  <textarea 
                    value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows={4}
                    className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent px-4 py-3 rounded-xl outline-none transition font-medium resize-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5 ml-1">
                    <ImageIcon size={14}/> Update Cover Image (Optional)
                  </label>
                  <input 
                    type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files[0])} 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-1" 
                  />
                </div>

                <button 
                  onClick={handleEditSubmit} disabled={isSubmittingEdit} 
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-extrabold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/30 flex justify-center items-center gap-2 mt-4 cursor-pointer"
                >
                  {isSubmittingEdit ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PRE-EXISTING TABS (Requests, Earnings, etc.) --- */}
      {/* Kept exactly as they were, conditionally rendered based on activeTab */}
      {activeTab === "earnings" && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3"><TrendingUp className="text-green-600" /><h2 className="text-xl font-bold dark:text-white">Earnings History</h2></div>
            <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-bold text-gray-600 dark:text-gray-300">This Week</span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2 md:px-10 pb-6 border-b border-gray-100 dark:border-gray-700 relative">
             <div className="absolute left-0 top-0 h-full border-l border-gray-100 dark:border-gray-700 pointer-events-none"></div>
             {mockGraphData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">₹{data.amount}</span>
                  <div className="w-full max-w-[40px] bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-xl transition-all duration-700 hover:brightness-110 shadow-sm" style={{ height: data.height }}></div>
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
                const providerCost = job.price || job.serviceOffering?.price || 0;

                return (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 relative">
                  
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

                  {job.bookingStatus === "COMPLETED" && (job.beforeImages || job.afterImages) && (
                    <div className="mt-6 pt-5 border-t border-dashed border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <ImageIcon size={16} className="text-indigo-500" /> Proof of Work Gallery
                      </h4>
                      <div className="flex gap-4">
                        {job.beforeImages && (
                          <div onClick={() => setPreviewImage(job.beforeImages)} className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group shadow-sm">
                            <span className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-white text-[10px] uppercase px-2 py-0.5 rounded z-10 font-black tracking-widest">Before</span>
                            <img src={job.beforeImages} alt="Before" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                        )}
                        {job.afterImages && (
                          <div onClick={() => setPreviewImage(job.afterImages)} className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group shadow-sm">
                            <span className="absolute top-1 left-1 bg-green-500/90 backdrop-blur-sm text-white text-[10px] uppercase px-2 py-0.5 rounded z-10 font-black tracking-widest">After</span>
                            <img src={job.afterImages} alt="After" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {job.bookingStatus === "PENDING" && (
                    <div className="flex gap-4 pt-2 mt-4">
                      <button onClick={() => handleStatusChange(job.id, "ACCEPTED")} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Accept Request</button>
                      <button onClick={() => handleStatusChange(job.id, "REJECTED")} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition">Reject Request</button>
                    </div>
                  )}

                  {(job.bookingStatus === "CONFIRMED" || job.bookingStatus === "ACCEPTED") && (
                    <div className="pt-2 mt-4">
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
             {/* ... pre-existing OTP logic inside the modal ... */}
              <button onClick={() => { setCompletingJobId(null); setBeforeImage(null); setAfterImage(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white z-10"><XCircle size={24} /></button>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-indigo-600 dark:text-indigo-400 w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Complete Service</h3>
              <input type="text" placeholder="OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold border-2 border-white/50 bg-white/50 dark:bg-gray-800/50 rounded-xl mb-4 shadow-inner" maxLength={6} />
              <button onClick={handleOtpSubmit} disabled={isSubmittingOtp} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg flex justify-center items-center">
                {isSubmittingOtp ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Complete"}
              </button>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <button onClick={() => setPreviewImage(null)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full z-10"><XCircle size={32} /></button>
          <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <AddServiceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => refreshDashboardData()} />
    </div>
  );
}