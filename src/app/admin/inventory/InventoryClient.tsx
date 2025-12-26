"use client";

import { useEffect, useState } from "react";
import type { Product, StockMovement } from "@prisma/client";

interface MovementWithProduct extends StockMovement {
  product: Product;
}

export function InventoryClient({ products }: { products: Product[] }) {
  const [movements, setMovements] = useState<MovementWithProduct[]>([]);
  const [productList, setProductList] = useState(products);
  const [form, setForm] = useState({ productId: products[0]?.id ?? "", type: "IN", quantity: "", reason: "" });

  const loadMovements = async () => {
    const res = await fetch("/api/admin/inventory");
    if (res.ok) {
      const data = await res.json();
      setMovements(data);
    }
  };

  const loadProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProductList(data);
      if (!form.productId && data.length > 0) {
        setForm((prev) => ({ ...prev, productId: data[0].id }));
      }
    }
  };

  useEffect(() => {
    loadMovements();
    loadProducts();
  }, []);

  const submitMovement = async () => {
    if (!form.productId) {
      alert("Select a product");
      return;
    }
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
      }),
    });
    if (res.ok) {
      setForm({ ...form, quantity: "", reason: "" });
      await loadMovements();
      await loadProducts();
    } else {
      const data = await res.json();
      alert(data.error || "Unable to post movement");
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-slate-900">Stock movement</h2>
        {productList.length === 0 ? (
          <p className="mt-2 text-sm text-red-600">No products available. Create a product first.</p>
        ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Product</label>
            <select
              className="mt-1 w-full"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            >
              {productList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Type</label>
            <select
              className="mt-1 w-full"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
              <option value="ADJUST">ADJUST</option>
              <option value="RETURN">RETURN</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Quantity</label>
            <input
              className="mt-1 w-full"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Reason</label>
            <input
              className="mt-1 w-full"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
        </div>
        )}
        <button
          className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-white shadow hover:bg-brand-800"
          onClick={submitMovement}
          disabled={productList.length === 0}
        >
          Record movement
        </button>
      </div>

      <div className="card">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Recent ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="font-medium">{m.product.name}</td>
                  <td><span className="badge-blue">{m.type}</span></td>
                  <td>{m.quantity}</td>
                  <td>{m.reason}</td>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
