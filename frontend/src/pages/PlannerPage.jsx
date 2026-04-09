import React, { useEffect, useState } from "react";
import PlannerChecklist from "../components/PlannerChecklist";
import api from "../services/api";

const PlannerPage = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", category: "Organisation", due_date: "" });

  const loadItems = async () => {
    const response = await api.get("/api/checklist");
    setItems(response.data.items);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    await api.post("/api/checklist", form);
    setForm({ title: "", category: "Organisation", due_date: "" });
    loadItems();
  };

  const handleToggle = async (item) => {
    await api.patch(`/api/checklist/${item.id}`, { completed: !item.completed });
    loadItems();
  };

  const handleDelete = async (itemId) => {
    await api.delete(`/api/checklist/${itemId}`);
    loadItems();
  };

  return (
    <div className="page-stack">
      <section className="content-section two-columns">
        <form className="surface-card" onSubmit={handleCreate}>
          <p className="section-label">Checklist mariage</p>
          <h1>Ajouter une tache</h1>
          <div className="form-grid">
            <label>
              Titre
              <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
            </label>

            <label>
              Categorie
              <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
            </label>

            <label>
              Date limite
              <input type="date" value={form.due_date} onChange={(event) => setForm((prev) => ({ ...prev, due_date: event.target.value }))} />
            </label>

            <button className="btn btn-primary" type="submit">Ajouter</button>
          </div>
        </form>

        <div className="surface-card warm-card">
          <p className="section-label">Progression</p>
          <h2>{items.filter((item) => item.completed).length} / {items.length} taches terminees</h2>
          <p className="muted">Chaque client dispose de sa propre checklist personnalisee.</p>
        </div>
      </section>

      <PlannerChecklist items={items} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
};

export default PlannerPage;
