import React, { useState, useEffect } from "react";
import { 
  Shield, CheckCircle, XCircle, Loader2, MapPin, Briefcase, 
  DollarSign, RefreshCw, AlertCircle, ArrowRightLeft, Search, Filter, Users
} from "lucide-react";
import { AdminAPI } from "../services/adminApi";
import { BookingAPI } from "../services/bookingApi";
import { PaymentAPI } from "../services/paymentApi";

import GoBackButton from "./GoBackButton";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("verifications"); // 'verifications' or 'financials'
  
  // Data States
  const [pendingApplications, setPendingApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Loading states for individual row actions
  const [actionLoading, setActionLoading] = useState(null); // For verifications
  const [processingId, setProcessingId] = useState(null); // For payments
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fetch BOTH providers and financial data simultaneously
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [providersData, bookingsData] = await Promise.all([
        AdminAPI.getPendingProviders().catch(() => []),
        // THE FIX: Now using the dedicated Admin endpoint to get ALL platform bookings
        BookingAPI.getAllPlatformBookings().catch(() => []) 
      ]);
      setPendingApplications(Array.isArray(providersData) ? providersData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // --- VERIFICATION HANDLERS ---
  // ==========================================
  const handleDecision = async (id, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this application?`)) return;
    
    setActionLoading(id);
    try {
      if (decision === "approve") {
        await AdminAPI.approveProvider(id);
      } else {
        await AdminAPI.rejectProvider(id);
      }
      setPendingApplications(pendingApplications.filter(app => app.id !== id));
    } catch (error) {
      alert(`Failed to ${decision} provider. Please check network connection.`);
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // --- FINANCIAL HANDLERS ---
  // ==========================================
  const handlePayout = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to release funds to the provider for Booking #${bookingId}?`)) return;
    
    setProcessingId(bookingId);
    try {
      await PaymentAPI.processPayout(bookingId);
      alert("Success: Funds have been transferred to the provider!");
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, paymentStatus: "TRANSFER_TO_PROVIDER" } : b));
    } catch (error) {
      alert(error.message || "Failed to process payout. Ensure funds are in Escrow.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to refund the customer for Booking #${bookingId}?`)) return;
    
    setProcessingId(bookingId);
    try {
      await PaymentAPI.processRefund(bookingId);
      alert("Success: Funds have been refunded to the customer!");
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, paymentStatus: "REFUNDED", bookingStatus: "CANCELLED" } : b));
    } catch (error) {
      alert(error.message || "Failed to process refund.");
    } finally {
      setProcessingId(null);
    }
  };

  // Derived Financial Metrics
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id?.toString().includes(searchQuery) || 
      (booking.provider?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.customer?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalEscrow = bookings
    .filter(b => b.bookingStatus === "COMPLETED" && b.paymentStatus !== "TRANSFER_TO_PROVIDER")
    .reduce((sum, b) => sum + (b.price || b.serviceOffering?.price || 0), 0);

  const totalPaidOut = bookings
    .filter(b => b.paymentStatus === "TRANSFER_TO_PROVIDER")
    .reduce((sum, b) => sum + (b.price || b.serviceOffering?.price || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading admin records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">

      <GoBackButton/>
      
      {/* Admin Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Console</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Manage platform access & escrow.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab("verifications")}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === "verifications" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900"}`}
            >
              <Users size={16} /> Verifications
              {pendingApplications.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingApplications.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab("financials")}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === "financials" ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-600 dark:text-gray-400 hover:text-gray-900"}`}
            >
              <DollarSign size={16} /> Escrow Payouts
            </button>
          </div>

          <button onClick={fetchAdminData} className="p-2.5 text-gray-500 hover:text-indigo-600 transition bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1: PROVIDER VERIFICATIONS */}
      {/* ========================================== */}
      {activeTab === "verifications" && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            Pending Verifications
          </h2>

          {pendingApplications.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
              <p className="text-gray-500">There are no pending provider applications to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gray-50 dark:bg-gray-900/30 hover:shadow-md transition">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {app.user?.firstName || "Unknown User"} {app.user?.lastName || ""}
                      </h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold uppercase">Awaiting Review</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{app.bio}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <Briefcase size={16} className="text-indigo-500" /> {app.skills} ({app.experience} yrs exp)
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <MapPin size={16} className="text-red-400" /> {app.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => handleDecision(app.id, "reject")}
                      disabled={actionLoading === app.id}
                      className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition flex items-center justify-center gap-2"
                    >
                      {actionLoading === app.id ? <Loader2 className="animate-spin w-5 h-5" /> : <><XCircle size={18} /> Reject</>}
                    </button>
                    <button 
                      onClick={() => handleDecision(app.id, "approve")}
                      disabled={actionLoading === app.id}
                      className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold shadow-sm transition flex items-center justify-center gap-2"
                    >
                      {actionLoading === app.id ? <Loader2 className="animate-spin w-5 h-5" /> : <><CheckCircle size={18} /> Approve</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: FINANCIALS & ESCROW */}
      {/* ========================================== */}
      {activeTab === "financials" && (
        <div className="animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4"><DollarSign size={120} /></div>
              <p className="text-indigo-100 font-semibold mb-1 relative z-10">Funds in Escrow</p>
              <h3 className="text-4xl font-black relative z-10">₹{totalEscrow}</h3>
              <p className="text-sm text-indigo-200 mt-2 relative z-10">Pending Provider Payouts</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1">Total Paid Out</p>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">₹{totalPaidOut}</h3>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400"><CheckCircle size={24} /></div>
              </div>
              <p className="text-sm text-gray-400 mt-4 flex items-center gap-1"><ArrowRightLeft size={14} /> Transferred to Providers</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-semibold mb-1">Pending Actions</p>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                    {bookings.filter(b => b.bookingStatus === "COMPLETED" && b.paymentStatus !== "TRANSFER_TO_PROVIDER").length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400"><AlertCircle size={24} /></div>
              </div>
              <p className="text-sm text-gray-400 mt-4">Awaiting admin review</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payout Queue</h2>
              <div className="flex w-full sm:w-auto gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" placeholder="Search ID, Provider..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <button className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-indigo-600 transition"><Filter size={18} /></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Booking Info</th>
                    <th className="p-4 font-semibold">Provider</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredBookings.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No bookings found.</td></tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-900 dark:text-white">#{booking.id}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{booking.ServiceName || "Service"}</p>
                        </td>
                        <td className="p-4"><p className="font-medium text-gray-900 dark:text-gray-200">{booking.provider?.name || "N/A"}</p></td>
                        <td className="p-4"><p className="text-sm text-gray-700 dark:text-gray-300">{booking.customer?.firstName} {booking.customer?.lastName}</p></td>
                        <td className="p-4"><p className="font-bold text-indigo-600 dark:text-indigo-400">₹{booking.price || booking.serviceOffering?.price || 0}</p></td>
                        <td className="p-4">
                          {booking.paymentStatus === "TRANSFER_TO_PROVIDER" ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">Paid Out</span>
                          ) : booking.paymentStatus === "REFUNDED" ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">Refunded</span>
                          ) : booking.bookingStatus === "COMPLETED" ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">Pending Payout</span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">In Progress</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {booking.bookingStatus === "COMPLETED" && booking.paymentStatus !== "TRANSFER_TO_PROVIDER" && booking.paymentStatus !== "REFUNDED" ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleRefund(booking.id)} disabled={processingId === booking.id} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition">Refund</button>
                              <button onClick={() => handlePayout(booking.id)} disabled={processingId === booking.id} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                                {processingId === booking.id ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />} Release Payout
                              </button>
                            </div>
                          ) : <span className="text-xs text-gray-400 font-medium italic">No actions available</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}