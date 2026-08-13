"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, User, Activity, AlertTriangle, UserRound, Clock, HeartPulse, ChevronRight, CheckCircle2 } from "lucide-react";
import { api, PatientSummary } from "../../services/api";

interface PatientManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientSummary[];
  onSelectPatient: (id: string) => void;
  selectedPatientId: string;
  onPatientAdded: () => void;
}

export default function PatientManagementPanel({
  isOpen,
  onClose,
  patients,
  onSelectPatient,
  selectedPatientId,
  onPatientAdded
}: PatientManagementPanelProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact: ""
  });
  
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.unique_patient_code && p.unique_patient_code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const calculateAge = (dob: string) => {
    if (!dob) return undefined;
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.full_name.trim()) errors.full_name = "Full name is required";
    if (!formData.date_of_birth) errors.date_of_birth = "Date of birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const age = calculateAge(formData.date_of_birth);
      const payload = {
        ...formData,
        age
      };
      
      await api.createPatient(payload);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsAdding(false);
        setSubmitSuccess(false);
        setFormData({
          full_name: "",
          date_of_birth: "",
          gender: "",
          phone: "",
          email: "",
          address: "",
          emergency_contact: ""
        });
        onPatientAdded();
      }, 1500);
      
    } catch (err: any) {
      setSubmitError(err.message || "Unable to add patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-card border-l border-border z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-border bg-slate-50 dark:bg-muted/50 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center">
                    <UserRound className="mr-2 h-5 w-5 text-blue-600" />
                    Patients
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage and review patient health information
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isAdding ? (
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
                  <div className="mb-4 flex items-center">
                    <button 
                      onClick={() => setIsAdding(false)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                      Back to list
                    </button>
                  </div>
                  <h3 className="text-lg font-bold mb-4 text-foreground">Add New Patient</h3>
                  
                  {submitSuccess ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                      <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
                      <h4 className="text-emerald-700 dark:text-emerald-400 font-bold text-lg mb-1">Patient Added Successfully</h4>
                      <p className="text-emerald-600 dark:text-emerald-500 text-sm">The patient has been registered in the system.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {submitError && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
                          {submitError}
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 rounded-lg border ${formErrors.full_name ? 'border-red-500 bg-red-50' : 'border-border bg-card'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground`}
                          placeholder="John Doe"
                        />
                        {formErrors.full_name && <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border ${formErrors.date_of_birth ? 'border-red-500 bg-red-50' : 'border-border bg-card'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground`}
                          />
                          {formErrors.date_of_birth && <p className="text-red-500 text-xs mt-1">{formErrors.date_of_birth}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Gender *</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border ${formErrors.gender ? 'border-red-500 bg-red-50' : 'border-border bg-card'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground`}
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {formErrors.gender && <p className="text-red-500 text-xs mt-1">{formErrors.gender}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 rounded-lg border ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-border bg-card'} focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground`}
                            placeholder="john@example.com"
                          />
                          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground"
                          placeholder="123 Main St, City"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Emergency Contact</label>
                        <input
                          type="text"
                          name="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground"
                          placeholder="Name & Phone"
                        />
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsAdding(false)}
                          className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            "Add Patient"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-4 shrink-0 bg-background border-b border-border space-y-3">
                    <button
                      onClick={() => setIsAdding(true)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Patient</span>
                    </button>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search patients by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-background space-y-3">
                    {patients.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="bg-blue-50 dark:bg-blue-900/20 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-foreground font-semibold mb-1">No patients found</h3>
                        <p className="text-muted-foreground text-sm mb-4">You haven't added any patients yet.</p>
                        <button
                          onClick={() => setIsAdding(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center w-full"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add your first patient
                        </button>
                      </div>
                    ) : filteredPatients.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <p className="text-sm">No patients match your search.</p>
                      </div>
                    ) : (
                      filteredPatients.map(patient => (
                        <div
                          key={patient.id}
                          onClick={() => {
                            onSelectPatient(patient.id);
                            onClose();
                          }}
                          className={`bg-card p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md ${selectedPatientId === patient.id ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-border hover:border-blue-300'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-foreground text-base group-hover:text-blue-600 transition-colors">
                                {patient.name}
                              </h4>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                ID: {patient.unique_patient_code || `PT-${patient.id.padStart(3, '0')}`}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${patient.readmission_risk === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : patient.readmission_risk === 'Moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                              {patient.readmission_risk} Risk
                            </span>
                          </div>
                          
                          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 space-x-3 mb-3">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" /> {patient.age} • {patient.gender}
                            </span>
                            <span className="flex items-center">
                              <HeartPulse className="h-3 w-3 mr-1 text-blue-500" /> Score: {patient.overall_health_score}
                            </span>
                          </div>
                          
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> 
                              Updated {patient.last_updated_date ? new Date(patient.last_updated_date).toLocaleDateString() : 'Today'}
                            </span>
                            {selectedPatientId === patient.id && (
                              <span className="text-blue-600 font-semibold flex items-center">
                                Currently Selected
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
