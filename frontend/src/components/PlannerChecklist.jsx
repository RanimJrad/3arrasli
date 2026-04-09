import React from "react";

const PlannerChecklist = ({ items, onToggle, onDelete }) => {
  return (
    <div className="checklist-grid">
      {items.map((item) => (
        <article key={item.id} className={`checklist-card ${item.completed ? "done" : ""}`}>
          <div>
            <p className="section-label">{item.category}</p>
            <h3>{item.title}</h3>
            <p className="muted">{item.due_date ? `Echeance: ${item.due_date}` : "Sans date limite"}</p>
          </div>
          <div className="action-row">
            <button className="btn btn-secondary" type="button" onClick={() => onToggle(item)}>
              {item.completed ? "Annuler" : "Terminer"}
            </button>
            <button className="icon-btn" type="button" onClick={() => onDelete(item.id)}>
              Supprimer
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PlannerChecklist;
