"use client";

import { useEffect, useState } from "react";
import type { Product } from "@prisma/client";

export function ProductsClient({ initial }: { initial: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [form, setForm] = useState({ name: "", sku: "", price: "", stock: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; price: string; stock: string; description: string }>({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  const loadProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const createProduct = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description,
        active: true,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const product = await res.json();
      setProducts([product, ...products]);
      setForm({ name: "", sku: "", price: "", stock: "", description: "" });
    } else {
      const data = await res.json();
      alert(data.error || "Unable to create product");
    }
  };

  const toggleActive = async (product: Product) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: Number(product.price).toString(),
      stock: product.stock.toString(),
      description: product.description ?? "",
    });
  };

  const saveEdit = async (product: Product) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
        description: editForm.description,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
      setEditingId(null);
    } else {
      const data = await res.json();
      alert(data.error || "Unable to update product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-slate-900">Create product</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">SKU</label>
            <input
              className="mt-1 w-full"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Price (AED)</label>
            <input
              className="mt-1 w-full"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Stock</label>
            <input
              className="mt-1 w-full"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="mt-1 w-full"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <button
          className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-white shadow hover:bg-brand-800"
          onClick={createProduct}
          disabled={loading}
        >
          Save product
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Products</h2>
          <button
            onClick={loadProducts}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium">
                    {editingId === product.id ? (
                      <input
                        className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td>{product.sku}</td>
                  <td>
                    {editingId === product.id ? (
                      <input
                        className="w-24 rounded border border-slate-200 px-2 py-1 text-sm"
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      />
                    ) : (
                      <>AED {Number(product.price).toFixed(2)}</>
                    )}
                  </td>
                  <td>
                    {editingId === product.id ? (
                      <input
                        className="w-20 rounded border border-slate-200 px-2 py-1 text-sm"
                        type="number"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      />
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleActive(product)}
                      className={
                        product.active ? "badge-green" : "badge-red"
                      }
                    >
                      {product.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="space-x-2 text-sm">
                    {editingId === product.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(product)}
                          className="rounded bg-brand-600 px-3 py-1 text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded border border-slate-200 px-3 py-1"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(product)}
                        className="rounded border border-slate-200 px-3 py-1"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
