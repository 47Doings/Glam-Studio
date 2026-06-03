const getBaseUrl = () =>
  localStorage.getItem("apiUrl") || "http://localhost:8000";

async function request(url, options = {}) {
  const res = await fetch(`${getBaseUrl()}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "API Error");
  }

  return res.status === 204 ? null : res.json();
}

// ── SERVICES ─────────────────────────
export const getServices = () => request("/services/");
export const createService = (data) =>
  request("/services/", { method: "POST", body: JSON.stringify(data) });
export const updateService = (id, data) =>
  request(`/services/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteService = (id) =>
  request(`/services/${id}`, { method: "DELETE" });

// ── STYLISTS ─────────────────────────
export const getStylists = () => request("/stylists/");
export const createStylist = (data) =>
  request("/stylists/", { method: "POST", body: JSON.stringify(data) });
export const updateStylist = (id, data) =>
  request(`/stylists/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteStylist = (id) =>
  request(`/stylists/${id}`, { method: "DELETE" });

// ── BOOKINGS ─────────────────────────
export const getBookings = () => request("/bookings/");
export const createBooking = (data) =>
  request("/bookings/", { method: "POST", body: JSON.stringify(data) });
export const updateBooking = (id, data) =>
  request(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const cancelBooking = (id) =>
  request(`/bookings/${id}/cancel`, { method: "PATCH" });
export const deleteBooking = (id) =>
  request(`/bookings/${id}`, { method: "DELETE" });

export default {
  getServices,
  createService,
  updateService,
  deleteService,
  getStylists,
  createStylist,
  updateStylist,
  deleteStylist,
  getBookings,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
};