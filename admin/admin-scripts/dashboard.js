import { 
  getFirestore, 
  collection,
  onSnapshot,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCuAtP-ak_HFMP29d3iNTl9QzmhNyTf3k",
  authDomain: "agency-project-774a0.firebaseapp.com",
  projectId: "agency-project-774a0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
/* =========================
   SIDEBAR
========================= */

function setupSidebar() {
  const menuItems = document.querySelectorAll(".sidebar li[data-page]");
  const pages = document.querySelectorAll(".page");

  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(i => i.classList.remove("active"));
      pages.forEach(p => p.classList.remove("active"));

      item.classList.add("active");

      const page = item.dataset.page;
      const pageElement = document.getElementById(page + "Page");
      if (pageElement) {
        pageElement.classList.add("active");
      }
    });
  });
}

 function loadDashboardStats() {
  onSnapshot(collection(db, "bookings"), (snapshot) => {

  let total = 0;
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let completed = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Exclude archived bookings from stats
    if (data.archived) return;
    
    total++;

    if (data.status === "pending") pending++;
    else if (data.status === "approved") approved++;
    else if (data.status === "rejected") rejected++;
    else if (data.status === "completed") completed++;
  });
  

  document.getElementById("totalBookings").textContent = total;
  document.getElementById("pendingBookings").textContent = pending;
  document.getElementById("approvedBookings").textContent = approved;
  document.getElementById("rejectedBookings").textContent = rejected;
  document.getElementById("completedBookings").textContent = completed;
  });
}

function loadAnalytics() {
  const serviceContainer = document.getElementById("serviceStats");
  const trendContainer = document.getElementById("bookingTrends");
  const conversionContainer = document.getElementById("conversionRate");

  onSnapshot(collection(db, "bookings"), (snapshot) => {

    const serviceCount = {};
    const serviceCurrentMonth = {};
    const servicePreviousMonth = {};
    let totalCurrentMonth = 0;
    let approvedCurrentMonth = 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Exclude archived bookings from analytics
      if (data.archived) return;
      
      const service = data.serviceType || "Unknown";

      // Count all bookings by service
      if (!serviceCount[service]) {
        serviceCount[service] = 0;
      }
      serviceCount[service]++;

      // Determine booking date
      let bookingDate = new Date();
      if (data.createdAt && data.createdAt.seconds) {
        bookingDate = new Date(data.createdAt.seconds * 1000);
      }

      // Count bookings in current month (last 30 days)
      if (bookingDate >= thirtyDaysAgo) {
        if (!serviceCurrentMonth[service]) {
          serviceCurrentMonth[service] = 0;
        }
        serviceCurrentMonth[service]++;
        totalCurrentMonth++;

        // Count approved or completed bookings in current month
        if (data.status === "approved" || data.status === "completed") {
          approvedCurrentMonth++;
        }
      }

      // Count bookings in previous month (30-60 days ago)
      if (bookingDate >= sixtyDaysAgo && bookingDate < thirtyDaysAgo) {
        if (!servicePreviousMonth[service]) {
          servicePreviousMonth[service] = 0;
        }
        servicePreviousMonth[service]++;
      }
    });

    // RENDER MOST REQUESTED SERVICES
    serviceContainer.innerHTML = "";
    const requestedArray = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1]);

    requestedArray.forEach(([service, count]) => {
      const div = document.createElement("div");
      div.className = "stat-item";
      div.innerHTML = `
        <span class="stat-name">${service}</span>
        <span class="stat-value">${count}</span>
      `;
      serviceContainer.appendChild(div);
    });

    // RENDER SERVICE TREND OVER TIME
    trendContainer.innerHTML = "";
    const trendArray = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1]);

    if (trendArray.length === 0) {
      trendContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">No booking data available</div>';
    } else {
      trendArray.forEach(([service, count]) => {
        const currentMonth = serviceCurrentMonth[service] || 0;
        const previousMonth = servicePreviousMonth[service] || 0;
        
        // Calculate trend
        let trendDirection = "→";
        let trendColor = "#999";
        let trendValue = "0%";
        
        if (previousMonth > 0) {
          const percentChange = ((currentMonth - previousMonth) / previousMonth) * 100;
          if (percentChange > 0) {
            trendDirection = "↑";
            trendColor = "#10b981";
            trendValue = `+${Math.round(percentChange)}%`;
          } else if (percentChange < 0) {
            trendDirection = "↓";
            trendColor = "#ef4444";
            trendValue = `${Math.round(percentChange)}%`;
          }
        } else if (currentMonth > 0) {
          trendDirection = "↑";
          trendColor = "#10b981";
          trendValue = "New";
        }

        const div = document.createElement("div");
        div.className = "trend-item";
        div.innerHTML = `
          <span class="trend-name">${service}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="trend-value">${currentMonth} this month</span>
            <span style="color: ${trendColor}; font-weight: 600; font-size: 0.9rem;">${trendDirection} ${trendValue}</span>
          </div>
        `;
        trendContainer.appendChild(div);
      });
    }

    // RENDER CONVERSION RATE
    conversionContainer.innerHTML = "";
    const conversionRate = totalCurrentMonth > 0 ? Math.round((approvedCurrentMonth / totalCurrentMonth) * 100) : 0;
    
    const conversionDiv = document.createElement("div");
    conversionDiv.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px 20px; gap: 12px;";
    
    const rateCircle = document.createElement("div");
    rateCircle.style.cssText = `
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007e76, #009688);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 15px rgba(0, 126, 118, 0.3);
    `;
    rateCircle.textContent = `${conversionRate}%`;
    
    const rateLabel = document.createElement("div");
    rateLabel.style.cssText = "text-align: center;";
    rateLabel.innerHTML = `
      <div style="font-size: 0.85rem; color: #999; margin-bottom: 6px;">Bookings Approved/Completed</div>
      <div style="font-size: 1.1rem; font-weight: 600; color: #1e293b;">${approvedCurrentMonth} out of ${totalCurrentMonth}</div>
    `;
    
    conversionDiv.appendChild(rateCircle);
    conversionDiv.appendChild(rateLabel);
    conversionContainer.appendChild(conversionDiv);

  });
}

