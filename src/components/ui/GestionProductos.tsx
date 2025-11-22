import React, { useEffect, useMemo, useState } from "react";

/** ✅ Tipo local (NO importes desde App para evitar errores de export) */
export type ProductoGestion = {
  id: number;
  sku: string;
  descripcion: string;
  categoria: string;
  costo: number;
  venta: number;
  stock: number;
  obs: string;
  activo: boolean;
  updatedAt?: string;
};

type Props = {
  productos: ProductoGestion[];
  setProductos: React.Dispatch<React.SetStateAction<ProductoGestion[]>>;
};

/** 🔧 Claves permitidas para ordenar */
type OrdenKey =
  | "sku"
  | "descripcion"
  | "categoria"
  | "costo"
  | "stock"
  | "venta"
  | "obs"
  | "activo";

type OrdenState = {
  key: OrdenKey;
  dir: "asc" | "desc";
};

export default function GestionProductos({ productos, setProductos }: Props) {
  const categoriasDefault = [
    "Hamburguesas",
    "Milanesas",
    "Bebidas",
    "Guarniciones",
    "Otros",
  ];

  const emptyForm: Omit<ProductoGestion, "id"> = {
    sku: "",
    descripcion: "",
    categoria: categoriasDefault[0],
    costo: 0,
    venta: 0,
    stock: 0,
    obs: "",
    activo: true,
  };

  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<ProductoGestion | null>(null);

  /** ✅ acá está la corrección fuerte */
  const [form, setForm] = useState<Omit<ProductoGestion, "id">>(emptyForm);

  const [categorias, setCategorias] = useState<string[]>(categoriasDefault);

  const [orden, setOrden] = useState<OrdenState>({
    key: "descripcion",
    dir: "asc",
  });

  useEffect(() => {
    if (editando) {
      setForm({
        sku: editando.sku || "",
        descripcion: editando.descripcion || "",
        categoria: editando.categoria || categoriasDefault[0],
        costo: editando.costo ?? 0,
        venta: editando.venta ?? 0,
        stock: editando.stock ?? 0,
        obs: editando.obs || "",
        activo: editando.activo ?? true,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editando]); // ✅ sin eslint disable

  const validar = () => {
    if (!form.sku.trim()) return "El SKU es obligatorio";
    if (!form.descripcion.trim()) return "La descripción es obligatoria";
    if (form.costo < 0 || form.venta < 0 || form.stock < 0)
      return "No se permiten valores negativos";
    return null;
  };

  const guardarProducto = () => {
    const error = validar();
    if (error) return alert(error);

    if (editando) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === editando.id
            ? {
                ...p,
                ...form,
                id: editando.id,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    } else {
      const nuevoId = productos.length
        ? Math.max(...productos.map((p) => p.id)) + 1
        : 1;

      /** ✅ forzamos el tipo final */
      const nuevo: ProductoGestion = {
        ...form,
        id: nuevoId,
        updatedAt: new Date().toISOString(),
      };

      setProductos((prev) => [...prev, nuevo]);
    }

    setEditando(null);
    setBusqueda("");
  };

  const eliminarProducto = (id: number) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    setProductos((prev) => prev.filter((p) => p.id !== id));
    if (editando?.id === id) setEditando(null);
  };

  const agregarCategoria = () => {
    const nombre = prompt("Nueva categoría:");
    if (!nombre?.trim()) return;
    if (categorias.includes(nombre)) return alert("Esa categoría ya existe");
    setCategorias((prev) => [...prev, nombre]);
    setForm((f) => ({ ...f, categoria: nombre }));
  };

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase();

    let res = productos.filter(
      (p) =>
        (p.descripcion || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q)
    );

    res.sort((a, b) => {
      const key = orden.key;
      const va = a[key];
      const vb = b[key];

      if (va == null) return 1;
      if (vb == null) return -1;

      if (typeof va === "number" && typeof vb === "number") {
        return orden.dir === "asc" ? va - vb : vb - va;
      }

      return orden.dir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

    return res;
  }, [productos, busqueda, orden]);

  const setOrdenarPor = (key: OrdenKey) => {
    setOrden((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const FormularioInline = () => (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginBottom: 8 }}>
        {editando ? `Editando: ${editando.descripcion}` : "Nuevo producto"}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
        />
        <input
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) =>
            setForm({ ...form, descripcion: e.target.value })
          }
        />

        <div style={{ display: "flex", gap: 6 }}>
          <select
            value={form.categoria}
            onChange={(e) =>
              setForm({ ...form, categoria: e.target.value })
            }
            style={{ flex: 1 }}
          >
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button onClick={agregarCategoria}>+</button>
        </div>

        <input
          type="number"
          min={0}
          placeholder="$ Costo"
          value={form.costo}
          onChange={(e) =>
            setForm({ ...form, costo: e.target.valueAsNumber || 0 })
          }
        />
        <input
          type="number"
          min={0}
          placeholder="Stock"
          value={form.stock}
          onChange={(e) =>
            setForm({ ...form, stock: e.target.valueAsNumber || 0 })
          }
        />
        <input
          type="number"
          min={0}
          placeholder="$ Venta"
          value={form.venta}
          onChange={(e) =>
            setForm({ ...form, venta: e.target.valueAsNumber || 0 })
          }
        />
      </div>

      <textarea
        placeholder="Observaciones"
        value={form.obs}
        onChange={(e) => setForm({ ...form, obs: e.target.value })}
        style={{ width: "100%", marginTop: 8 }}
      />

      <label style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          type="checkbox"
          checked={form.activo}
          onChange={(e) =>
            setForm({ ...form, activo: e.target.checked })
          }
        />
        Activo
      </label>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {editando && (
          <button onClick={() => setEditando(null)}>Cancelar</button>
        )}
        <button onClick={guardarProducto}>
          {editando ? "Guardar cambios" : "Guardar producto"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Buscar por SKU o descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => setEditando(null)}>Nuevo producto</button>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 12 }}>
        <table width="100%" cellPadding={6} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eee" }}>
              <th onClick={() => setOrdenarPor("sku")} style={{ cursor: "pointer" }}>SKU</th>
              <th onClick={() => setOrdenarPor("descripcion")} style={{ cursor: "pointer" }}>Descripción</th>
              <th onClick={() => setOrdenarPor("categoria")} style={{ cursor: "pointer" }}>Categoría</th>
              <th onClick={() => setOrdenarPor("costo")} style={{ cursor: "pointer" }}>$ Costo</th>
              <th onClick={() => setOrdenarPor("stock")} style={{ cursor: "pointer" }}>Stock</th>
              <th onClick={() => setOrdenarPor("venta")} style={{ cursor: "pointer" }}>$ Venta</th>
              <th>Obs</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: 12 }}>
                  No hay productos para mostrar
                </td>
              </tr>
            )}

            {filtrados.map((p) => (
              <React.Fragment key={p.id}>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{p.sku}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.categoria}</td>
                  <td>{Number(p.costo || 0).toFixed(2).replace(".", ",")}</td>
                  <td>{p.stock}</td>
                  <td>{Number(p.venta || 0).toFixed(2).replace(".", ",")}</td>
                  <td>{p.obs}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 12 }}>
                      {p.activo ? "✅ Activo" : "❌ Inactivo"}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        setEditando((prev) => (prev?.id === p.id ? null : p))
                      }
                      style={{ marginRight: 6 }}
                    >
                      ✏️
                    </button>
                    <button onClick={() => eliminarProducto(p.id)}>🗑️</button>
                  </td>
                </tr>

                {editando?.id === p.id && (
                  <tr>
                    <td colSpan={9} style={{ background: "#fafafa" }}>
                      <FormularioInline />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
