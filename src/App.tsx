import { useEffect, useState } from "react"; 
import GestionProductos from "./components/ui/GestionProductos"; 
/* ========================= Tipos ========================= */ 
type MedioPago = "Efectivo" | "Débito" | "Crédito" | "QR" | "Cuenta"; 
export type LugarConsumo = "Retira" | "Delivery" | "Aca";

/* ==== Modificadores (definición) ==== */
type ModificadorKey =
  | "Sin Mayo"
  | "Sin Lechuga"
  | "Sin Tomate"
  | "Sin Huevo"
  | "Con Mostaza"
  | "Con Ketchup"
  | "Sin Queso"
  | "Sin Jamon"
  | "Papas c/ketchup";

type ModificadorDef = {
  key: ModificadorKey;
  label: string; // Cómo se muestra en UI/ticket
  delta: number; // Impacto en precio (0 si es “sin ...”)
};
// 👇 sumá esto a los tipos de modificadores que ya tenés
type LineaSeleccion = {
  uid: string;
  productoId: number;
  mods: Partial<Record<ModificadorKey, boolean>>;
  qty: number; // 👈 cantidad en la misma línea
};
type ResumenVentaModal = {
  numeroVenta: number;
  ventas: Venta[];
  pagos: Record<MedioPago, number>;
  total: number;
  vuelto: number;
};
export type ProductoGestion = {
  id: number;
  sku: string;
  descripcion: string;
  categoria: string;
  costo: number;
  stock: number;
  venta: number;
  obs: string;
  activo: boolean;
};



/** Catálogo: por producto, qué modificadores están disponibles */
const MODS_POR_PRODUCTO: Record<number, ModificadorDef[]> = {
  // Hamb completa simple / doble
  1: [
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  2: [
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  3: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  4: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  5: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Sin Huevo", label: "Sin Huevo", delta: 200 },
    { key: "Sin Queso", label: "Sin Queso", delta: -100 },
    { key: "Sin Jamon", label: "Sin Jamon", delta: -100 },
  ],
  6: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Sin Huevo", label: "Sin Huevo", delta: -200 },
    { key: "Sin Queso", label: "Sin Queso", delta: -100 },
    { key: "Sin Jamon", label: "Sin Jamon", delta: -100 },
  ],
  7: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  8: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Sin Huevo", label: "Sin Huevo", delta: 0 },
    { key: "Sin Queso", label: "Sin Queso", delta: 0 },
    { key: "Sin Jamon", label: "Sin Jamon", delta: 0 },
  ],
  9: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  10: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Sin Huevo", label: "Sin Huevo", delta: 0 },
    { key: "Sin Queso", label: "Sin Queso", delta: 0 },
    { key: "Sin Jamon", label: "Sin Jamon", delta: 0 },
  ],
  11: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  12: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Sin Huevo", label: "Sin Huevo", delta: 0 },
    { key: "Sin Queso", label: "Sin Queso", delta: 0 },
    { key: "Sin Jamon", label: "Sin Jamon", delta: 0 },
  ],
  13: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Con Mostaza", label: "Con Mostaza", delta: 0 },
    { key: "Con Ketchup", label: "Con Ketchup", delta: 0 },
  ],
  14: [
    { key: "Sin Lechuga", label: "Sin Lechuga", delta: 0 },
    { key: "Sin Tomate", label: "Sin Tomate", delta: 0 },
    { key: "Sin Mayo", label: "Sin Mayo", delta: 0 },
    { key: "Sin Huevo", label: "Sin Huevo", delta: 0 },
    { key: "Sin Queso", label: "Sin Queso", delta: 0 },
    { key: "Sin Jamon", label: "Sin Jamon", delta: 0 },
  ],

  // Podés sumar más IDs acá (lomito, etc.)
};

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

export interface Venta {
  fecha: string; // DD-MM-YYYY
  hora: string; // HH:mm:ss (24h)
  createdAtISO: string; // ISO completo
  producto: string;
  cantidad: number;
  precio: number; // unitario
  numeroVenta: number;
  mensajeTicket?: string;
  lugarConsumo: LugarConsumo;
  medioPago: MedioPago | "Mixto";
  productId?: number;
  mods?: Partial<Record<ModificadorKey, boolean>>;
  anulada?: boolean;
}

interface CierreCaja {
  id: string; // ISO time
  desdeISO: string;
  hastaISO: string;
  totalesPorMedio: Record<MedioPago, number>;
  totalGeneral: number;
  cantidadVentas: number;
}

interface Pago {
  numeroVenta: number;
  medio: MedioPago;
  monto: number;
  createdAtISO: string;
}

interface Estado {
  seleccionados: { [id: number]: number };
  ventaConfirmada: boolean;
  ventas: Venta[];
  montoPagado: number;
  numeroVentaActual: number;
  ventasAnteriores: Venta[];
  mensajeTicket: string;
  lugarConsumo: LugarConsumo;
  medioPagoActual: MedioPago;
  cierresCaja: CierreCaja[];
  ultimoCierreISO: string;
  pagosActuales: Record<MedioPago, number>;
  pagos: Pago[];
  modificadores: Record<number, Partial<Record<ModificadorKey, boolean>>>;
  lineas: LineaSeleccion[];
  comandas: Comanda[];
  comandaEnProcesoId: string | null; // si estoy confirmando una comanda específica
}
interface Comanda {
  id: string;
  fecha: string;
  hora: string;
  createdAtISO: string;
  numeroSugerido: number;
  lineas: LineaSeleccion[];
  estado: "pendiente" | "cobrada" | "anulada";
  obs?: string;
  alias?: string;
}

type ResumenCorte = {
  desdeISO: string;
  hastaISO: string;
  cantidadVentas: number;
  totalesPorMedio: Record<MedioPago, number>;
  totalGeneral: number;
};

/* ========================= Datos ========================= */
const productos: Producto[] = [
  { id: 1, nombre: "Hamb c/cheddar simple", precio: 8600 },
  { id: 2, nombre: "Hamb c/cheddar doble", precio: 10300 },
  { id: 3, nombre: "Hamb comun simple", precio: 8600 },
  { id: 4, nombre: "Hamb comun doble", precio: 10300 },
  { id: 5, nombre: "Hamb completa simple", precio: 10200 },
  { id: 6, nombre: "Hamb completa doble", precio: 11900 },
  { id: 7, nombre: "Patynesa comun", precio: 9000 },
  { id: 8, nombre: "Patynesa completa", precio: 10400 },
  { id: 9, nombre: "Lomito comun", precio: 11400 },
  { id: 10, nombre: "Lomito completo", precio: 12800 },
  { id: 11, nombre: "Mila sandwich comun", precio: 10000 },
  { id: 12, nombre: "Mila sandwich completo", precio: 11400 },
  { id: 13, nombre: "Suprema sand. comun", precio: 9000 },
  { id: 14, nombre: "Suprema sand. completo", precio: 10400 },
  { id: 15, nombre: "Tostado", precio: 6000 },
  { id: 16, nombre: "Carlitos", precio: 6000 },
  { id: 17, nombre: "Pizzanesa carne", precio: 20000 },
  { id: 18, nombre: "Pizzanesa pollo", precio: 18000 },
  { id: 19, nombre: "Milanesa al plato", precio: 9000 },
  { id: 20, nombre: "Suprema al plato", precio: 8000 },
  { id: 21, nombre: "Milanesa napo", precio: 10000 },
  { id: 22, nombre: "Suprema napo", precio: 9000 },
  { id: 23, nombre: "Milanesa picada", precio: 9000 },
  { id: 24, nombre: "Suprema picada", precio: 8000 },
  { id: 25, nombre: "Milanesa cheddar/grati", precio: 10000 },
  { id: 26, nombre: "Suprema cheddar/grati", precio: 9000 },
  { id: 27, nombre: "Milanesa a caballo", precio: 10000 },
  { id: 28, nombre: "Suprema a caballo", precio: 9000 },
  { id: 29, nombre: "Fritas porcion", precio: 6000 },
  { id: 30, nombre: "Fritas media porcion", precio: 4000 },
  { id: 31, nombre: "Fritas porcion c/cheddar", precio: 7000 },
  { id: 32, nombre: "Fritas media c/cheddar", precio: 5000 },
  { id: 33, nombre: "Cheddar agreg. porcion", precio: 1800 },
  { id: 34, nombre: "Cheddar agreg. media", precio: 1000 },
  { id: 35, nombre: "Nuggets 10un", precio: 5000 },
  { id: 36, nombre: "Nuggets 10un c/cheddar", precio: 6000 },
  { id: 37, nombre: "Pizza jym o napolitana", precio: 12000 },
  { id: 38, nombre: "Gaseosa chica", precio: 2500 },
  { id: 39, nombre: "Gaseosa 1.5l", precio: 5000 },
  { id: 40, nombre: "Coca vidrio", precio: 4500 },
  { id: 41, nombre: "Fernet Jarra", precio: 8000 },
  { id: 42, nombre: "Agua/Sabor. chica", precio: 2000 },
  { id: 43, nombre: "Agua/Sabar. grande", precio: 3500 },
  { id: 44, nombre: "Cerveza Santa Fe Lata", precio: 2500 },
  { id: 45, nombre: "Cerveza Santa Fe Botella", precio: 5000 },
  { id: 46, nombre: "Delivery", precio: 1500 },
  { id: 47, nombre: "Sin papas", precio: -2000 },
];

/* ========================= Estado inicial ========================= */
const initialState: Estado = {
  seleccionados: {},
  ventaConfirmada: false,
  ventas: [],
  montoPagado: 0,
  numeroVentaActual: 1001,
  ventasAnteriores: [],
  mensajeTicket: "",
  lugarConsumo: "Aca",
  medioPagoActual: "Efectivo",
  cierresCaja: [],
  ultimoCierreISO: "",
  pagosActuales: { Efectivo: 0, Débito: 0, Crédito: 0, QR: 0, Cuenta: 0 },
  pagos: [],
  modificadores: {},
  lineas: [],
  comandas: [],
  comandaEnProcesoId: null,
};

/* ========================= Constantes / helpers ========================= */
const MEDIOS: MedioPago[] = ["Efectivo", "Débito", "Crédito", "QR", "Cuenta"];

const estadoVacioPagos: Record<MedioPago, number> = {
  Efectivo: 0,
  Débito: 0,
  Crédito: 0,
  QR: 0,
  Cuenta: 0,
};

const fmtAR = (n: number) =>
  n.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const totalVentas = (vs: Venta[]) =>
  vs.reduce((acc, v) => acc + v.precio * v.cantidad, 0);

