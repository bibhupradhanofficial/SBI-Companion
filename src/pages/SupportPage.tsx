import React, { useState, useEffect, useRef } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/context/AuthContext"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Search,
  ShieldAlert,
  Calendar,
  Send,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from "lucide-react"

// Curated database of SBI branches across major Indian cities
const BRANCHES_DATA = [
  {
    id: "mumbai_hq",
    name: "SBI Corporate Centre (BKC)",
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.0601,
    lng: 72.8624,
    address: "State Bank Bhavan, Madame Cama Road, Nariman Point & Bandra Kurla Complex, Mumbai, Maharashtra 400051",
    phone: "022-22740000",
    email: "cc.bkc@sbi.co.in",
    ifsc: "SBIN0004113",
    manager: "Anand Kumar, Chief General Manager",
    hours: "09:30 AM - 04:30 PM",
    services: ["ATM", "Locker", "Forex", "Loans"],
    lockerStatus: "Medium",
    rating: 4.8
  },
  {
    id: "delhi_main",
    name: "New Delhi Main Branch",
    city: "New Delhi",
    state: "Delhi",
    lat: 28.6291,
    lng: 77.2155,
    address: "11, Parliament Street, Near Jantar Mantar, New Delhi, Delhi 110001",
    phone: "011-23374001",
    email: "delhi.main@sbi.co.in",
    ifsc: "SBIN0000691",
    manager: "Sanjay Malhotra, Assistant General Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Forex", "Loans"],
    lockerStatus: "Full",
    rating: 4.5
  },
  {
    id: "kolkata_main",
    name: "Kolkata Main Branch",
    city: "Kolkata",
    state: "West Bengal",
    lat: 22.5714,
    lng: 88.3444,
    address: "Samriddhi Bhawan, 1, Strand Road, B.B.D. Bagh, Kolkata, West Bengal 700001",
    phone: "033-22489333",
    email: "kolkata.main@sbi.co.in",
    ifsc: "SBIN0000001",
    manager: "Pranab Mukherjee, General Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Forex"],
    lockerStatus: "High",
    rating: 4.6
  },
  {
    id: "chennai_main",
    name: "Chennai Main Branch",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.0911,
    lng: 80.2905,
    address: "22, Rajaji Salai, George Town, Chennai, Tamil Nadu 600001",
    phone: "044-25340011",
    email: "chennai.main@sbi.co.in",
    ifsc: "SBIN0000800",
    manager: "K. R. Vijayakumar, Assistant General Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Loans"],
    lockerStatus: "Medium",
    rating: 4.4
  },
  {
    id: "bengaluru_main",
    name: "Bengaluru Main Branch",
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9734,
    lng: 77.6012,
    address: "65, St Mark's Rd, Ashok Nagar, Bengaluru, Karnataka 560001",
    phone: "080-25943002",
    email: "blr.main@sbi.co.in",
    ifsc: "SBIN0000813",
    manager: "Shweta Hegde, Branch Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Forex", "Loans"],
    lockerStatus: "Medium",
    rating: 4.7
  },
  {
    id: "hyderabad_main",
    name: "Hyderabad Main Branch",
    city: "Hyderabad",
    state: "Telangana",
    lat: 17.3888,
    lng: 78.4855,
    address: "Bank Street, Koti, Hyderabad, Telangana 500095",
    phone: "040-23421303",
    email: "hyd.main@sbi.co.in",
    ifsc: "SBIN0000843",
    manager: "N. Venkateshwarlu, Chief Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Forex", "Loans"],
    lockerStatus: "None",
    rating: 4.3
  },
  {
    id: "ahmedabad_main",
    name: "Ahmedabad Main Branch",
    city: "Ahmedabad",
    state: "Gujarat",
    lat: 23.0255,
    lng: 72.5802,
    address: "Lal Darwaja, Near Bhadra Fort, Ahmedabad, Gujarat 380001",
    phone: "079-25506000",
    email: "ahmd.main@sbi.co.in",
    ifsc: "SBIN0000300",
    manager: "Vijay Patel, Chief Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Loans"],
    lockerStatus: "High",
    rating: 4.5
  },
  {
    id: "pune_main",
    name: "Pune Main Branch",
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5284,
    lng: 73.8739,
    address: "Collector Office Rd, Camp, Pune, Maharashtra 400001",
    phone: "020-26131301",
    email: "pune.main@sbi.co.in",
    ifsc: "SBIN0000454",
    manager: "Milind Shinde, Assistant General Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Forex"],
    lockerStatus: "Medium",
    rating: 4.4
  },
  {
    id: "lucknow_main",
    name: "Lucknow Main Branch",
    city: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8488,
    lng: 80.9419,
    address: "Tarawali Kothi, M.G. Road, Hazratganj, Lucknow, Uttar Pradesh 226001",
    phone: "0522-2201402",
    email: "lko.main@sbi.co.in",
    ifsc: "SBIN0000125",
    manager: "Sudhir Rawat, Assistant General Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Forex", "Loans"],
    lockerStatus: "High",
    rating: 4.6
  },
  {
    id: "patna_main",
    name: "Patna Main Branch",
    city: "Patna",
    state: "Bihar",
    lat: 25.6174,
    lng: 85.1436,
    address: "West Gandhi Maidan, Near Collectorate, Patna, Bihar 800001",
    phone: "0612-2219003",
    email: "patna.main@sbi.co.in",
    ifsc: "SBIN0000152",
    manager: "R. K. Singh, Chief Manager",
    hours: "10:00 AM - 04:00 PM",
    services: ["ATM", "Locker", "Loans"],
    lockerStatus: "Full",
    rating: 4.2
  }
]