function loadBookings() {
  const searchInput = document.getElementById("search");
  const filterStatus = document.getElementById("filterStatus");
  const filterPriority = document.getElementById("filterPriority");
  const sortBy = document.getElementById("sortBy");

  onSnapshot(collection(db, "bookings"), (snapshot) => {
    window.allBookings = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      window.allBookings.push({
        id: doc.id,
        ...data
      });
    });

    // Display only non-archived bookings
    const activeBookings = window.allBookings.filter(b => !b.archived);
    renderBookingsTable(activeBookings);
    
    // Display archived bookings
    const archivedBookings = window.allBookings.filter(b => b.archived);
    renderArchivedTable(archivedBookings);
  });

  // Helper function to apply all filters and sorting
  const applyAllFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus?.value || "";
    const priorityFilter = filterPriority?.value || "";
    const sortValue = sortBy?.value || "createdAt";
    
    const activeBookings = window.allBookings.filter(booking => !booking.archived);
    let filtered = activeBookings.filter(booking => {
      const name = (booking.fullName || "").toLowerCase();
      const email = booking.email || "";
      const matchesSearch = name.includes(searchTerm) || email.toLowerCase().includes(searchTerm);
      const matchesStatus = statusFilter === "" || booking.status === statusFilter;
      const matchesPriority = priorityFilter === "" || booking.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortValue === "deadline") {
        // Sort by deadline (earliest first), null deadlines go to the end
        aValue = a.deadline ? new Date(a.deadline.seconds * 1000) : new Date(9999999999999);
        bValue = b.deadline ? new Date(b.deadline.seconds * 1000) : new Date(9999999999999);
      } else {
        // Sort by created date (newest first)
        aValue = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        bValue = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
      }
      
      return aValue - bValue;
    });

    renderBookingsTable(filtered);
  };

  // Search functionality for active bookings
  searchInput.addEventListener("input", applyAllFilters);

  // Filter functionality for active bookings
  if (filterStatus) {
    filterStatus.addEventListener("change", applyAllFilters);
  }
  if (filterPriority) {
    filterPriority.addEventListener("change", applyAllFilters);
  }
  if (sortBy) {
    sortBy.addEventListener("change", applyAllFilters);
  }

  // Search functionality for archived bookings
  const searchArchivedInput = document.getElementById("searchArchived");
  const sortArchived = document.getElementById("sortArchived");
  
  const applyArchivedFilters = () => {
    const searchTerm = searchArchivedInput.value.toLowerCase();
    const sortValue = sortArchived?.value || "createdAt";
    
    const archivedBookings = window.allBookings.filter(booking => booking.archived);
    let filtered = archivedBookings.filter(booking => {
      const name = (booking.fullName || "").toLowerCase();
      const email = booking.email || "";
      return name.includes(searchTerm) || email.toLowerCase().includes(searchTerm);
    });

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortValue === "deadline") {
        // Sort by deadline (earliest first), null deadlines go to the end
        aValue = a.deadline ? new Date(a.deadline.seconds * 1000) : new Date(9999999999999);
        bValue = b.deadline ? new Date(b.deadline.seconds * 1000) : new Date(9999999999999);
      } else {
        // Sort by created date (newest first)
        aValue = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        bValue = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
      }
      
      return aValue - bValue;
    });

    renderArchivedTable(filtered);
  };
  
  if (searchArchivedInput) {
    searchArchivedInput.addEventListener("input", applyArchivedFilters);
  }
  if (sortArchived) {
    sortArchived.addEventListener("change", applyArchivedFilters);
  }
}