// Reemplazá nowParts() por esto:
const tz = "America/Argentina/Cordoba";
const nowParts = () => {
  const d = new Date();
  const fmt = new Intl.DateTimeFormat("es-AR", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = fmt
  .formatToParts(d)
  .reduce((acc: Record<string, string>, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

  const yyyy = parts.year,
    mm = parts.month,
    dd = parts.day;
  const hh = parts.hour,
    mi = parts.minute,
    ss = parts.second;

  return {
    fecha: `${dd}-${mm}-${yyyy}`, // DD-MM-YYYY
    hora: `${hh}:${mi}:${ss}`,
    createdAtISO: `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}-03:00`,
  };
}; // ✅ ESTA LÍNEA FALTABA

const sumaPagos = (pagos: Record<MedioPago, number>) =>
  MEDIOS.reduce((s, k) => s + (Number(pagos[k]) || 0), 0);

// 🔥 BOTÓN REUTILIZABLE CON HOVER
const Boton = ({
  children,
  bg,
  color,
  hoverBg,
  hoverColor,
  onClick
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
  hoverBg: string;
  hoverColor: string;
  onClick?: () => void;
}) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: hover ? hoverBg : bg,
        color: hover ? hoverColor : color,
        cursor: "pointer",
        borderRadius: "4px",
        padding: "6px 14px",
        fontSize: "0.9rem",
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 700,
        border: "none",
        transition: "0.2s ease-in-out",
      }}
    >
      {children}
    </button>
  );
};