export const SupportPage: React.FC = () => {
  const { profile } = useAuth()

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState("All")
  const [selectedBranch, setSelectedBranch] = useState<typeof BRANCHES_DATA[0]>(BRANCHES_DATA[0])

  // Map Loading State
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const markersGroupRef = useRef<any>(null)

  // Appointment Form State
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [appointmentReason, setAppointmentReason] = useState("general")
  const [appointmentName, setAppointmentName] = useState(profile?.name || "")
  const [appointmentPhone, setAppointmentPhone] = useState("")
  const [appointmentSuccess, setAppointmentSuccess] = useState(false)

  // Query Form State
  const [queryCategory, setQueryCategory] = useState("support")
  const [queryMessage, setQueryMessage] = useState("")
  const [querySuccess, setQuerySuccess] = useState(false)

  // Toast State
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Load Leaflet CDN Assets dynamically to ensure zero package compilation errors
  useEffect(() => {
    // Check if Leaflet is already loaded
    if ((window as any).L) {
      setMapLoaded(true)
      return
    }

    const cssLink = document.createElement("link")
    cssLink.rel = "stylesheet"
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    cssLink.crossOrigin = ""
    document.head.appendChild(cssLink)

    const jsScript = document.createElement("script")
    jsScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    jsScript.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    jsScript.crossOrigin = ""
    jsScript.onload = () => {
      setMapLoaded(true)
    }
    document.body.appendChild(jsScript)

    return () => {
      // Clean up CDN assets
      if (document.head.contains(cssLink)) {
        document.head.removeChild(cssLink)
      }
      if (document.body.contains(jsScript)) {
        document.body.removeChild(jsScript)
      }
    }
  }, [])

  // Filter Branches
  const filteredBranches = BRANCHES_DATA.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesService =
      selectedService === "All" || branch.services.includes(selectedService)

    return matchesSearch && matchesService
  })

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded) return

    const L = (window as any).L
    if (!L) return

    // If map already initialized, just update markers
    if (!mapRef.current) {
      const map = L.map("leaflet-map", {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([20.5937, 78.9629], 5) // Center of India

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      markersGroupRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
    }

    // Clear old markers
    markersGroupRef.current.clearLayers()

    // Add filtered markers
    const bounds = L.latLngBounds()

    filteredBranches.forEach((branch) => {
      const customPopup = L.popup().setContent(`
        <div class="p-2 text-slate-800 dark:text-slate-200 text-xs font-sans text-left space-y-1">
          <strong class="text-sm font-extrabold text-blue-600 block">${branch.name}</strong>
          <p class="font-medium text-slate-500">${branch.address}</p>
          <div class="flex items-center gap-1.5 mt-2">
            <span class="text-[9px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600 uppercase">IFSC: ${branch.ifsc}</span>
          </div>
        </div>
      `)

      const marker = L.marker([branch.lat, branch.lng])
        .addTo(markersGroupRef.current)
        .bindPopup(customPopup)

      // Sync state on marker click
      marker.on("click", () => {
        setSelectedBranch(branch)
      })

      bounds.extend([branch.lat, branch.lng])
    })

    // Fit bounds only if markers are added and there's more than one marker
    if (filteredBranches.length > 0 && mapRef.current) {
      if (filteredBranches.length === 1) {
        mapRef.current.setView([filteredBranches[0].lat, filteredBranches[0].lng], 13)
      } else {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [mapLoaded, filteredBranches])

  // Select branch helper
  const handleSelectBranch = (branch: typeof BRANCHES_DATA[0]) => {
    setSelectedBranch(branch)
    if (mapRef.current) {
      mapRef.current.setView([branch.lat, branch.lng], 14)
    }
  }

  // Appointment Submission
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointmentDate || !appointmentTime || !appointmentPhone) {
      alert("Please fill in the date, time, and phone details.")
      return
    }
    setAppointmentSuccess(true)
    triggerToast(`Appointment booked successfully at ${selectedBranch.name}!`)
    setTimeout(() => {
      setAppointmentSuccess(false)
      setAppointmentDate("")
      setAppointmentTime("")
      setAppointmentPhone("")
    }, 4000)
  }

  // Support Query Submission
  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryMessage) {
      alert("Please enter your message.")
      return
    }
    setQuerySuccess(true)
    triggerToast("Your query has been submitted to the Support Desk!")
    setTimeout(() => {
      setQuerySuccess(false)
      setQueryMessage("")
    }, 4000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-primary mb-2">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            SBI Companion Support Center
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
            Locate nearest State Bank of India branches, check locker availability, book digital appointments, or reach out to our emergency banking hotlines.
          </p>
        </div>

        {/* Emergency Alert Hotlines */}
        <div className="bg-red-50/50 border border-red-200 dark:bg-red-950/10 dark:border-red-900/30 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-left">
            <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-extrabold text-red-800 dark:text-red-400">Emergency Credit Card / Account Blocking</h3>
              <p className="text-xs text-red-700 dark:text-red-300/80 mt-0.5 leading-relaxed">
                If you suspect unauthorized transactions, block your card instantly via YONO app or call the toll-free numbers.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a
              href="tel:18001234"
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-red-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              1800 1234 (Toll-Free)
            </a>
            <a
              href="tel:18002100"
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-red-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              1800 2100
            </a>
          </div>
        </div>

        {/* Map, Search & Detail layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT: Search, Filters & Map (Col Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-5 text-left">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                SBI Branch Locator (India)
              </h2>

              {/* Filters Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search Bar */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by city, state, or branch name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                {/* Service Dropdown */}
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white p-2 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="All">All Services</option>
                    <option value="ATM">ATM Service</option>
                    <option value="Locker">Locker Facility</option>
                    <option value="Forex">Forex Exchange</option>
                    <option value="Loans">Loan Hub</option>
                  </select>
                </div>
              </div>

              {/* Leaflet Map Div */}
              <div className="relative">
                <div
                  id="leaflet-map"
                  className="w-full h-[380px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner z-10 bg-slate-100"
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 z-20 flex flex-col items-center justify-center space-y-2 rounded-2xl">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-slate-500 font-bold">Initializing locator maps...</span>
                  </div>
                )}
              </div>

              {/* Quick Branch List Summary */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Matching Branches ({filteredBranches.length})
                </span>
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin max-w-full">
                  {filteredBranches.slice(0, 5).map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleSelectBranch(branch)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border shrink-0 cursor-pointer transition-colors ${selectedBranch.id === branch.id
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800 hover:bg-slate-100"
                        }`}
                    >
                      {branch.name.split(" ")[1] || branch.city} ({branch.city})
                    </button>
                  ))}
                  {filteredBranches.length > 5 && (
                    <span className="text-xs text-slate-450 self-center font-bold pl-2">
                      +{filteredBranches.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Support contacts directory */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm text-left space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Customer Support & Grievances</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hotlines */}
                <div className="space-y-3.5">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    SBI Banking Hotlines
                  </span>

                  <div className="flex gap-3 text-xs leading-relaxed font-semibold">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 block font-bold">24x7 Customer Care</span>
                      <a href="tel:18001234" className="text-primary hover:underline">1800 1234</a> / <a href="tel:18002100" className="text-primary hover:underline">1800 2100</a>
                      <p className="text-[10px] text-slate-450 mt-0.5">Toll-free customer assistance line across India.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs leading-relaxed font-semibold">
                    <Phone className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 block font-bold">PMJDY / Social Schemes</span>
                      <a href="tel:1800112211" className="text-primary hover:underline">1800 11 2211</a>
                      <p className="text-[10px] text-slate-450 mt-0.5">Dedicated query line for national financial inclusion initiatives.</p>
                    </div>
                  </div>
                </div>

                {/* Email Support */}
                <div className="space-y-3.5">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block border-b border-slate-100 dark:border-slate-850 pb-1.5">
                    Grievance Escalation Portal
                  </span>

                  <div className="flex gap-3 text-xs leading-relaxed font-semibold">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 block font-bold">General Enquiries</span>
                      <a href="mailto:customercare@sbi.co.in" className="text-primary hover:underline">customercare@sbi.co.in</a>
                      <p className="text-[10px] text-slate-450 mt-0.5">Primary email support inbox for retail query resolutions.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs leading-relaxed font-semibold">
                    <Mail className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 block font-bold">Nodal Officer Escalation</span>
                      <a href="mailto:nodal.officer@sbi.co.in" className="text-primary hover:underline">nodal.officer@sbi.co.in</a>
                      <p className="text-[10px] text-slate-450 mt-0.5">For escalation of unresolved branch-level issues.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Selected Branch Info & Scheduling Forms (Col Span 1) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Branch details card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm text-left space-y-5">
              <div className="flex justify-between items-start">
                <span className="text-[9px] bg-blue-105 text-primary dark:bg-blue-950 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Active Locator Selection
                </span>
                <span className="text-xs text-amber-500 font-extrabold flex items-center gap-0.5">
                  ★ {selectedBranch.rating}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedBranch.name}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 font-bold block mt-1">
                  IFSC: {selectedBranch.ifsc}
                </span>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-slate-450 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-350 leading-relaxed">
                    {selectedBranch.address}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="h-4.5 w-4.5 text-slate-450 shrink-0" />
                  <a href={`tel:${selectedBranch.phone}`} className="text-primary hover:underline">
                    {selectedBranch.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="h-4.5 w-4.5 text-slate-450 shrink-0" />
                  <a href={`mailto:${selectedBranch.email}`} className="text-primary hover:underline">
                    {selectedBranch.email}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="h-4.5 w-4.5 text-slate-450 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedBranch.hours} (Mon - Sat)
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-450 font-bold">Services Provided:</span>
                  <div className="flex gap-1.5">
                    {selectedBranch.services.map((serv) => (
                      <span
                        key={serv}
                        className="text-[9px] bg-slate-50 dark:bg-slate-950 font-extrabold border border-slate-150 dark:border-slate-800 px-1.5 py-0.25 rounded text-slate-600 dark:text-slate-400"
                      >
                        {serv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-450 font-bold">Locker Availability:</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${selectedBranch.lockerStatus === "High" || selectedBranch.lockerStatus === "Medium"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : selectedBranch.lockerStatus === "Full"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-850"
                      }`}
                  >
                    {selectedBranch.lockerStatus === "None" ? "No Locker Service" : selectedBranch.lockerStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* digital appointment booking form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm text-left space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                Book Branch Visit
              </h3>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Schedule a priority token appointment at **{selectedBranch.name}** to skip queues.
              </p>

              {appointmentSuccess ? (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/30 p-4 rounded-2xl text-center space-y-2 animate-fadeIn">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto animate-bounce" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Appointment Scheduled!</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Priority Token has been sent to your mobile. Please arrive 10 minutes early.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Applicant Name</label>
                    <input
                      type="text"
                      required
                      value={appointmentName}
                      onChange={(e) => setAppointmentName(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter mobile phone"
                      value={appointmentPhone}
                      onChange={(e) => setAppointmentPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white px-3 py-2 rounded-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Preferred Slot</label>
                      <input
                        type="time"
                        required
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white px-3 py-2 rounded-xl font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Purpose of Visit</label>
                    <select
                      value={appointmentReason}
                      onChange={(e) => setAppointmentReason(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white p-2 rounded-xl"
                    >
                      <option value="general">General Services</option>
                      <option value="kyc">KYC verification / update</option>
                      <option value="locker">Locker Access</option>
                      <option value="loan">Home/Personal Loan Enquiry</option>
                      <option value="forex">Foreign Exchange desk</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary py-2.5 text-center text-xs font-bold text-white rounded-xl hover:bg-blue-700 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Confirm Appointment <ChevronRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Direct support inquiry desk form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm text-left space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-primary" />
                Query Support Desk
              </h3>

              {querySuccess ? (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/30 p-4 rounded-2xl text-center space-y-2 animate-fadeIn">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ticket Submitted!</h4>
                  <p className="text-[10px] text-slate-550">
                    We have registered your support ticket. Companion help desk officers will email you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuerySubmit} className="space-y-3 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Query Subject</label>
                    <select
                      value={queryCategory}
                      onChange={(e) => setQueryCategory(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white p-2 rounded-xl"
                    >
                      <option value="support">Online Banking & App Support</option>
                      <option value="transaction">Failed / Pending Transaction enquiry</option>
                      <option value="card">ATM / Credit Card issues</option>
                      <option value="others">Other queries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">Message Details</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detail your query or issue here..."
                      value={queryMessage}
                      onChange={(e) => setQueryMessage(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white px-3 py-2 rounded-xl resize-none outline-none font-semibold text-xs focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 dark:bg-slate-800 py-2.5 text-center text-xs font-bold text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Submit Query <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Toast popup */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-55 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-3 shadow-lg text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="h-4.5 w-4.5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