function renderBookingsTable(bookings) {
  const tableBody = document.getElementById("bookingsTableBody");
  
  if (bookings.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No bookings found</td></tr>';
    return;
  }

  tableBody.innerHTML = bookings.map(booking => {
    const date = booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() : "N/A";
    const deadline = booking.deadline ? new Date(booking.deadline.seconds * 1000).toLocaleDateString() : "N/A";
    const status = booking.status || "pending";
    const priority = booking.priority || "normal";
    const name = `${booking.fullName || "N/A"}`;
    return `
      <tr>
        <td>${name}</td>
        <td>${booking.email || "N/A"}</td>
        <td>${booking.serviceType || "N/A"}</td>
        <td>${date}</td>
        <td>${deadline}</td>
        <td><span class="status-badge status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
        <td><span class="priority-badge priority-${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn" onclick="viewBooking('${booking.id}')"><i class="fa-solid fa-eye"></i></button>
            <button class="action-btn" onclick="editBooking('${booking.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderArchivedTable(bookings) {
  const tableBody = document.getElementById("archivedTableBody");
  
  if (bookings.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No archived bookings</td></tr>';
    return;
  }

  tableBody.innerHTML = bookings.map(booking => {
    const date = booking.createdAt ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() : "N/A";
    const deadline = booking.deadline ? new Date(booking.deadline.seconds * 1000).toLocaleDateString() : "N/A";
    const status = booking.status || "pending";
    const priority = booking.priority || "normal";
    const name = `${booking.fullName || "N/A"}`;
    return `
      <tr>
        <td>${name}</td>
        <td>${booking.email || "N/A"}</td>
        <td>${booking.serviceType || "N/A"}</td>
        <td>${date}</td>
        <td>${deadline}</td>
        <td><span class="status-badge status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
        <td><span class="priority-badge priority-${priority}">${priority.charAt(0).toUpperCase() + priority.slice(1)}</span></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn" onclick="viewBooking('${booking.id}')"><i class="fa-solid fa-eye"></i></button>
            <button class="action-btn" onclick="editBooking('${booking.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="action-btn" onclick="unarchiveBooking('${booking.id}')"><i class="fa-solid fa-box-archive"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function viewBooking(bookingId) {
  const booking = window.allBookings.find(b => b.id === bookingId);
  
  if (!booking) {
    alert("Booking not found");
    return;
  }

  const data = booking;
  const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "N/A";
  const deadline = data.deadline ? new Date(data.deadline.seconds * 1000).toLocaleString() : "N/A";

  const content = `
    <div class="booking-detail-grid">
      <div class="detail-item">
        <label>Full Name</label>
        <value>${data.fullName || "N/A"}</value>
      </div>
      <div class="detail-item">
        <label>Email</label>
        <value>${data.email || "N/A"}</value>
      </div>
      <div class="detail-item">
        <label>Company</label>
        <value>${data.company || "N/A"}</value>
      </div>
      <div class="detail-item">
        <label>Service Type</label>
        <value>${data.serviceType || "N/A"}</value>
      </div>
      <div class="detail-item">
        <label>Status</label>
        <value><span class="status-badge status-${data.status || "pending"}">${(data.status || "pending").charAt(0).toUpperCase() + (data.status || "pending").slice(1)}</span></value>
      </div>
      <div class="detail-item">
        <label>Priority</label>
        <value>${data.priority || "N/A"}</value>
      </div>
      <div class="detail-item">
        <label>Budget Min</label>
        <value>$${(data.budgetMin || 0).toLocaleString()}</value>
      </div>
      <div class="detail-item">
        <label>Budget Max</label>
        <value>$${(data.budgetMax || 0).toLocaleString()}</value>
      </div>
      <div class="detail-item">
        <label>Final Price</label>
        <value>${data.finalPrice ? `$${data.finalPrice.toLocaleString()}` : "Not set"}</value>
      </div>
      <div class="detail-item">
        <label>Deadline</label>
        <value>${deadline}</value>
      </div>
      <div class="detail-item">
        <label>Assigned To</label>
        <value>${data.assignedTo || "Unassigned"}</value>
      </div>
      <div class="detail-item">
        <label>Archived</label>
        <value>${data.archived ? "Yes" : "No"}</value>
      </div>
    </div>
    <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #007e76; margin-top: 20px;">
      <label style="display: block; font-size: 0.85rem; color: #999; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Description</label>
      <value style="display: block; color: #383535;">${data.description || "N/A"}</value>
    </div>
    <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #007e76; margin-top: 20px;">
      <label style="display: block; font-size: 0.85rem; color: #999; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Notes</label>
      <value style="display: block; color: #383535;">${data.notes || "No notes"}</value>
    </div>
  `;

  document.getElementById("viewBookingContent").innerHTML = content;
  document.getElementById("viewBookingModal").classList.add("active");
}

function editBooking(bookingId) {
  const booking = window.allBookings.find(b => b.id === bookingId);
  
  if (!booking) {
    alert("Booking not found");
    return;
  }

  const data = booking;
  
  // Populate form with existing data
  document.getElementById("editBookingId").value = bookingId;
  document.getElementById("editStatus").value = data.status || "pending";
  document.getElementById("editPriority").value = data.priority || "normal";
  document.getElementById("editFinalPrice").value = data.finalPrice || "";
  document.getElementById("editAssignedTo").value = data.assignedTo || "";
  document.getElementById("editNotes").value = data.notes || "";

  // Set up archive button with current state
  const archiveBtn = document.getElementById("editArchived");
  const isCurrentlyArchived = data.archived === true;
  
  archiveBtn.setAttribute("data-archived", isCurrentlyArchived ? "true" : "false");
  archiveBtn.setAttribute("data-booking-id", bookingId);
  archiveBtn.style.backgroundColor = isCurrentlyArchived ? "#ef4444" : "#007e76";
  archiveBtn.style.color = "white";
  archiveBtn.style.padding = "10px 16px";
  archiveBtn.style.borderRadius = "8px";
  archiveBtn.style.border = "none";
  archiveBtn.style.cursor = "pointer";
  archiveBtn.style.fontWeight = "500";
  archiveBtn.style.fontSize = "14px";
  archiveBtn.style.transition = "all 0.3s ease";
  
  // Remove old event listener by cloning and replacing
  const newArchiveBtn = archiveBtn.cloneNode(true);
  archiveBtn.parentNode.replaceChild(newArchiveBtn, archiveBtn);
  
  // Add new click event listener - archive/unarchive directly
  document.getElementById("editArchived").addEventListener("click", async function(e) {
    e.preventDefault();
    
    const bookingIdToUpdate = this.getAttribute("data-booking-id");
    const currentState = this.getAttribute("data-archived") === "true";
    const newArchiveState = !currentState;
    
    console.log("Archive button clicked:", { bookingId: bookingIdToUpdate, currentState, newArchiveState });
    
    try {
      const { updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      
      const bookingRef = doc(db, "bookings", bookingIdToUpdate);
      await updateDoc(bookingRef, {
        archived: newArchiveState
      });
      
      console.log("Booking archived status updated to:", newArchiveState);
      
      // Show success message
      Toastify({
        text: newArchiveState ? "Booking archived successfully!" : "Booking unarchived successfully!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(135deg, #34d399, #10b981)",
        stopOnFocus: true,
        close: true,
        style: {
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "14px",
          fontFamily: "Poppins",
          fontWeight: "500"
        }
      }).showToast();
      
      closeEditModal();
    } catch (error) {
      console.error("Error updating archive status:", error);
      Toastify({
        text: "Error updating archive status",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(135deg, #ef4444, #dc2626)",
        stopOnFocus: true,
        close: true,
        style: {
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "14px",
          fontFamily: "Poppins",
          fontWeight: "500"
        }
      }).showToast();
    }
  });

  document.getElementById("editBookingModal").classList.add("active");
}

function closeViewModal() {
  document.getElementById("viewBookingModal").classList.remove("active");
}

function closeEditModal() {
  document.getElementById("editBookingModal").classList.remove("active");
}

async function saveBookingChanges() {
  const bookingId = document.getElementById("editBookingId").value;
  const status = document.getElementById("editStatus").value;
  const priority = document.getElementById("editPriority").value;
  const finalPrice = document.getElementById("editFinalPrice").value;
  const assignedTo = document.getElementById("editAssignedTo").value;
  const notes = document.getElementById("editNotes").value;

  console.log("Saving booking changes:", { bookingId, status, priority, finalPrice, assignedTo, notes });

  try {
    const { updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status,
      priority,
      finalPrice: finalPrice ? parseFloat(finalPrice) : null,
      assignedTo,
      notes
    });

    console.log("Booking updated in Firestore");

    // Show success message
    Toastify({
      text: "Booking updated successfully!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(135deg, #34d399, #10b981)",
      stopOnFocus: true,
      close: true,
      style: {
        borderRadius: "12px",
        padding: "14px 18px",
        fontSize: "14px",
        fontFamily: "Poppins",
        fontWeight: "500"
      }
    }).showToast();

    closeEditModal();
  } catch (error) {
    console.error("Error updating booking:", error);
    Toastify({
      text: "Error updating booking",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(135deg, #ef4444, #dc2626)",
      stopOnFocus: true,
      close: true,
      style: {
        borderRadius: "12px",
        padding: "14px 18px",
        fontSize: "14px",
        fontFamily: "Poppins",
        fontWeight: "500"
      }
    }).showToast();
  }
}

async function unarchiveBooking(bookingId) {
  try {
    const { updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      archived: false
    });

    // Show success message
    Toastify({
      text: "Booking unarchived successfully!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(135deg, #34d399, #10b981)",
      stopOnFocus: true,
      close: true,
      style: {
        borderRadius: "12px",
        padding: "14px 18px",
        fontSize: "14px",
        fontFamily: "Poppins",
        fontWeight: "500"
      }
    }).showToast();
  } catch (error) {
    console.error("Error unarchiving booking:", error);
    Toastify({
      text: "Error unarchiving booking",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(135deg, #ef4444, #dc2626)",
      stopOnFocus: true,
      close: true,
      style: {
        borderRadius: "12px",
        padding: "14px 18px",
        fontSize: "14px",
        fontFamily: "Poppins",
        fontWeight: "500"
      }
    }).showToast();
  }
}

// Close modals when clicking outside
window.addEventListener("click", (event) => {
  const viewModal = document.getElementById("viewBookingModal");
  const editModal = document.getElementById("editBookingModal");
  
  if (event.target === viewModal) {
    closeViewModal();
  }
  if (event.target === editModal) {
    closeEditModal();
  }
});

/* =========================
   LOGOUT
========================= */

import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

function setupLogout() {
  const btn = document.getElementById("logout");

  if (!btn) return;

  btn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "/admin";
    });
  });
}

