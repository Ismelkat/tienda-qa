/**
 * Genera los datos de la tienda con Faker.
 * Produce datos/db.json con { productos: [...], pedidos: [...] }.
 *
 * Semilla FIJA (faker.seed) -> mismos datos en cada corrida y en cualquier maquina.
 * db.json NO se versiona (.gitignore): el pipeline lo regenera con esta semilla.
 *
 * Ejecutar:  npm run generar
 */
import { faker } from '@faker-js/faker';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaDb = path.join(__dirname, 'db.json');

faker.seed(2025);

// Cada categoria tiene sus propios productos y su rango de precio (coherencia).
const CATALOGO = {
  electronica: { precio: [80, 2500], items: ['Audífonos inalámbricos', 'Teclado mecánico', 'Monitor LED', 'Cámara web HD', 'Parlante bluetooth'] },
  muebles:     { precio: [120, 1800], items: ['Silla ergonómica', 'Escritorio de madera', 'Estantería modular', 'Sofá de tres puestos', 'Mesa de comedor'] },
  hogar:       { precio: [20, 400],   items: ['Juego de sábanas', 'Set de ollas', 'Lámpara de mesa', 'Cortinas blackout', 'Organizador de cocina'] },
  ropa:        { precio: [25, 300],   items: ['Camiseta de algodón', 'Chaqueta impermeable', 'Jeans clásicos', 'Sudadera con capucha', 'Zapatillas urbanas'] },
  deportes:    { precio: [30, 900],   items: ['Balón de fútbol', 'Bicicleta de montaña', 'Set de mancuernas', 'Raqueta de tenis', 'Tapete de yoga'] },
};

const CATEGORIAS = Object.keys(CATALOGO);
const VARIANTES  = ['Pro', 'Plus', 'Lite', 'Max', 'Clásico'];
const CALIDADES  = ['duradero', 'ligero', 'resistente', 'compacto', 'versátil'];
const ESTADOS    = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

const POR_CATEGORIA = 5;                                   // 5 x 5 = 25 productos
const CANT_PRODUCTOS = CATEGORIAS.length * POR_CATEGORIA;
const CANT_PEDIDOS = 8;

function crearProducto(i) {
  const categoria = CATEGORIAS[i % CATEGORIAS.length];
  const { precio, items } = CATALOGO[categoria];
  const base = items[Math.floor(i / CATEGORIAS.length)];
  const variante = faker.helpers.arrayElement(VARIANTES);
  return {
    id: i + 1,
    nombre: `${base} ${variante}`,
    categoria,
    descripcion: `${base} ${faker.helpers.arrayElement(CALIDADES)}, ideal para el día a día.`,
    precio: faker.number.float({ min: precio[0], max: precio[1], fractionDigits: 2 }),
    stock: faker.number.int({ min: 5, max: 80 }),
    activo: true,
  };
}

const productos = Array.from({ length: CANT_PRODUCTOS }, (_, i) => crearProducto(i));

// Caso de borde a proposito: el ultimo producto queda inactivo y sin stock.
productos[productos.length - 1].activo = false;
productos[productos.length - 1].stock = 0;

function crearPedido(id) {
  return {
    id,
    productoId: faker.number.int({ min: 1, max: CANT_PRODUCTOS - 1 }),
    cliente: faker.internet.email().toLowerCase(),
    cantidad: faker.number.int({ min: 1, max: 5 }),
    estado: faker.helpers.arrayElement(ESTADOS),
    fecha: faker.date.recent({ days: 30 }).toISOString().slice(0, 10),
  };
}

const pedidos = Array.from({ length: CANT_PEDIDOS }, (_, i) => crearPedido(i + 1));

fs.mkdirSync(path.dirname(rutaDb), { recursive: true });
fs.writeFileSync(rutaDb, JSON.stringify({ productos, pedidos }, null, 2));

console.log('===== Generar datos de la tienda (Faker, semilla 2025) =====');
console.log('Categorias: ' + CATEGORIAS.length + '  |  Productos: ' + productos.length + '  |  Pedidos: ' + pedidos.length);
console.log('Ejemplo: ' + productos[0].nombre + ' (' + productos[0].categoria + ') $' + productos[0].precio);
console.log('Caso de borde: producto ' + productos.length + ' inactivo, stock 0.');
console.log('============================================================');
