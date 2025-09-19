import { useState } from "react";
import ProductForm from "./ProductForm.jsx";
import ProductsList from "./ProductsList.jsx";

export default function Products() {
  const [editingId, setEditingId] = useState(null);

  const handleSaved = () => {
    setEditingId(null); // return to list after create/update
  };

  return editingId ? (
    <ProductForm productId={editingId} onSaved={handleSaved} />
  ) : (
    <ProductsList onEdit={setEditingId} />
  );
}