/* =========================
   SETTINGS
========================= */

const auth = getAuth(app);

function showToast(text, background) {
  Toastify({
    text,
    duration: 4500,
    gravity: "top",
    position: "right",
    backgroundColor: background,
    stopOnFocus: true,
    close: true,
    style: {
      borderRadius: "12px",
      padding: "14px 18px",
      fontSize: "14px",
      fontFamily: "Poppins",
      fontWeight: "500",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.27)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255, 255, 255, 0.06)"
    },
    className: "toastify-premium"
  }).showToast();
}

function setupSettings() {
  // Load user information
  loadUserInfo();
  
  // Setup change password form
  const changePasswordForm = document.getElementById("changePasswordForm");
  if (changePasswordForm) {
    // Check if user can change password
    const isPasswordUser = isPasswordAuthUser();
    
    if (!isPasswordUser) {
      // User is logged in via Google OAuth - disable password change
      disablePasswordChange();
    } else {
      // User is password-authenticated - enable password change
      changePasswordForm.addEventListener("submit", handleChangePassword);
    }
  }

  // Setup booking toggle
  const bookingToggle = document.getElementById("bookingToggle");
  if (bookingToggle) {
    // Load saved booking state from Firestore with real-time listener
    const settingsRef = doc(db, "settings", "bookings");
    onSnapshot(settingsRef, (snapshot) => {
      const bookingEnabled = snapshot.exists() ? snapshot.data().enabled !== false : true;
      bookingToggle.checked = bookingEnabled;
      updateBookingStatusDisplay(bookingEnabled);
      window.previousBookingState = bookingEnabled;
    }, (error) => {
      console.log("Settings not found, using default (enabled)", error);
      bookingToggle.checked = true;
      updateBookingStatusDisplay(true);
      window.previousBookingState = true;
    });
    
    // Add change listener
    bookingToggle.addEventListener("change", handleBookingToggle);
  }
}

