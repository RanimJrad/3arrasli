import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const PaymentsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    reservation_id: "",
    card_number: "",
    card_holder: "",
    expiry: "",
    cvc: "",
  });

  const payableReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status !== "confirmed"),
    [reservations]
  );

  const loadReservations = async () => {
    const response = await api.get("/api/reservations");
    setReservations(response.data.reservations);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/api/payments", form);
      setMessage(`${response.data.message} Reference: ${response.data.payment.transaction_reference}`);
      setForm({ reservation_id: "", card_number: "", card_holder: "", expiry: "", cvc: "" });
      loadReservations();
    } catch (error) {
      setMessage(error.response?.data?.message || "Paiement impossible.");
    }
  };

  return (
    <div className="page-stack">
      <section className="content-section two-columns">
        <form className="surface-card" onSubmit={handleSubmit}>
          <p className="section-label">Paiement en ligne</p>
          <h1>Regler une reservation</h1>

          <div className="form-grid">
            <label>
              Reservation
              <select value={form.reservation_id} onChange={(event) => setForm((prev) => ({ ...prev, reservation_id: event.target.value }))} required>
                <option value="">Selectionnez</option>
                {payableReservations.map((reservation) => (
                  <option key={reservation.id} value={reservation.id}>
                    {reservation.provider_name} - {reservation.budget} TND
                  </option>
                ))}
              </select>
            </label>

            <label>
              Numero de carte
              <input value={form.card_number} onChange={(event) => setForm((prev) => ({ ...prev, card_number: event.target.value }))} placeholder="4242 4242 4242 4242" required />
            </label>

            <label>
              Titulaire
              <input value={form.card_holder} onChange={(event) => setForm((prev) => ({ ...prev, card_holder: event.target.value }))} required />
            </label>

            <label>
              Expiration
              <input value={form.expiry} onChange={(event) => setForm((prev) => ({ ...prev, expiry: event.target.value }))} placeholder="12/28" required />
            </label>

            <label>
              CVC
              <input value={form.cvc} onChange={(event) => setForm((prev) => ({ ...prev, cvc: event.target.value }))} placeholder="123" required />
            </label>

            <button className="btn btn-primary" type="submit">Payer maintenant</button>
          </div>

          {message ? <div className="notice">{message}</div> : null}
        </form>

        <aside className="surface-card warm-card">
          <p className="section-label">Securite</p>
          <ul className="feature-list compact">
            <li>Ne jamais stocker le numero complet de carte</li>
            <li>Utiliser HTTPS en production</li>
            <li>Deleguer idealement a Stripe ou Flutterwave</li>
            <li>Journaliser uniquement les references de transaction</li>
          </ul>
        </aside>
      </section>
    </div>
  );
};

export default PaymentsPage;