// ========================= Componente =========================
const Evento14Diciembre = () => {
const [mostrarGestion, setMostrarGestion] = useState(false);
const [productosGestion, setProductosGestion] = useState<ProductoGestion[]>(() => {
  try {
    const raw = localStorage.getItem("productosGestion");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error leyendo productosGestion", e);
  }

  // Carga inicial opcional desde tu catálogo actual:
  return productos.map((p) => ({
    id: p.id,
    sku: String(p.id),
    descripcion: p.nombre,
    categoria: "Hamburguesas",
    costo: 0,
    stock: 0,
    venta: p.precio,
    obs: "",
    activo: true,
  }));
});

useEffect(() => {
  try {
    localStorage.setItem("productosGestion", JSON.stringify(productosGestion));
  } catch (e) {
    console.error("Error guardando productosGestion", e);
  }
}, [productosGestion]);

  const [estado, setEstado] = useState<Estado>(() => {
    try {
      const raw = localStorage.getItem("estado");
      if (raw) {
        const s: any = JSON.parse(raw);

        // Medio de pago guardado o default
        const medioGuardado =
          s && typeof s.medioPagoActual === "string"
            ? s.medioPagoActual
            : "Efectivo";

        return {
          ...initialState,
          ...(s || {}),

          // aseguramos valores válidos
          medioPagoActual: medioGuardado,
          pagosActuales: {
            ...estadoVacioPagos,
            ...(s && s.pagosActuales ? s.pagosActuales : {}),
          },
          pagos: s && Array.isArray(s.pagos) ? s.pagos : [],
          modificadores: (s && s.modificadores) || {},
          lineas: s && Array.isArray(s.lineas) ? s.lineas : [],
          comandas: s && Array.isArray(s.comandas) ? s.comandas : [],
          comandaEnProcesoId:
            s && typeof s.comandaEnProcesoId === "string"
              ? s.comandaEnProcesoId
              : null,
        };
      }
    } catch (e) {
      console.error("Error leyendo localStorage", e);
    }

    // Fallback si no hay nada en storage o hubo error
    return {
      ...initialState,
      pagosActuales: { ...estadoVacioPagos },
      pagos: [],
      modificadores: {},
      lineas: [],
      comandas: [],
      comandaEnProcesoId: null,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("estado", JSON.stringify(estado));
    } catch (e) {
      console.error("Error guardando localStorage", e);
    }
  }, [estado]);

  // Modales y auxiliares
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [pagosDraft, setPagosDraft] = useState<Record<MedioPago, number>>({
    Efectivo: 0,
    Débito: 0,
    Crédito: 0,
    QR: 0,
    Cuenta: 0,
  });

  const [cierreAbierto, setCierreAbierto] = useState(false);
  const [resumenCorte, setResumenCorte] = useState<ResumenCorte | null>(null);
const [resumenVenta, setResumenVenta] = useState<ResumenVentaModal | null>(null);

  type BilleteKey =
    | "b100"
    | "b200"
    | "b500"
    | "b1000"
    | "b2000"
    | "b10000"
    | "b20000";
  const [billetes, setBilletes] = useState<Record<BilleteKey, string>>({
    b100: "",
    b200: "",
    b500: "",
    b1000: "",
    b2000: "",
    b10000: "",
    b20000: "",
  });
  const [cuentas, setCuentas] = useState({ bica: "", mp: "", macro: "" });

  const denom: Record<BilleteKey, number> = {
    b100: 100,
    b200: 200,
    b500: 500,
    b1000: 1000,
    b2000: 2000,
    b10000: 10000,
    b20000: 20000,
  };

  const billeteKeys: BilleteKey[] = [
  "b100",
  "b200",
  "b500",
  "b1000",
  "b2000",
  "b10000",
  "b20000",
];

const mediosPagoLista: MedioPago[] = ["Efectivo", "Débito", "Crédito", "QR", "Cuenta"];

const billetesDefs: { k: BilleteKey; l: string }[] = [
  { k: "b100", l: "$100" },
  { k: "b200", l: "$200" },
  { k: "b500", l: "$500" },
  { k: "b1000", l: "$1.000" },
  { k: "b2000", l: "$2.000" },
  { k: "b10000", l: "$10.000" },
  { k: "b20000", l: "$20.000" },
];
const cuentasDefs: Array<{ k: "bica" | "mp" | "macro"; label: string }> = [
  { k: "bica", label: "QR (Bica)" },
  { k: "mp", label: "Transferencia (MP)" },
  { k: "macro", label: "Macro" },
];


const totalEfectivoContado = () =>
  billeteKeys.reduce((s, key) => {
    const cantidad = Number(billetes[key] || 0);
    const valor = denom[key] || 0;
    return s + cantidad * valor;
  }, 0);




  const totalCuentasBicaMacroContado = () =>
    Number(cuentas.bica || 0) + Number(cuentas.macro || 0);

  /* ========================= Lógica ========================= */

  const abrirCobro = () => {
    setPagosDraft(estado.pagosActuales || { ...estadoVacioPagos });
    setCobroAbierto(true);
  };

  const cancelarCobro = () => setCobroAbierto(false);

  const confirmarCobro = () => {
    const total = calcularTotal();
    const pagos = pagosDraft;
    const totalPagos = sumaPagos(pagos);

    if (totalPagos <= 0) {
      alert("Ingresá al menos un monto en los medios de pago.");
      return;
    }
    if (totalPagos < total) {
      alert("La suma de los medios es menor que el total.");
      return;
    }

    // Vuelto (solo con efectivo)
    const otros =
      (pagos["Débito"] || 0) +
      (pagos["Crédito"] || 0) +
      (pagos["QR"] || 0) +
      (pagos["Cuenta"] || 0);
    const faltaLuegoDeNoEfectivo = Math.max(0, total - otros);
    const efectivo = pagos["Efectivo"] || 0;
    const vuelto = Math.max(0, efectivo - faltaLuegoDeNoEfectivo);

    // 👇 Acá va tu lógica de medios de pago
    const mediosUsados = MEDIOS.filter((m) => (pagos[m] || 0) > 0);
    const medioPagoEtiqueta: MedioPago | "Mixto" =
      mediosUsados.length === 1 ? mediosUsados[0] : "Mixto";
    const { fecha, hora, createdAtISO } = nowParts();
    // Ahora ya podés usar medioPagoEtiqueta cuando armes la venta:
    const ventas: Venta[] = estado.lineas.map((linea) => {
      const producto = productos.find((p) => p.id === linea.productoId);
      const extra = extrasDeltaUnitario(linea.productoId, linea.mods);
      const detalleMods = modsTexto(linea.productoId, linea.mods);
      return {
        fecha,
        hora,
        createdAtISO,
        producto: producto?.nombre ?? "",
        cantidad: linea.qty || 1,
        precio: (producto?.precio ?? 0) + extra,
        numeroVenta: estado.numeroVentaActual,
        mensajeTicket: detalleMods || "",
        lugarConsumo: estado.lugarConsumo,
        medioPago: medioPagoEtiqueta, // 👈 acá lo usás
        productId: linea.productoId,
        mods: { ...linea.mods },
      };
    });

    // Registrar pagos (para cierre de caja)
    const pagosRegistrados: Pago[] = MEDIOS.filter(
      (m) => (pagos[m] || 0) > 0
    ).map((m) => ({
      numeroVenta: estado.numeroVentaActual,
      medio: m,
      monto: pagos[m],
      createdAtISO,
    }));

        if (vuelto > 0) alert(`Vuelto: $${fmtAR(vuelto)}`);

    // 👉 Guardamos info para el recuadro/resumen
  

    // Ticket con desglose
    imprimirTicket(ventas, pagos);


    // Guardar y avanzar; cerrar modal
    // ...dentro de confirmarCobro(), justo antes de setCobroAbierto(false):

    // Guardar y avanzar; cerrar modal
    setEstado((prev) => {
      // 👇 marcamos la comanda como "cobrada" si corresponde
      let nuevasComandas = prev.comandas;
      if (prev.comandaEnProcesoId) {
        nuevasComandas = prev.comandas.map((c) =>
          c.id === prev.comandaEnProcesoId ? { ...c, estado: "cobrada" } : c
        );
      }

      return {
        ...prev,
        ventasAnteriores: [...prev.ventas],
        ventas: [...prev.ventas, ...ventas],
        pagos: [...prev.pagos, ...pagosRegistrados],
        seleccionados: {},
        lineas: [],
        numeroVentaActual: prev.numeroVentaActual + 1,
        mensajeTicket: "",
        montoPagado: totalPagos,
        pagosActuales: { ...estadoVacioPagos },
        comandas: nuevasComandas,
        comandaEnProcesoId: null,
      };
    });

    setCobroAbierto(false);
  };
  const nuevaLinea = (productoId: number): LineaSeleccion => ({
    uid: Math.random().toString(36).slice(2) + Date.now().toString(36),
    productoId,
    mods: {},
    qty: 1, // 👈
  });
  const duplicarLinea = (uid: string) =>
    setEstado((prev) => {
      const src = prev.lineas.find((l) => l.uid === uid);
      if (!src) return prev;

      const clon: LineaSeleccion = {
        uid: Math.random().toString(36).slice(2) + Date.now().toString(36),
        productoId: src.productoId,
        mods: { ...src.mods },
        qty: 1, // siempre arranca en 1
      };

      const lineas = [...prev.lineas, clon];

      const seleccionados = { ...prev.seleccionados };
      seleccionados[src.productoId] = (seleccionados[src.productoId] || 0) + 1;

      return { ...prev, lineas, seleccionados };
    });

  const seleccionarProducto = (id: number) =>
    setEstado((prev) => {
      // buscamos una línea del mismo producto SIN modificadores
      const idx = prev.lineas.findIndex(
        (l) => l.productoId === id && Object.keys(l.mods || {}).length === 0
      );

      let lineas: LineaSeleccion[];
      if (idx !== -1) {
        // si existe, solo subimos qty
        lineas = prev.lineas.map((l, i) =>
          i === idx ? { ...l, qty: (l.qty || 1) + 1 } : l
        );
      } else {
        // si no existe, creamos nueva línea base (qty 1)
        lineas = [...prev.lineas, nuevaLinea(id)];
      }

      const seleccionados = { ...prev.seleccionados };
      seleccionados[id] = (seleccionados[id] || 0) + 1;

      return { ...prev, lineas, seleccionados };
    });

  const eliminarLinea = (uid: string) =>
    setEstado((prev) => {
      const idx = prev.lineas.findIndex((l) => l.uid === uid);
      if (idx === -1) return prev;
      const pid = prev.lineas[idx].productoId;
      const lineas = prev.lineas.slice();
      lineas.splice(idx, 1);

      const seleccionados = { ...prev.seleccionados };
      if ((seleccionados[pid] || 0) > 1) seleccionados[pid]--;
      else delete seleccionados[pid];

      return { ...prev, lineas, seleccionados };
    });

  const eliminarProducto = (id: number) =>
    setEstado((prev) => {
      const seleccionados = { ...prev.seleccionados };
      if (seleccionados[id] > 1) seleccionados[id]--;
      else delete seleccionados[id];
      return { ...prev, seleccionados };
    });
  // 👇 clona profundo una línea (por seguridad)
  const cloneLinea = (ln: LineaSeleccion): LineaSeleccion => ({
    uid: Math.random().toString(36).slice(2) + Date.now().toString(36),
    productoId: ln.productoId,
    mods: { ...(ln.mods || {}) },
    qty: ln.qty || 1,
  });

  // Crea un objeto Comanda a partir de las líneas actuales (sin setear estado)
  const crearComandaActual = (estado: Estado): Comanda => {
    const { fecha, hora, createdAtISO } = nowParts();
    // 👇 Definir alias ANTES del return
    return {
      id:
        crypto.randomUUID?.() ||
        Math.random().toString(36).slice(2) + Date.now().toString(36),
      fecha,
      hora,
      createdAtISO,
      numeroSugerido: estado.numeroVentaActual,
      lineas: estado.lineas.map(cloneLinea),
      estado: "pendiente",
      obs: estado.mensajeTicket || "",
    };
  };

  // Recuenta "seleccionados" a partir de líneas (para que el badge coincida con el carrito)
  const seleccionadosFromLineas = (lineas: LineaSeleccion[]) => {
    const sel: Estado["seleccionados"] = {};
    lineas.forEach((ln) => {
      sel[ln.productoId] = (sel[ln.productoId] || 0) + (ln.qty || 1);
    });
    return sel;
  };

  // Total de una línea (unitario producto + extras) * qty
  const totalLinea = (ln: LineaSeleccion) => {
    const prod = productos.find((p) => p.id === ln.productoId);
    if (!prod) return 0;
    const extra = extrasDeltaUnitario(ln.productoId, ln.mods);
    return (prod.precio + extra) * (ln.qty || 1);
  };

  // Total de una comanda
  const totalComanda = (c: Comanda) =>
    c.lineas.reduce((s, ln) => s + totalLinea(ln), 0);

  const cancelarEdicionComanda = () => {
    setEstado((prev) => ({
      ...prev,
      comandaEnProcesoId: null,
      // si querés limpiar el carrito al cancelar:
      lineas: [],
      seleccionados: {},
      mensajeTicket: "",
      pagosActuales: { ...estadoVacioPagos },
    }));
  };

  // ===== ANULAR =====
const anularVenta = (numeroVenta: number, skipConfirm?: boolean) => {
  if (!skipConfirm && !confirm(`¿Anular la venta N° ${numeroVenta}?`)) return;

  const { createdAtISO } = nowParts();
  setEstado((prev) => {
    if (ventaEstaAnulada(prev.ventas, numeroVenta)) return prev;

    const pagosOriginales = prev.pagos.filter(
      (p) => p.numeroVenta === numeroVenta
    );
    const ajustesNegativos: Pago[] = pagosOriginales.map((p) => ({
      numeroVenta: p.numeroVenta,
      medio: p.medio,
      monto: -Math.abs(p.monto),
      createdAtISO,
    }));

    const ventasMarcadas = prev.ventas.map((v) =>
      v.numeroVenta === numeroVenta ? { ...v, anulada: true } : v
    );

    const ventasDelTicket = prev.ventas.filter(
  (v) => v.numeroVenta === numeroVenta
);

// Armamos nuevasLineas sin nulls, “a mano”
const nuevasLineas: LineaSeleccion[] = [];
ventasDelTicket.forEach((v) => {
  const ln = lineaFromVenta(v);
  if (ln) {
    nuevasLineas.push(ln);
  }
});



    const seleccionados = { ...prev.seleccionados };
    nuevasLineas.forEach((ln) => {
      seleccionados[ln.productoId] =
        (seleccionados[ln.productoId] || 0) + (ln.qty || 1);
    });

    return {
      ...prev,
      ventas: ventasMarcadas,
      pagos: [...prev.pagos, ...ajustesNegativos],
      lineas: nuevasLineas,
      seleccionados,
      mensajeTicket: "",
      pagosActuales: { ...estadoVacioPagos },
    };
  });
};


  // ===== REHACER (solo carga al carrito; NO toca pagos ni marca) =====
  const rehacerVenta = (numeroVenta: number) => {
  setEstado((prev) => {
    const ventasDelTicket = prev.ventas.filter(
  (v) => v.numeroVenta === numeroVenta
);

// Armamos nuevasLineas sin nulls, “a mano”
const nuevasLineas: LineaSeleccion[] = [];
ventasDelTicket.forEach((v) => {
  const ln = lineaFromVenta(v);
  if (ln) {
    nuevasLineas.push(ln);
  }
});


    const seleccionados = { ...prev.seleccionados };
    nuevasLineas.forEach((ln) => {
      seleccionados[ln.productoId] =
        (seleccionados[ln.productoId] || 0) + (ln.qty || 1);
    });

    return {
      ...prev,
      lineas: nuevasLineas,
      seleccionados,
      mensajeTicket: "",
      pagosActuales: { ...estadoVacioPagos },
    };
  });
};

  // --- Resumen por producto ---
  // --- Resumen por producto (excluye anuladas) ---
  const abrirResumenVentas = () => {
  // ⬇️ solo ventas vigentes
  const ventasVigentes = estado.ventas.filter((v) => !v.anulada);

  // Agrupar por producto
  const porProducto = new Map<string, { cantidad: number; total: number }>();
  ventasVigentes.forEach((v) => {
    const it = porProducto.get(v.producto) ?? { cantidad: 0, total: 0 };
    it.cantidad += v.cantidad;
    it.total += v.cantidad * v.precio;
    porProducto.set(v.producto, it);
  });

  const baseProductos = Array.from(porProducto.entries()).map(
    ([producto, it]) => ({ producto, cantidad: it.cantidad, total: it.total })
  );

  // Por lugar de consumo
  const porLugar: Record<string, number> = {};
  ventasVigentes.forEach((v) => {
    const k = v.lugarConsumo ?? "N/D";
    porLugar[k] = (porLugar[k] ?? 0) + v.cantidad * v.precio;
  });
  const baseLugares = Object.entries(porLugar).map(([lugar, total]) => ({
    lugar,
    total,
  }));

  const w = window.open("", "ResumenVentas", "width=420,height=720");
  if (!w) {
    alert(
      "No se pudo abrir la ventana de resumen. Revisá el bloqueador de pop-ups."
    );
    return;
  }
  w.focus();

  // 👇 TRUCO: a partir de acá usamos `win`, que TS ya sabe que es `Window`
  const win = w;

  const nf = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const q = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';

  function render(criterio: "cantidad_desc" | "total_desc" | "nombre_asc") {
    const ps = [...baseProductos];
    if (criterio === "cantidad_desc")
      ps.sort(
        (a, b) =>
          b.cantidad - a.cantidad || a.producto.localeCompare(b.producto)
      );
    if (criterio === "total_desc")
      ps.sort(
        (a, b) => b.total - a.total || a.producto.localeCompare(b.producto)
      );
    if (criterio === "nombre_asc")
      ps.sort((a, b) => a.producto.localeCompare(b.producto));

    const partes: string[] = [];
    partes.push('<html><head><meta charset="utf-8" />');
    partes.push("<title>Resumen por producto</title>");
    partes.push(
      "<style>body{font-family:system-ui,Arial,sans-serif;padding:12px;}h1{font-size:16px;margin:0 0 8px;text-align:center;}h2{font-size:14px;margin:12px 0 6px;display:flex;gap:8px;align-items:center;justify-content:space-between;}table{width:100%;border-collapse:collapse;margin:6px 0;}th,td{border-bottom:1px solid #ddd;padding:4px;}th{text-align:left;}.tot{font-weight:bold;font-size:14px;padding:8px 0;text-align:right;}.muted{color:#555}.actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;}a.btn,button.btn{padding:6px 10px;border:1px solid #333;background:#fff;cursor:pointer;text-decoration:none;color:#111;border-radius:6px;}a.btn:hover,button.btn:hover{background:#f3f3f3}@media print{.actions,.toolbar{display:none}}.toolbar{display:flex;align-items:center;gap:8px}</style></head><body>"
    );
    partes.push("<h1>Resumen por producto</h1>");
    partes.push(
      '<div class="muted">Generado: ' +
        new Date().toLocaleString() +
        "</div>"
    );

    // Header + selector de orden
    partes.push(
      '<h2><span>Por producto</span><div class="toolbar"><label for="orden">Ordenar por:</label><select id="orden"><option value="cantidad_desc"' +
        (criterio === "cantidad_desc" ? " selected" : "") +
        '>Cantidad ↓ (más vendido)</option><option value="total_desc"' +
        (criterio === "total_desc" ? " selected" : "") +
        '>Total ↓</option><option value="nombre_asc"' +
        (criterio === "nombre_asc" ? " selected" : "") +
        ">Producto A→Z</option></select></div></h2>"
    );

    // Tabla por producto
    partes.push(
      '<table><thead><tr><th>Producto</th><th style="text-align:right">Cant.</th><th style="text-align:right">Total</th></tr></thead><tbody id="tbody-productos">'
    );
    if (!ps.length) {
      partes.push('<tr><td colspan="3" class="muted">Sin ventas</td></tr>');
    } else {
      ps.forEach((r) => {
        partes.push(
          "<tr><td>" +
            r.producto +
            '</td><td style="text-align:right">' +
            r.cantidad +
            '</td><td style="text-align:right">$' +
            nf.format(r.total) +
            "</td></tr>"
        );
      });
    }
    partes.push("</tbody></table>");

    // Tabla por lugar
    const lugares = [...baseLugares].sort(
      (a, b) => b.total - a.total || a.lugar.localeCompare(b.lugar)
    );
    partes.push(
      '<h2>Por lugar de consumo</h2><table><thead><tr><th>Lugar</th><th style="text-align:right">Total</th></tr></thead><tbody id="tbody-lugares">'
    );
    if (!lugares.length) {
      partes.push('<tr><td colspan="2" class="muted">Sin ventas</td></tr>');
    } else {
      lugares.forEach((r) => {
        partes.push(
          "<tr><td>" +
            r.lugar +
            '</td><td style="text-align:right">$' +
            nf.format(r.total) +
            "</td></tr>"
        );
      });
    }
    partes.push("</tbody></table>");

    // Total general (solo vigentes)
    const totalGeneral = ps.reduce((s, r) => s + r.total, 0);
    partes.push(
      '<div class="tot" id="total-general">Total general: $' +
        nf.format(totalGeneral) +
        "</div>"
    );

    // CSVs (solo vigentes)
    const headProd = ["Producto", "Cantidad", "Total"].join(";");
    const rowsProd = ps.map((r) =>
      [q(r.producto), q(r.cantidad), q(r.total)].join(";")
    );
    const csvProductos = [
      headProd,
      ...rowsProd,
      "",
      "Total general;;" + q(totalGeneral),
    ].join("\n");
    const urlCSVProductos =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvProductos);

    const headLugar = ["Lugar", "Total"].join(";");
    const rowsLugar = lugares.map((r) =>
      [q(r.lugar), q(r.total)].join(";")
    );
    const csvLugares = [headLugar, ...rowsLugar].join("\n");
    const urlCSVLugar =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvLugares);

    // Acciones
    partes.push('<div class="actions">');
    partes.push(
      '<a class="btn" href="' +
        urlCSVProductos +
        '" download="resumen_por_producto.csv">Descargar CSV (por producto)</a>'
    );
    partes.push(
      '<a class="btn" href="' +
        urlCSVLugar +
        '" download="resumen_por_lugar.csv">Descargar CSV (por lugar)</a>'
    );
    partes.push(
      '<button class="btn" onclick="window.print()">Descargar PDF (Imprimir)</button>'
    );
    partes.push(
      '<button class="btn" onclick="window.close()">Cerrar</button>'
    );
    partes.push("</div>");

    partes.push("</body></html>");

    // 👇 Ahora usamos `win`, que es de tipo `Window`, sin null
    win.document.open();
    win.document.write(partes.join(""));
    win.document.close();

    const sel: any = win.document.getElementById("orden");
    if (sel) {
      sel.onchange = () => {
        win.close();
        render(sel.value);
      };
    }
  }

  render("cantidad_desc");
};

  const abrirResumenPorVenta = () => {
  const ventas = estado.ventas;
  if (!ventas.length) {
    alert("No hay ventas registradas.");
    return;
  }

  // Agrupar TODAS las ventas por número de venta
  const porVenta: Record<number, Venta[]> = {};

  ventas.forEach((v) => {
    if (!porVenta[v.numeroVenta]) {
      porVenta[v.numeroVenta] = [];
    }
    porVenta[v.numeroVenta].push(v);
  });

  // Tipo para cada grupo
  type GrupoVenta = {
    numeroVenta: number;
    items: Venta[];
    subtotal: number;
    anulada: boolean;
  };

  // Ordenar grupos y calcular subtotal + si está anulada
  const grupos: GrupoVenta[] = Object.entries(porVenta)
    .map(([num, items]) => {
      const subtotal = items.reduce(
        (s, it) => s + it.cantidad * it.precio,
        0
      );
      const anulada = items.some((it) => it.anulada);
      return {
        numeroVenta: Number(num),
        items,
        subtotal,
        anulada,
      };
    })
    .sort((a, b) => a.numeroVenta - b.numeroVenta);

  // Totales globales (con y sin anuladas)
  const totalInclAnuladas = grupos.reduce((s, g) => s + g.subtotal, 0);
  const totalSoloVigentes = grupos
    .filter((g) => !g.anulada)
    .reduce((s, g) => s + g.subtotal, 0);

  const nf = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const q = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';

  // CSV
  const head = [
    "Numero de venta",
    "Producto",
    "Cantidad",
    "Precio unitario",
    "Precio total",
    "Medio de pago",
    "Estado",
  ].join(";");
  const rows: string[] = [];
  grupos.forEach((g) => {
    const etiqueta = g.anulada
      ? `${g.numeroVenta} (ANULADA)`
      : String(g.numeroVenta);
    g.items.forEach((it) => {
      const totalLinea = it.cantidad * it.precio;
      rows.push(
        [
          q(etiqueta),
          q(it.producto),
          q(it.cantidad),
          q(it.precio),
          q(totalLinea),
          q(it.medioPago),
          q(g.anulada ? "ANULADA" : "VIGENTE"),
        ].join(";")
      );
    });
    rows.push(
      [
        q("Subtotal N° " + etiqueta),
        "",
        "",
        "",
        q(g.subtotal),
        "",
        "",
      ].join(";")
    );
    rows.push("");
  });
  rows.push(
    [
      q("Total general (solo vigentes)"),
      "",
      "",
      "",
      q(totalSoloVigentes),
      "",
      "",
    ].join(";")
  );
  rows.push(
    [
      q("Total general (incl. anuladas)"),
      "",
      "",
      "",
      q(totalInclAnuladas),
      "",
      "",
    ].join(";")
  );

  const urlCSV =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent([head, ...rows].join("\n"));

  // Popup
  const w = window.open("", "ResumenPorVenta", "width=560,height=720");
  if (!w) {
    alert(
      "No se pudo abrir la ventana de resumen. Revisá el bloqueador de pop-ups."
    );
    return;
  }
  w.focus();
  const win = w; // 👈 truco para que TS sepa que no es null

  const estilos = `
      body{font-family:system-ui,Arial,sans-serif;padding:12px;}
      h1{font-size:16px;margin:0 0 8px;text-align:center;}
      h2{font-size:14px;margin:12px 0 6px;}
      table{width:100%;border-collapse:collapse;margin:6px 0;}
      th,td{border-bottom:1px solid #ddd;padding:6px;}
      th{text-align:left;}
      .muted{color:#555}
      .tot{font-weight:bold}
      .actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;}
      .btn{padding:6px 10px;border:1px solid #333;background:#fff;cursor:pointer;text-decoration:none;color:#111;border-radius:6px;}
      .btn:hover{background:#f3f3f3}
      @media print{.actions{display:none}}
    `;

  const partes: string[] = [];
  partes.push('<html><head><meta charset="utf-8"/>');
  partes.push("<title>Resumen por venta</title>");
  partes.push(`<style>${estilos}</style></head><body>`);
  partes.push("<h1>Resumen por venta</h1>");
  partes.push(
    '<div class="muted">Generado: ' + new Date().toLocaleString() + "</div>"
  );

  partes.push(
    "<table><thead><tr>" +
      '<th style="text-align:center;width:110px;">N° Venta</th>' +
      "<th>Producto</th>" +
      '<th style="text-align:right;width:80px;">Cant.</th>' +
      '<th style="text-align:right;width:100px;">Precio unit.</th>' +
      '<th style="text-align:right;width:110px;">Precio total</th>' +
      '<th style="text-align:left;width:110px;">Medio</th>' +
      '<th style="text-align:left;width:90px;">Estado</th>' +
      "</tr></thead><tbody>"
  );

  if (!grupos.length) {
    partes.push(
      '<tr><td colspan="7" style="text-align:center;color:#555;">Sin ventas</td></tr>'
    );
  } else {
    grupos.forEach((g) => {
      // cabecera del grupo
      partes.push(
        `<tr><td colspan="7" style="padding-top:10px;font-weight:bold;background:#f6f6f6;">Venta N° ${g.numeroVenta}` +
          (g.anulada ? ' <span style="color:red">(ANULADA)</span>' : "") +
          "</td></tr>"
      );

      // líneas
      g.items.forEach((it) => {
        const totalLinea = it.cantidad * it.precio;
        partes.push("<tr>");
        partes.push(`<td style="text-align:center">${g.numeroVenta}</td>`);
        partes.push(`<td>${it.producto}</td>`);
        partes.push(`<td style="text-align:right">${it.cantidad}</td>`);
        partes.push(
          `<td style="text-align:right">$${nf.format(it.precio)}</td>`
        );
        partes.push(
          `<td style="text-align:right">$${nf.format(totalLinea)}</td>`
        );
        partes.push(`<td>${it.medioPago}</td>`);
        partes.push(`<td>${g.anulada ? "ANULADA" : "VIGENTE"}</td>`);
        partes.push("</tr>");
      });

      // subtotal
      partes.push(
        `<tr><td colspan="5" style="text-align:right;font-weight:bold;">SUBTOTAL Venta N° ${g.numeroVenta}</td>` +
          `<td style="text-align:left;font-weight:bold;">$${nf.format(
            g.subtotal
          )}</td>` +
          `<td></td></tr>`
      );

      // separador
      partes.push(
        '<tr><td colspan="7" style="border-bottom:2px solid #000;"></td></tr>'
      );
    });
  }

  // Totales globales al final
  partes.push(
    `<tr><td colspan="5" font-bold style="text-align:right;color:#555;">Total general</td>` +
      `<td style="text-align:left;color:#555;">$${nf.format(
        totalSoloVigentes
      )}</td><td></td></tr>`
  );
  partes.push(
    `<tr><td colspan="5" style="text-align:right;color:#555;">Total incluyendo anuladas</td>` +
      `<td style="text-align:left;color:#555;">$${nf.format(
        totalInclAnuladas
      )}</td><td></td></tr>`
  );

  partes.push("</tbody></table>");

  partes.push(
    '<div class="actions">' +
      `<a class="btn" href="${urlCSV}" download="resumen_por_venta.csv">Descargar CSV</a>` +
      '<button class="btn" onclick="window.print()">Descargar PDF (Imprimir)</button>' +
      '<button class="btn" onclick="window.close()">Cerrar</button>' +
      "</div>"
  );

  partes.push("</body></html>");

  win.document.open();
  win.document.write(partes.join(""));
  win.document.close();
};

  const limpiarSeleccion = () =>
    setEstado((prev) => ({
      ...prev,
      seleccionados: {}, // antes
      lineas: [], // 👈 clave: vaciamos las líneas del carrito
      modificadores: {}, // 👈 por si quedó algo marcado
      mensajeTicket: "",
      pagosActuales: { ...estadoVacioPagos },
    }));

  const calcularTotal = () => {
    return estado.lineas.reduce((total, linea) => {
      const prod = productos.find((p) => p.id === linea.productoId);
      if (!prod) return total;
      const extra = extrasDeltaUnitario(linea.productoId, linea.mods);
      const unit = prod.precio + extra;
      return total + unit * (linea.qty || 1); // 👈 qty
    }, 0);
  };

  const imprimirTicket = (
    ventas: Venta[],
    pagos?: Record<MedioPago, number>
  ) => {
    const { fecha } = nowParts();
    // en vez de new Date().toISOString().split("T")[0]
    const ventana = window.open("", "Ticket", "width=300,height=500");
    if (!ventana) {
      alert(
        "No se pudo abrir la ventana de impresión. Revisá el bloqueador de pop-ups."
      );
      return;
    }

    const partes: string[] = [];
    partes.push('<div class="ticket">');
    partes.push(
      '<p style="font-weight:bold; font-size:16px; margin:0; text-align:center;">Carribar San Jorge</p>'
    );
    partes.push(
      '<p style="font-weight:bold; font-size:12px; margin:0; text-align:center;">Fecha: ' +
        fecha +
        "</p>"
    );
    partes.push(
      '<p style="font-weight:bold; font-size:12px; margin:0; text-align:center;">N° Ticket: ' +
        estado.numeroVentaActual +
        "</p>"
    );
    partes.push(
      '<div style="border-top:1px dashed #000; margin:4px 0 0 0;"></div>'
    );

    ventas.forEach((v) => {
      const subtotal = v.precio * v.cantidad;

      // Línea del producto (FILA FLEX)
      partes.push(
        '<div style="display:flex; align-items:center; font-size:14px; font-weight:bold; margin:0;">' +
          '<span style="width:10%; text-align:center;">' +
          v.cantidad +
          "x</span>" +
          '<span style="width:60%; text-align:center;">' +
          v.producto +
          "</span>" +
          '<span style="width:30%; text-align:center;">$' +
          fmtAR(subtotal) +
          "</span>" +
          "</div>"
      );

      // 🔽 Modificadores (BLOQUE PROPIO, NO FLEX) — DEBAJO de la línea
      if (v.mensajeTicket) {
        partes.push(
          '<div style="font-size:10px; text-align:left; margin:0 0 2px 0; padding-left:2px;">' +
            "&gt; " +
            v.mensajeTicket +
            "</div>"
        );
      }

      // Separador
      partes.push(
        '<div style="border-bottom:1px dotted #000; margin:2px 0;"></div>'
      );
    });

    partes.push(
      '<div style="border-top:1px dashed #000; margin:4px 0;"></div>'
    );
    partes.push(
      '<p style="font-weight:bold; font-size:14px; margin:0;">Obs: ' +
        (estado.mensajeTicket || "") +
        "</p>"
    );
    partes.push(
      '<p style="font-weight:bold; font-size:14px; margin:0; text-align:left;">Lugar consumo: ' +
        estado.lugarConsumo +
        "</p>"
    );

    if (pagos) {
      const items = MEDIOS.filter((m) => (pagos[m] || 0) > 0);
      if (items.length) {
        partes.push(
          '<div style="border-top:1px dashed #000; margin:4px 0;"></div>'
        );
        partes.push(
          '<p style="font-weight:bold; font-size:10px; margin:0; text-align:left;">Pagos:</p>'
        );
        items.forEach((m) => {
          partes.push(
            '<div style="display:flex; justify-content:space-between; font-size:10px;">' +
              `<span>${m}</span><span>$${fmtAR(pagos[m])}</span>` +
              "</div>"
          );
        });
      }
    }

    partes.push(
      '<p style="font-weight:bold; font-size:16px; margin:4px 0 0 0; text-align:center; border:2px solid #000; padding:4px;">'
    );
    partes.push("  Total: $" + fmtAR(totalVentas(ventas)));
    partes.push("</p>");
    partes.push("</div>");

    ventana.document.write(partes.join(""));
    ventana.document.close();
    ventana.print();
    ventana.close();
  };

  // ====== IMPRIMIR COMANDA (con qty por línea) ======
  // ====== IMPRIMIR COMANDA (con qty por línea) ======
  const imprimirComanda = () => {
    if (estado.lineas.length === 0) {
      alert("No hay productos seleccionados.");
      return;
    }

    // 1) ABRIR POPUP INMEDIATAMENTE (por el gesto del usuario)
    //    Esto evita que el bloqueador lo considere "no iniciado por el usuario".
    const popup = window.open("", "Comanda", "width=300,height=500");
    if (!popup) {
      alert(
        "No se pudo abrir la ventana de impresión. Revisá el bloqueador de pop-ups."
      );
      return;
    }

    // 2) Ahora sí, guardar la comanda pendiente
    const comanda = crearComandaActual(estado);
    setEstado((prev) => ({
      ...prev,
      comandas: [...prev.comandas, comanda],
    }));

    // 3) Construir el HTML (igual que antes)
    const { fecha } = nowParts();
    const partes: string[] = [];
    partes.push("<html><head><meta charset='utf-8'/>");
    partes.push(`
    <style>
      @media print { @page { size: 80mm auto; margin: 2mm; } .ticket { width: 72mm; } }
      body { font-family: system-ui, Arial, sans-serif; }
    </style>
  `);
    partes.push("</head><body>");
    partes.push('<div class="ticket">');
    partes.push(
      '<p style="font-weight:bold; font-size:16px; margin:0; text-align:center;">Carribar San Jorge</p>'
    );
    partes.push(
      '<p style="font-weight:bold; font-size:12px; margin:0;text-align:center;">Fecha: ' +
        fecha +
        "</p>"
    );
    partes.push(
      '<div style="border-top:1px dashed #000; margin:4px 0 0 0;"></div>'
    );

    estado.lineas.forEach((linea) => {
      const producto = productos.find((p) => p.id === linea.productoId);
      if (!producto) return;
      const q = linea.qty || 1;

      partes.push(
        '<div style="display:flex; align-items:center; font-size:16px; font-weight:bold; margin:0;">' +
          `<span style="width:10%; text-align:center;">${q}x</span>` +
          '<span style="width:90%; text-align:center;">' +
          producto.nombre +
          "</span>" +
          "</div>"
      );

      const detalleMods = modsTexto(linea.productoId, linea.mods);
      if (detalleMods) {
        partes.push(
          '<div style="font-size:12px; text-align:left; margin:0 0 2px 0; padding-left:2px;">' +
            "&gt; " +
            detalleMods +
            "</div>"
        );
      }
      partes.push(
        '<div style="border-bottom:1px dotted #000; margin:2px 0;"></div>'
      );
    });

    partes.push(
      '<div style="border-top:1px dashed #000; margin:4px 0;"></div>'
    );
    partes.push(
      '<p style="font-weight:bold; font-size:14px; margin:0;">Obs: ' +
        (estado.mensajeTicket || "") +
        "</p>"
    );
    partes.push(
      '<p style="font-weight:bold; font-size:14px; margin:0; text-align:left;">Lugar consumo: ' +
        estado.lugarConsumo +
        "</p>"
    );
    partes.push("</div></body></html>");

    // 4) Escribir y luego imprimir con un pequeño delay (Chrome suele necesitarlo)
    popup.document.open();
    popup.document.write(partes.join(""));
    popup.document.close();

    // En algunos navegadores, imprimir inmediatamente después de write() no funciona.
    // Pequeño delay para asegurar que el contenido ya esté renderizado.
    setTimeout(() => {
      try {
        popup.focus();
        popup.print();
        popup.close();
      } catch {
        // Fallback súper básico: si print falla, al menos dejamos la ventana abierta.
        popup.focus();
      }
    }, 50);

    // 5) Limpiar carrito (igual que antes)
    setEstado((prev) => ({
      ...prev,
      seleccionados: {},
      lineas: [],
      modificadores: {},
      mensajeTicket: "",
      pagosActuales: { ...estadoVacioPagos },
    }));
  };
  // Abre modal de comandas
  const [comandasAbierto, setComandasAbierto] = useState(false);
  const [buscaComanda, setBuscaComanda] = useState("");

  const abrirComandas = () => setComandasAbierto(true);
  const cerrarComandas = () => setComandasAbierto(false);

  // Cargar comanda al carrito (sin cobrar todavía)
  const cargarComanda = (id: string) => {
    setEstado((prev) => {
      const c = prev.comandas.find((x) => x.id === id);
      if (!c) return prev;
      const lineas = c.lineas.map(cloneLinea); // nuevo uid
      return {
        ...prev,
        lineas,
        seleccionados: seleccionadosFromLineas(lineas),
        comandaEnProcesoId: id,
        // limpiá pagos/obs previos para evitar arrastre
        mensajeTicket: c.obs || "",
        pagosActuales: { ...estadoVacioPagos },
      };
    });
    setComandasAbierto(false);
  };

  // Confirmar directo: carga y abre el modal de cobro
  const confirmarComanda = (id: string) => {
    cargarComanda(id);
    // abrimos cobro enseguida (pequeño delay por setState)
    setTimeout(() => abrirCobro(), 0);
  };

  // Eliminar/anular comanda pendiente
  const eliminarComanda = (id: string) => {
    setEstado((prev) => ({
      ...prev,
      comandas: prev.comandas.filter((c) => c.id !== id),
      // por si estaba en proceso
      comandaEnProcesoId:
        prev.comandaEnProcesoId === id ? null : prev.comandaEnProcesoId,
    }));
  };

  // ¿La venta N° X está anulada?
  const ventaEstaAnulada = (vs: Venta[], numero: number) =>
    vs.some((v) => v.numeroVenta === numero && v.anulada);

  // Crea LineaSeleccion desde una Venta (respetando qty/mods)
  const lineaFromVenta = (v: Venta): LineaSeleccion | null => {
    const prodId =
      v.productId ?? productos.find((p) => p.nombre === v.producto)?.id ?? null;
    if (!prodId) return null;
    return {
      uid: Math.random().toString(36).slice(2) + Date.now().toString(36),
      productoId: prodId,
      mods: { ...(v.mods || {}) },
      qty: v.cantidad || 1,
    };
  };
  const guardarCambiosEnComanda = () => {
    setEstado((prev) => {
      const id = prev.comandaEnProcesoId;
      if (!id) return prev;

      const existe = prev.comandas.find((c) => c.id === id);
      if (!existe) return prev;

      const lineasActualizadas = prev.lineas.map(cloneLinea); // mantener uids nuevos
      return {
        ...prev,
        comandas: prev.comandas.map((c) =>
          c.id === id
            ? {
                ...c,
                lineas: lineasActualizadas,
                obs: prev.mensajeTicket || "", // usa el campo "Aclaraciones"
              }
            : c
        ),
      };
    });
  };

  const confirmarVenta = () => {
    if (estado.lineas.length === 0) {
      // antes mirabas seleccionados
      alert("No se puede confirmar la venta. No hay productos seleccionados.");
      return;
    }
    abrirCobro();
  };