function isPasswordAuthUser() {
  const user = auth.currentUser;
  
  if (!user) return false;
  
  // Check if user has password authentication provider
  const providers = user.providerData.map(provider => provider.providerId);
  
  // If user has password provider, they can change password
  // If only has google.com provider, they cannot change password
  return providers.includes("password");
}

function disablePasswordChange() {
  const changePasswordForm = document.getElementById("changePasswordForm");
  if (!changePasswordForm) return;
  
  // Disable the form
  const inputs = changePasswordForm.querySelectorAll("input");
  inputs.forEach(input => input.disabled = true);
  
  const button = changePasswordForm.querySelector("button");
  if (button) {
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.cursor = "not-allowed";
  }
  
  // Add message
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = `
    background: #e0f7f5;
    border-left: 4px solid #007e76;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 15px;
    color: #007e76;
    font-weight: 600;
  `;
  messageDiv.innerHTML = `
    <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
    You're signed in with Google. Password changes are managed through your Google account.
  `;
  
  changePasswordForm.parentElement.insertBefore(messageDiv, changePasswordForm);
}

function loadUserInfo() {
  const user = auth.currentUser;
  
  if (user) {
    // Display email
    const emailDisplay = document.getElementById("adminEmailDisplay");
    if (emailDisplay) {
      emailDisplay.textContent = user.email || "No email";
    }

    // Display current user
    const userDisplay = document.getElementById("currentUserDisplay");
    if (userDisplay) {
      const displayName = user.displayName || user.email?.split("@")[0] || "Admin User";
      userDisplay.textContent = displayName;
    }
  } else {
    // User not logged in, redirect to login
    // window.location.href = "/admin/login.html";
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  
  // Double-check: Prevent OAuth users from changing password
  if (!isPasswordAuthUser()) {
    showToast("Password changes are not available for Google sign-in accounts", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }
  
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validation
  if (newPassword.length < 6) {
    showToast("New password must be at least 6 characters long", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("New passwords do not match", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  if (currentPassword === newPassword) {
    showToast("New password must be different from current password", "linear-gradient(135deg, #f59e0b, #f97316)");
    return;
  }

  try {
    const user = auth.currentUser;
    
    if (!user?.email) {
      showToast("User not authenticated", "linear-gradient(135deg, #ef4444, #dc2626)");
      return;
    }

    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    // Clear form
    document.getElementById("changePasswordForm").reset();

    // Show success message
    showToast("Password updated successfully!", "linear-gradient(135deg, #34d399, #10b981)");
  } catch (error) {
    console.error("Error changing password:", error);
    
    if (error.code === "auth/wrong-password") {
      showToast("Current password is incorrect", "linear-gradient(135deg, #ef4444, #dc2626)");
    } else if (error.code === "auth/weak-password") {
      showToast("New password is too weak. Please use a stronger password", "linear-gradient(135deg, #f59e0b, #f97316)");
    } else {
      showToast("Error changing password: " + error.message, "linear-gradient(135deg, #ef4444, #dc2626)");
    }
  }
}

function handleBookingToggle(e) {
  const bookingToggle = document.getElementById("bookingToggle");
  const isEnabled = e.target.checked;
  
  // Store the new state and previous state for potential revert
  window.newBookingState = isEnabled;
  window.previousBookingState = !isEnabled;
  
  // Show confirmation dialog
  showConfirmationModal(
    isEnabled ? "Enable Bookings?" : "Disable Bookings?",
    isEnabled 
      ? "Are you sure you want to enable bookings? Users will be able to submit booking requests." 
      : "Are you sure you want to disable bookings? No new booking requests will be accepted, and a message will appear on the booking page.",
    () => confirmBookingToggle(isEnabled)
  );
}

async function confirmBookingToggle(isEnabled) {
  try {
    // Save to Firestore (real-time sync)
    const settingsRef = doc(db, "settings", "bookings");
    await setDoc(settingsRef, {
      enabled: isEnabled,
      updatedAt: new Date(),
      updatedBy: auth.currentUser?.email || "admin"
    }, { merge: true });
    
    // Update previous state to new state (for future toggles)
    window.previousBookingState = isEnabled;
    
    // Update display
    updateBookingStatusDisplay(isEnabled);
    
    // Show confirmation message
    const message = isEnabled ? "Bookings have been enabled" : "Bookings have been disabled";
    showToast(message, "linear-gradient(135deg, #34d399, #10b981)");
  } catch (error) {
    console.error("Error updating booking status:", error);
    showToast("Failed to update booking status: " + error.message, "linear-gradient(135deg, #ef4444, #dc2626)");
  }
  
  closeConfirmationModal();
}

function updateBookingStatusDisplay(isEnabled) {
  const statusValue = document.getElementById("bookingStatusValue");
  if (statusValue) {
    statusValue.textContent = isEnabled ? "enabled" : "disabled";
  }
}

function showConfirmationModal(title, message, onConfirm) {
  // Create modal if it doesn't exist
  let modal = document.getElementById("confirmationModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "confirmationModal";
    modal.className = "confirmation-modal";
    modal.innerHTML = `
      <div class="confirmation-content">
        <h3></h3>
        <p></p>
        <div class="confirmation-buttons">
          <button class="btn-cancel" onclick="window.closeConfirmationModal()">Cancel</button>
          <button class="btn-confirm" onclick="window.confirmBookingToggleFinal()">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Update content
  modal.querySelector("h3").textContent = title;
  modal.querySelector("p").textContent = message;

  // Store the callback
  window.confirmBookingToggleFinal = onConfirm;

  // Show modal
  modal.classList.add("active");
}

function closeConfirmationModal() {
  const modal = document.getElementById("confirmationModal");
  if (modal) {
    modal.classList.remove("active");
  }
  
  // Revert the toggle to its previous state if cancelled
  const bookingToggle = document.getElementById("bookingToggle");
  if (bookingToggle && window.previousBookingState !== undefined) {
    bookingToggle.checked = window.previousBookingState;
    updateBookingStatusDisplay(window.previousBookingState);
  }
}

window.closeConfirmationModal = closeConfirmationModal;

/* =========================
   INIT UI
========================= */

document.addEventListener("DOMContentLoaded", () => {
  setupSidebar();
  setupLogout();
  loadDashboardStats();
  loadAnalytics();
  loadBookings();
  setupSettings(); // Initialize settings
});

// Expose functions to global scope for onclick handlers
window.viewBooking = viewBooking;
window.editBooking = editBooking;
window.unarchiveBooking = unarchiveBooking;
window.closeViewModal = closeViewModal;
window.closeEditModal = closeEditModal;
window.saveBookingChanges = saveBookingChanges;