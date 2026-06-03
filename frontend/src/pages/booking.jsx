import React from "react";
import { useState, useEffect } from "react";

import ServiceCard from "../components/ServiceCard";
import StylistPicker from "../components/StylistPicker";
import DatePicker from "../components/DatePicker";
import BookingSummary from "../components/BookingSummary";

const getAPI = () =>
  localStorage.getItem("apiUrl") || "http://localhost:8000";

const STEPS = ["Service", "Stylist", "Date & Time", "Details", "Confirm"];

const STEP_SERVICE = 0;
const STEP_STYLIST = 1;
const STEP_DATETIME = 2;
const STEP_DETAILS = 3;
const STEP_CONFIRM = 4;

export default function Booking() {
  const [step, setStep] = useState(STEP_SERVICE);

  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`${getAPI()}/services/`)
      .then((r) => r.json())
      .then(setServices)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedService) return;

    fetch(`${getAPI()}/stylists/`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = data.filter((s) =>
          s.service_ids?.includes(selectedService.id)
        );
        setStylists(filtered);
      })
      .catch(console.error);
  }, [selectedService]);

  useEffect(() => {
    if (!selectedStylist || !selectedDate || !selectedService) return;

    fetch(
      `${getAPI()}/stylists/${selectedStylist.id}/availability?date=${selectedDate}&service_id=${selectedService.id}`
    )
      .then((r) => r.json())
      .then((data) =>
        setSlots(Array.isArray(data) ? data : data.available_slots || [])
      )
      .catch(console.error);
  }, [selectedStylist, selectedDate, selectedService]);

  async function submitBooking() {
    setLoading(true);

    const appointment_time = `${selectedDate}T${selectedTime}:00`;

    try {
      const res = await fetch(`${getAPI()}/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stylist_id: selectedStylist.id,
          service_id: selectedService.id,
          client_name: form.name,
          client_email: form.email,
          client_phone: form.phone,
          notes: form.notes,
          appointment_time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("error detail:", JSON.stringify(data));
        alert("Booking failed: " + JSON.stringify(data));
        setLoading(false);
        return;
      }

      console.log("booking response:", data);
      setBooking(data);
      setStep(STEP_CONFIRM);
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 24, color: "#fff", background: "#0d0d0d", minHeight: "100vh" }}>

      {step === STEP_SERVICE && (
        <>
          <h2>Select Service</h2>
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              selected={selectedService?.id === s.id}
              onSelect={setSelectedService}
            />
          ))}
          <button disabled={!selectedService} onClick={() => setStep(STEP_STYLIST)}>
            Continue
          </button>
        </>
      )}

      {step === STEP_STYLIST && (
        <>
          <h2>Select Stylist</h2>
          {stylists.map((s) => (
            <StylistPicker
              key={s.id}
              stylist={s}
              selected={selectedStylist?.id === s.id}
              onSelect={setSelectedStylist}
            />
          ))}
          <button onClick={() => setStep(STEP_SERVICE)}>Back</button>
          <button disabled={!selectedStylist} onClick={() => setStep(STEP_DATETIME)}>
            Continue
          </button>
        </>
      )}

      {step === STEP_DATETIME && (
        <>
          <h2>Select Date & Time</h2>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <DatePicker
            slots={slots}
            selected={selectedTime}
            onSelect={setSelectedTime}
          />
          <button onClick={() => setStep(STEP_STYLIST)}>Back</button>
          <button disabled={!selectedDate || !selectedTime} onClick={() => setStep(STEP_DETAILS)}>
            Continue
          </button>
        </>
      )}

      {step === STEP_DETAILS && (
        <>
          <h2>Your Details</h2>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button onClick={() => setStep(STEP_DATETIME)}>Back</button>
          <button onClick={() => setStep(STEP_CONFIRM)}>Review</button>
        </>
      )}

      {step === STEP_CONFIRM && !booking && (
        <>
          <h2>Confirm Booking</h2>
          <BookingSummary
            service={selectedService}
            stylist={selectedStylist}
            date={selectedDate}
            time={selectedTime}
            form={form}
          />
          <button onClick={() => setStep(STEP_DETAILS)}>Back</button>
          <button disabled={loading} onClick={submitBooking}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </>
      )}

      {booking && (
        <>
          <h2>Booking Successful 🎉</h2>
          <p>ID: {String(booking.id)}</p>
          <button
            onClick={() => {
              setStep(STEP_SERVICE);
              setSelectedService(null);
              setSelectedStylist(null);
              setSelectedDate("");
              setSelectedTime("");
              setForm({ name: "", email: "", phone: "", notes: "" });
              setBooking(null);
            }}
          >
            Book Another
          </button>
        </>
      )}
    </div>
  );
}