// Formatea ISO → DD.MM.YYYY HH:MM
const fmtFecha = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
};


  const abrirCierreConConteo = () => {
    // Encontrar primera y última venta NO anulada
const ventasVigentes = estado.ventas.filter((v) => !v.anulada);

if (ventasVigentes.length === 0) {
  alert("No hay ventas confirmadas.");
  return;
}

const primera = ventasVigentes[0];
const ultima = ventasVigentes[ventasVigentes.length - 1];

// función para formatear fecha al estilo DD.MM.YYYY HH:MM
const fmtFecha = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
};

const desdeISO = primera.createdAtISO;
const hastaISO = ultima.createdAtISO;


    // Pagos dentro del período
    const pagosPeriodo = estado.pagos.filter((p) => p.createdAtISO > desdeISO);

    // Conjunto de tickets anulados
    const anuladas = new Set(
      estado.ventas.filter((v) => v.anulada).map((v) => v.numeroVenta)
    );

    // ⬇️ Solo pagos de ventas vigentes (excluye anuladas)
    const pagosVigentes = pagosPeriodo.filter(
      (p) => !anuladas.has(p.numeroVenta)
    );

    if (pagosVigentes.length === 0) {
      alert("No hay pagos de ventas vigentes desde el último cierre.");
      return;
    }

    // Totales por medio solo con vigentes
    const totalesPorMedio: Record<MedioPago, number> = {
      Efectivo: 0,
      Débito: 0,
      Crédito: 0,
      QR: 0,
      Cuenta: 0,
    };
    pagosVigentes.forEach((p) => {
      totalesPorMedio[p.medio] += p.monto;
    });

    const totalGeneral = pagosVigentes.reduce((s, p) => s + p.monto, 0);
    const cantidadVentas = new Set(pagosVigentes.map((p) => p.numeroVenta))
      .size;

    setResumenCorte({
      desdeISO,
      hastaISO: new Date().toISOString(),
      cantidadVentas,
      totalesPorMedio,
      totalGeneral,
    });

    // inicializo campos en blanco
    setBilletes({
      b100: "",
      b200: "",
      b500: "",
      b1000: "",
      b2000: "",
      b10000: "",
      b20000: "",
    });
    setCuentas({ bica: "", mp: "", macro: "" });
    setCierreAbierto(true);
  };

  const confirmarCierreConConteo = () => {
    if (!resumenCorte) {
      setCierreAbierto(false);
      return;
    }

    const nf = new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // diferencias por medio (se calculan pero no se muestran como principal)
    const esperadoEfvo = resumenCorte.totalesPorMedio["Efectivo"];
    const contadoEfvo = totalEfectivoContado();

    const esperadoMP = resumenCorte.totalesPorMedio["QR"]; // asumimos MP ~ QR
    const contadoMP = Number(cuentas.mp || 0);

    const esperadoCuenta = resumenCorte.totalesPorMedio["Cuenta"];
    const contadoCuenta = totalCuentasBicaMacroContado();

    // === NUEVO: sumatoria total contada y comparación global ===
    const contadoTotal = contadoEfvo + contadoMP + contadoCuenta;
    const esperadoTotal = resumenCorte.totalGeneral;
    const difTotal = contadoTotal - esperadoTotal;

    // Popup imprimible
    const w = window.open("", "CierreCaja", "width=460,height=720");
    if (!w) {
      alert("Bloqueador de pop-ups.");
      return;
    }

    const estilos = `
      body{font-family:system-ui,Arial,sans-serif;padding:12px;}
      h1{font-size:16px;margin:0 0 8px;text-align:center;}
      h2{font-size:14px;margin:12px 0 6px;}
      table{width:100%;border-collapse:collapse;margin:6px 0;}
      th,td{border-bottom:1px solid #ddd;padding:6px;}
      th{text-align:left;}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
      .muted{color:#555}
      .ok{color:#166534;font-weight:bold}
      .bad{color:#991b1b;font-weight:bold}
      .actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;}
      .btn{padding:6px 10px;border:1px solid #333;background:#fff;cursor:pointer;text-decoration:none;color:#111;border-radius:6px;}
      .btn:hover{background:#f3f3f3}
      @media print{.actions{display:none}}
    `;

    const clase = (n: number) => (n === 0 ? "ok" : "bad");

    const partes: string[] = [];
    partes.push(
      '<html><head><meta charset="utf-8"/><title>Cierre de caja</title>'
    );
    partes.push(`<style>${estilos}</style></head><body>`);
    partes.push("<h1>Cierre de caja</h1>");
    partes.push(`<div>Desde: ${resumenCorte.desdeISO}</div>`);
    partes.push(`<div>Hasta: ${resumenCorte.hastaISO}</div>`);
    partes.push(`<div>Tickets incluidos: ${resumenCorte.cantidadVentas}</div>`);

    // Totales sistema por medio (informativo)
        partes.push("<h2>Totales del sistema</h2>");
    partes.push(
      '<table><thead><tr><th>Medio</th><th style="text-align:right">Total</th></tr></thead><tbody>'
    );

    const mediosResumen: MedioPago[] = ["Efectivo", "Débito", "Crédito", "QR", "Cuenta"];

    mediosResumen.forEach((mp) => {
      partes.push(
        `<tr><td>${mp}</td><td style="text-align:right">$${nf.format(
          resumenCorte.totalesPorMedio[mp] ?? 0
        )}</td></tr>`
      );
    });

    partes.push(
      `<tr><td style="font-weight:bold">Total general</td><td style="text-align:right;font-weight:bold">$${nf.format(
        resumenCorte.totalGeneral
      )}</td></tr>`
    );
    partes.push("</tbody></table>");

    // Conteo realizado (informativo)
    partes.push("<h2>Conteo realizado</h2>");
    partes.push('<div class="grid">');
    partes.push(
      `<div>Efectivo contado</div><div style="text-align:right">$${nf.format(
        contadoEfvo
      )}</div>`
    );
    partes.push(
      `<div>MP (contado)</div><div style="text-align:right">$${nf.format(
        contadoMP
      )}</div>`
    );
    partes.push(
      `<div>Bica + Macro (contado)</div><div style="text-align:right">$${nf.format(
        contadoCuenta
      )}</div>`
    );
    partes.push("</div>");

    // ==== NUEVO: Resumen global único ====
    partes.push("<h2>Resumen</h2>");
    partes.push("<table><tbody>");
    partes.push(
      `<tr><td>Total del sistema</td><td style="text-align:right">$${nf.format(
        esperadoTotal
      )}</td></tr>`
    );
    partes.push(
      `<tr><td>Total contado (Efvo + MP + Cuentas)</td><td style="text-align:right">$${nf.format(
        contadoTotal
      )}</td></tr>`
    );
    partes.push(
      `<tr><td><b>Diferencia (contado - sistema)</b></td><td class="${clase(
        difTotal
      )}" style="text-align:right"><b>$${nf.format(difTotal)}</b></td></tr>`
    );
    partes.push("</tbody></table>");

    partes.push('<div class="actions">');
    partes.push(
      '<button class="btn" onclick="window.print()">Imprimir / PDF</button>'
    );
    partes.push('<button class="btn" onclick="window.close()">Cerrar</button>');
    partes.push("</div>");
    partes.push("</body></html>");

    w.document.write(partes.join(""));
    w.document.close();
    w.focus();

    // Guardar cierre e iniciar nuevo período
    const cierre: CierreCaja = {
      id: resumenCorte.hastaISO,
      desdeISO: resumenCorte.desdeISO,
      hastaISO: resumenCorte.hastaISO,
      totalesPorMedio: resumenCorte.totalesPorMedio,
      totalGeneral: resumenCorte.totalGeneral,
      cantidadVentas: resumenCorte.cantidadVentas,
    };

    setEstado((prev) => ({
      ...prev,
      cierresCaja: [...prev.cierresCaja, cierre],
      ultimoCierreISO: resumenCorte.hastaISO,
    }));

    setCierreAbierto(false);
    setResumenCorte(null);
  };

  const descargarRegistro = () => {
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "numeroVenta",
      "fecha",
      "hora",
      "createdAtISO",
      "producto",
      "cantidad",
      "precio",
      "obs",
      "lugarConsumo",
      "medioPago",
    ].join(";");

    const rows = estado.ventas.map((v) =>
      [
        q(v.numeroVenta),
        q(v.fecha),
        q(v.hora),
        q(v.createdAtISO),
        q(v.producto),
        q(v.cantidad),
        q(v.precio),
        q(v.mensajeTicket ?? ""),
        q(v.lugarConsumo),
        q(v.medioPago),
      ].join(";")
    );

    const csv = [header, ...rows].join("\n");
    const a = document.createElement("a");
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.target = "_blank";
    a.download = "registro_ventas.csv";
    a.click();
  };
  const getModDefs = (productoId: number): ModificadorDef[] =>
    MODS_POR_PRODUCTO[productoId] || [];

  const getModsState = (
    modificadores: Estado["modificadores"],
    productoId: number
  ) => modificadores[productoId] || {};

  const extrasDeltaUnitario = (
    productoId: number,
    modsState: Partial<Record<ModificadorKey, boolean>>
  ) => {
    const defs = getModDefs(productoId);
    return defs.reduce(
      (s, d) => s + ((modsState[d.key] ? d.delta : 0) || 0),
      0
    );
  };

  const modsTexto = (
    productoId: number,
    modsState: Partial<Record<ModificadorKey, boolean>>
  ) => {
    const defs = getModDefs(productoId);
    return defs
      .filter((d) => !!modsState[d.key])
      .map((d) => (d.delta > 0 ? `${d.label} (+$${fmtAR(d.delta)})` : d.label))
      .join(" | ");
  };

  const borrarRegistro = () => {
    localStorage.removeItem("estado");
    setEstado(initialState);
  };

  const reiniciarRegistro = () => {
    const confirmacion = confirm("¿Estás seguro de reiniciar el registro?");
    if (confirmacion) borrarRegistro();
  };

  /* ========================= UI ========================= */
  // Titulo en pantalla
  return (
    <>
      <div>
       <h1 className="titulo">CARRIBAR SAN JORGE</h1>

{mostrarGestion && (
  <div
    style={{
      fontFamily: "Montserrat, sans-serif",
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 10,
    }}
    onClick={() => setMostrarGestion(false)} // clic afuera cierra
  >
    <div
      onClick={(e) => e.stopPropagation()} // evita cerrar al hacer clic adentro
      style={{
        background: "white",
        width: "100%",
        maxWidth: "800px", // MODAL ANCHO
        borderRadius: "10px",
        border: "1px solid #26608e",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <h3
        style={{
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 12,
          color: "#26608e",
        }}
      >
        Gestión de Productos
      </h3>

      {/* Aquí dentro renderizamos el componente */}
      <GestionProductos
        productos={productosGestion}
        setProductos={setProductosGestion}
      />

      {/* Botón cerrar */}
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <button
          className="btn-base btn-secundario"
          onClick={() => setMostrarGestion(false)}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}



        <p className="venta-numero">
  Venta N° {estado.numeroVentaActual}
</p>

{/* === GRILLA DE PRODUCTOS SIN TAILWIND (estilo original) === */}
<div className="productos-wrapper"></div>
<div className="productos-grid">
  {productos.map((producto) => (
    <button
      key={producto.id}
      className="producto-btn"
      onClick={() => seleccionarProducto(producto.id)}
    >
      <div className="producto-nombre">{producto.nombre}</div>
      <div className="producto-precio">
        ${fmtAR(producto.precio)}
      </div>
    </button>
  ))}
</div>



<h2 className="subtitulo alto-unico">
  Productos seleccionados
</h2>


<ul className="list-none lista">
  {estado.lineas.length === 0 ? (
    <li className="text-center text-gray-500">
      No hay productos agregados.
    </li>
  ) : (
    estado.lineas.map((linea) => {
      const prod = productos.find((p) => p.id === linea.productoId);
      const defs = getModDefs(linea.productoId);
      const extraUnit = extrasDeltaUnitario(linea.productoId, linea.mods);
const precioUnit = prod ? prod.precio + extraUnit : 0;
const precioTotal = precioUnit * (linea.qty || 1);

      return (
       <li key={linea.uid} className="item-linea">
  {/* IZQUIERDA: texto + extra */}
  <div className="item-linea-texto">
  <span className="font-medium">
    {prod?.nombre}: {linea.qty || 1}{" "}
    {(linea.qty || 1) === 1 ? "Unidad" : "Unidades"}
  </span>

  {/* Precio unitario */}
  <span className="precio-unit">
    — ${fmtAR(precioUnit)} c/u
  </span>

  {/* Precio total (SIEMPRE visible) */}
  <span className="precio-total">
    — Total: ${fmtAR(precioTotal)}
  </span>
</div>



  {/* DERECHA: botones */}
  <div className="item-linea-botones">
    <button
      className="boton-duplicar"
      onClick={() => duplicarLinea(linea.uid)}
      title="Sumar 1 a esta línea"
    >
      Duplicar
    </button>

    <button
      className="boton-eliminar"
      onClick={() => eliminarLinea(linea.uid)}
      title="Quitar toda la línea"
    >
      Eliminar
    </button>
  </div>

  {/* FILA DE ABAJO: modificadores */}
  {defs.length > 0 && (
    <div className="item-linea-mods">
      {defs.map((d) => (
        <label key={d.key} className="mod-label">
          <input
            type="checkbox"
            checked={!!linea.mods[d.key]}
            onChange={(e) =>
              setEstado((prev) => {
                const lineas = prev.lineas.map((ln) =>
                  ln.uid === linea.uid
                    ? {
                        ...ln,
                        mods: {
                          ...ln.mods,
                          [d.key]: e.target.checked,
                        },
                      }
                    : ln
                );
                return { ...prev, lineas };
              })
            }
          />
          <span>
  {d.label}
  {d.delta !== 0 && (
    <span className={d.delta > 0 ? "mod-plus" : "mod-minus"}>
      ({d.delta > 0 ? "+" : "-"}${fmtAR(Math.abs(d.delta))})
    </span>
  )}
</span>
        </label>
      ))}
    </div>
  )}
</li>
      );
    })
  )}
</ul>

        <p className="total-precio alto-unico">
  Total: ${fmtAR(calcularTotal())}
</p>

<div className="consumo-y-aclaraciones alto-unico">
  {/* IZQUIERDA: Lugar de consumo */}
  <div className="consumo-opciones">
    <span className="label-consumo">Lugar de consumo:</span>

    <label className="consumo-item">
      <input
        type="radio"
        name="lugarConsumo"
        value="Aca"
        checked={estado.lugarConsumo === "Aca"}
        onChange={() =>
          setEstado((prev) => ({ ...prev, lugarConsumo: "Aca" }))
        }
      />
      Aca
    </label>

    <label className="consumo-item">
      <input
        type="radio"
        name="lugarConsumo"
        value="Delivery"
        checked={estado.lugarConsumo === "Delivery"}
        onChange={() =>
          setEstado((prev) => ({ ...prev, lugarConsumo: "Delivery" }))
        }
      />
      Delivery
    </label>

    <label className="consumo-item">
      <input
        type="radio"
        name="lugarConsumo"
        value="Retira"
        checked={estado.lugarConsumo === "Retira"}
        onChange={() =>
          setEstado((prev) => ({ ...prev, lugarConsumo: "Retira" }))
        }
      />
      Retira
    </label>
  </div>

  {/* DERECHA: Aclaraciones */}
  <input
    type="text"
    placeholder="Aclaraciones del pedido (opcional)"
    value={estado.mensajeTicket}
    onChange={(e) =>
      setEstado((prev) => ({ ...prev, mensajeTicket: e.target.value }))
    }
    className="aclaraciones-input"
  />
</div>

        {/* Acciones principales */}
      {/* Fila superior: 3 botones centrados */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
    marginBottom: "16px",
    width: "100%",
  }}
>
  <button
    className="btn-base btn-comanda"
    onClick={imprimirComanda}
  >
    Crear Comanda
  </button>

  <button
    className="btn-base btn-confirmar"
    onClick={confirmarVenta}
  >
    Confirmar Venta
  </button>

  <button
    className="btn-base btn-duplicar"
    onClick={abrirComandas}
  >
    Comandas pendientes (
    {estado.comandas.filter((c) => c.estado === "pendiente").length})
  </button>
</div>

{/* Acciones secundarias (incluye Limpiar) */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    marginTop: "8px",
  }}
>
  <button
    className="btn-base btn-secundario"
    onClick={limpiarSeleccion}
  >
    Limpiar
  </button>

  {estado.comandaEnProcesoId && (
    <div className="mt-2 p-2 border rounded bg-yellow-50 text-sm flex items-center gap-2">
      {/* tu texto y botones de edición de comanda */}
      ...
    </div>
  )}
<button
  className="btn-base btn-secundario"
  onClick={() => setMostrarGestion(true)}
>
  Gestión de Productos
</button>

  <button
    className="btn-base btn-secundario"
    onClick={descargarRegistro}
  >
    Descargar Registro
  </button>

  <button
    className="btn-base btn-secundario"
    onClick={reiniciarRegistro}
  >
    Reiniciar Registro
  </button>

  <button
    className="btn-base btn-secundario"
    onClick={abrirResumenVentas}
  >
    Resumen por producto
  </button>

  <button
    className="btn-base btn-secundario"
    onClick={abrirResumenPorVenta}
  >
    Resumen por venta
  </button>

  <button
    className="btn-base btn-secundario"
    onClick={abrirCierreConConteo}
  >
    Cierre de caja
  </button>
</div>


        {comandasAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={cerrarComandas}
            />
            <div className="relative z-10 w-[95%] max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-center">Comandas</h3>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar por fecha (DD-MM-YYYY) o nro sugerido..."
                  value={buscaComanda}
                  onChange={(e) => setBuscaComanda(e.target.value)}
                  className="flex-1 border rounded p-2"
                />
                <button
                  className="px-3 py-2 rounded-md border"
                  onClick={() => setBuscaComanda("")}
                >
                  Limpiar
                </button>
              </div>

              <div className="mt-3 max-h-[60vh] overflow-auto divide-y">
                {estado.comandas
                  .filter((c) => {
                    if (c.estado === "anulada") return false;
                    if (!buscaComanda) return true;
                    const q = buscaComanda.trim().toLowerCase();
                    return (
                      c.fecha.toLowerCase().includes(q) ||
                      String(c.numeroSugerido).includes(q)
                    );
                  })
                  .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))
                  .map((c) => {
                    const total = totalComanda(c);
                    return (
                      <div key={c.id} className="py-3">
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <div className="font-semibold">
                              {c.estado === "pendiente"
                                ? "🟡 Pendiente"
                                : "🟢 Cobrada"}
                            </div>
                            <div className="text-gray-600">
                              {c.alias && (
                                <div className="text-gray-900 font-bold">
                                  {c.alias}
                                </div>
                              )}
                              {c.fecha} {c.hora} — sugerida N°{" "}
                              {c.numeroSugerido}
                            </div>
                            <div className="text-gray-600">
                              Ítems:{" "}
                              {c.lineas.reduce((s, ln) => s + (ln.qty || 1), 0)}{" "}
                              — Total aprox: ${fmtAR(total)}
                            </div>
                            {c.obs && ( // 👈 NUEVO bloque
                              <div className="text-gray-700">
                                <b>Obs:</b> {c.obs}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {c.estado === "pendiente" && (
                              <>
                                <button
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded"
                                  onClick={() => cargarComanda(c.id)}
                                  title="Cargar al carrito"
                                >
                                  Cargar
                                </button>
                                <button
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded"
                                  onClick={() => confirmarComanda(c.id)}
                                  title="Cargar y cobrar"
                                >
                                  Confirmar
                                </button>
                              </>
                            )}
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded"
                              onClick={() => eliminarComanda(c.id)}
                              title="Eliminar"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        {/* Mini detalle */}
                        <ul className="mt-2 text-xs text-gray-700 list-disc pl-5">
                          {c.lineas.slice(0, 4).map((ln) => {
                            const p = productos.find(
                              (pp) => pp.id === ln.productoId
                            );
                            return (
                              <li key={ln.uid}>
                                {ln.qty || 1}×{" "}
                                {p?.nombre ?? "Prod " + ln.productoId}
                              </li>
                            );
                          })}
                          {c.lineas.length > 4 && (
                            <li>… y {c.lineas.length - 4} más</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  className="px-3 py-2 rounded-md border"
                  onClick={cerrarComandas}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========= MODAL COBRO ========= */}
{cobroAbierto && (
  <div
    style={{
      fontFamily: "Montserrat, sans-serif",
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 10,
    }}
    onClick={cancelarCobro} /* clic afuera cierra */
  >
    <div
      onClick={(e) => e.stopPropagation()} /* evita que cierre al clicar adentro */
      style={{
        fontFamily: "Montserrat, sans-serif",
        background: "white",
        width: "100%",
        maxWidth: "420px",
        borderRadius: "10px",
        border: "1px solid #d90f0fff",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
        Cobro de la venta
      </h3>

      <div
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 18,
          color: "#ff2727",
          textAlign: "center",
          marginTop: 4,
          marginBottom: 8,
        }}
      >
        TOTAL A COBRAR: <b>${fmtAR(calcularTotal())}</b>
      </div>

      <div style={{ marginTop: 8 }}>
        {MEDIOS.map((m) => (
          <div
            key={m}
            style={{
              fontFamily: "Montserrat, sans-serif",
              color: "#26608e",
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <label style={{ width: 80 }}>{m}</label>
            <input
              type="number"
              min={0}
              step="1"
              inputMode="numeric"
              style={{
                flex: 1,
                padding: 6,
                borderRadius: 4,
                border: "1px solid #a73332",
              }}
              value={pagosDraft[m] ? pagosDraft[m] : ""}
              onChange={(e) =>
                setPagosDraft((prev) => ({
                  ...prev,
                  [m]: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
        ))}
      </div>
            {/* Resumen dinámico */}
      {(() => {
        const total = calcularTotal();
        const sumatoria = sumaPagos(pagosDraft);
        const diferencia = total - sumatoria;      // >0 falta, <0 sobra
        const pendiente = Math.max(diferencia, 0); // lo que falta cobrar
        const vueltoUI = Math.max(-diferencia, 0); // lo que hay que devolver

        return (
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px solid #cd2c2cff",
              fontSize: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
              <span>Sumatoria</span>
              <span>${fmtAR(sumatoria)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 2,
                color: pendiente > 0 ? "#b91c1c" : "#555",
                fontWeight: pendiente > 0 ? "bold" : "normal",
              }}
            >
              <span>Pendiente</span>
              <span>${fmtAR(pendiente)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: vueltoUI > 0 ? "#1d4ed8" : "#555",
                fontWeight: vueltoUI > 0 ? "bold" : "normal",
              }}
            >
              <span>Vuelto</span>
              <span>${fmtAR(vueltoUI)}</span>
            </div>
          </div>
        );
      })()}


       {/* Botones (modal de cobro) */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Boton
          bg="#e9e1d7"
          color="#12860c"
          hoverBg="#12860c"
          hoverColor="#e9e1d7"
          onClick={() => setPagosDraft({ ...estadoVacioPagos })}
        >
          Borrar
        </Boton>

        <Boton
          bg="#e9e1d7"
          color="#12860c"
          hoverBg="#12860c"
          hoverColor="#e9e1d7"
          onClick={() =>
            setPagosDraft({
              ...estadoVacioPagos,
              Efectivo: calcularTotal(),
            })
          }
        >
          Efectivo = Total
        </Boton>

        <Boton
          bg="#e9e1d7"
          color="#12860c"
          hoverBg="#12860c"
          hoverColor="#e9e1d7"
          onClick={cancelarCobro}
        >
          Cancelar
        </Boton>

        <Boton
          bg="#e9e1d7"
          color="#12860c"
          hoverBg="#12860c"
          hoverColor="#e9e1d7"
          onClick={confirmarCobro}
        >
          Confirmar
        </Boton>
      </div>
    </div>
  </div>
)}

{/* ========= MODAL CIERRE CON CONTEO (MISMO FORMATO QUE COBRO) ========= */}
{/* ========= MODAL CIERRE CON CONTEO (MISMO FORMATO QUE COBRO) ========= */}
{cierreAbierto && resumenCorte && (
  <div
    style={{
      fontFamily: "Montserrat, sans-serif",
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 10,
    }}
    onClick={() => {
      setCierreAbierto(false);
      setResumenCorte(null);
    }}
  >
    {/* ✅ MODAL BLANCO INTERNO */}
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        fontFamily: "Montserrat, sans-serif",
        background: "white",
        width: "100%",
        maxWidth: "720px",
        borderRadius: "10px",
        border: "1px solid #d90f0fff",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h3
        style={{
          fontSize: 18,
          color: "#26608e",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        CIERRE DE CAJA
      </h3>

      {/* Info período */}
      <div
        style={{
          fontSize: 14,
          textAlign: "center",
          marginTop: 4,
          marginBottom: 8,
          color: "#26608e",
          fontWeight: 700,
        }}
      >
        Desde: <b>{fmtFecha(resumenCorte.desdeISO)}</b> — Hasta:{" "}
        <b>{fmtFecha(resumenCorte.hastaISO)}</b> — Tickets:{" "}
        <b>{resumenCorte.cantidadVentas}</b>
      </div>

      {/* Totales sistema */}
      <div style={{ marginTop: 16 }}>
        <h4
          style={{
            fontWeight: 700,
            textAlign: "center",
            color: "#26608e",
            fontSize: 16,
          }}
        >
          Totales del sistema
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 8,
            marginTop: 8,
            fontSize: 14,
          }}
        >
          {mediosPagoLista.map((mp) => (
            <div
              key={mp}
              style={{
                display: "flex",
                justifyContent: "space-between",
                border: "1px solid #a73332",
                borderRadius: 6,
                padding: "6px 8px",
                color: "#26608e",
                fontWeight: 400,
              }}
            >
              <span>{mp}</span>
              <span>${fmtAR(resumenCorte.totalesPorMedio[mp] ?? 0)}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 700,
            fontSize: 14,
            color: "#26608e",
          }}
        >
          <span>Total general</span>
          <span>${fmtAR(resumenCorte.totalGeneral)}</span>
        </div>
      </div>

      {/* Efectivo */}
      <div style={{ marginTop: 16 }}>
        <h4
          style={{
            fontWeight: 700,
            textAlign: "center",
            color: "#26608e",
            fontSize: 14,
          }}
        >
          Efectivo (cantidades de billetes)
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 8,
            marginTop: 8,
            fontSize: 14,
            textAlign: "center",
            color: "#26608e",
            fontWeight: 700,
          }}
        >
          {billetesDefs.map(({ k, l }) => (
            <label key={k} style={{ fontSize: 14 }}>
              <span style={{ marginRight: 6 }}>{l}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #a73332",
                  marginTop: 8,
                }}
                value={billetes[k] ?? ""}
                onChange={(e) =>
                  setBilletes((prev) => ({
                    ...prev,
                    [k]: e.target.value,
                  }))
                }
                placeholder="cant."
              />
            </label>
          ))}
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            color: "#26608e",
            fontWeight: 700,
          }}
        >
          <span>Total efectivo</span>
          <span>${fmtAR(totalEfectivoContado())}</span>
        </div>
      </div>

      {/* Cuentas */}
      <div style={{ marginTop: 16 }}>
        <h4
          style={{
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            color: "#26608e",
          }}
        >
          Cuentas
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
            marginTop: 8,
            fontSize: 14,
            color: "#26608e",
            fontWeight: 700,
          }}
        >
          {cuentasDefs.map(({ k, label }) => (
            <label key={k} style={{ fontSize: 14 }}>
              <span style={{ marginRight: 6 }}>{label}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #a73332",
                  marginTop: 8,
                }}
                value={cuentas[k] ?? ""}
                onChange={(e) =>
                  setCuentas((prev) => ({
                    ...prev,
                    [k]: e.target.value,
                  }))
                }
                placeholder="$"
              />
            </label>
          ))}
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            color: "#26608e",
            fontWeight: 700,
          }}
        >
          <span>Total cuentas</span>
          <span>
            ${fmtAR(
              Number(cuentas.bica || 0) +
                Number(cuentas.mp || 0) +
                Number(cuentas.macro || 0)
            )}
          </span>
        </div>
      </div>

      {/* ✅ RESUMEN CAJA (IMPORTANTE: SE CIERRA ACÁ) */}
      <div
        style={{
          marginTop: 8,
          border: "1px solid #a73332",
          borderRadius: 8,
          padding: 10,
          fontSize: 14,
          fontFamily: "Montserrat, sans-serif",
          color: "#26608e",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
          Resumen caja
        </h4>

        <div
          style={{
            display: "flex",
            fontSize: 15,
            justifyContent: "space-between",
            color: "#26608e",
          }}
        >
          <span>Total ventas</span>
          <span>${fmtAR(resumenCorte.totalGeneral)}</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 15,
            justifyContent: "space-between",
            color: "#26608e",
          }}
        >
          <span>Total pagos</span>
          <span>
            ${fmtAR(
              totalEfectivoContado() +
                Number(cuentas.mp || 0) +
                totalCuentasBicaMacroContado()
            )}
          </span>
        </div>

        {(() => {
          const dif =
            totalEfectivoContado() +
            Number(cuentas.mp || 0) +
            totalCuentasBicaMacroContado() -
            resumenCorte.totalGeneral;

          const color = dif < 0 ? "#ff2727" : "#12860c";

          return (
            <div
              style={{
                display: "flex",
                fontSize: 15,
                justifyContent: "space-between",
                marginTop: 4,
                color,
                fontWeight: 700,
              }}
            >
              <span>Diferencia</span>
              <span>${fmtAR(dif)}</span>
            </div>
          );
        })()}
      </div>
      {/* ✅ FIN RESUMEN CAJA */}

      {/* Botones al pie */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Boton
          bg="#e9e1d7"
          color="#12860c"
          hoverBg="#12860c"
          hoverColor="#e9e1d7"
          onClick={() => {
            setCierreAbierto(false);
            setResumenCorte(null);
          }}
        >
          Cancelar
        </Boton>

        <Boton
          bg="#e9e1d7"
          color="#12860c"
          hoverBg="#12860c"
          hoverColor="#e9e1d7"
          onClick={confirmarCierreConConteo}
        >
          Confirmar cierre
        </Boton>
      </div>
    </div>
    {/* ✅ FIN MODAL BLANCO */}
  </div>
)}

{/* ========= MODAL RESUMEN DE VENTA (MISMO FORMATO QUE COBRO) ========= */}
{resumenVenta && (
  <div
    style={{
      fontFamily: "Montserrat, sans-serif",
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 10,
    }}
    onClick={() => setResumenVenta(null)} // clic afuera cierra
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        width: "100%",
        maxWidth: "420px",
        borderRadius: "10px",
        border: "1px solid #555",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 6 }}>
        Venta N° {resumenVenta.numeroVenta}
      </h3>

      {/* Fecha / hora */}
      {resumenVenta.ventas.length > 0 && (
        <div style={{ fontSize: 12, color: "#555", textAlign: "center", marginBottom: 8 }}>
          <div>
            Fecha: <b>{resumenVenta.ventas[0].fecha}</b> — Hora:{" "}
            <b>{resumenVenta.ventas[0].hora}</b>
          </div>
          <div>
            Lugar de consumo:{" "}
            <b>{resumenVenta.ventas[0].lugarConsumo}</b>
          </div>
        </div>
      )}

      {/* Productos */}
      <div style={{ marginTop: 8, borderTop: "1px solid #ddd", paddingTop: 8 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          Detalle de productos
        </h4>

        <ul style={{ fontSize: 14, maxHeight: 180, overflow: "auto", paddingLeft: 16 }}>
          {resumenVenta.ventas.map((v, idx) => (
            <li key={idx} style={{ borderBottom: "1px solid #eee", paddingBottom: 4, marginBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  {v.cantidad}× {v.producto}
                </span>
                <span>${fmtAR(v.cantidad * v.precio)}</span>
              </div>

              {v.mensajeTicket && (
                <div style={{ fontSize: 12, color: "#555" }}>
                  &gt; {v.mensajeTicket}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Totales y pagos */}
      <div style={{ marginTop: 10, borderTop: "1px solid #ddd", paddingTop: 8, fontSize: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>Total</span>
          <span>${fmtAR(resumenVenta.total)}</span>
        </div>

        {resumenVenta.vuelto > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "#1d4ed8", fontWeight: 700 }}>
            <span>Vuelto</span>
            <span>${fmtAR(resumenVenta.vuelto)}</span>
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
            Medios de pago
          </h4>

          {MEDIOS.filter((m) => (resumenVenta.pagos[m] || 0) > 0).map((m) => (
            <div key={m} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{m}</span>
              <span>${fmtAR(resumenVenta.pagos[m] || 0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón cerrar */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <Boton
          bg="#e9e1d7"
          color="#12860c"
          hoverBg="#12860c"
          hoverColor="#e9e1d7"
          onClick={() => setResumenVenta(null)}
        >
          Cerrar
        </Boton>
      </div>
    </div>
  </div>
)}

      </div>
    </>
  );
};

export default Evento14Diciembre;
