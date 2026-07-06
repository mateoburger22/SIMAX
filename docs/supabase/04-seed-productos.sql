-- ============================================================================
-- 04-seed-productos.sql  ·  Carga inicial del catálogo
-- ----------------------------------------------------------------------------
-- Se corre CUARTO. Inserta las 9 cintas iniciales del catálogo, las mismas
-- que vivían hardcoded en data/productos.js. Ejecutar UNA SOLA VEZ:
-- como `sku` es unique, una segunda corrida rompería con unique_violation.
-- Si querés re-seedear, primero `truncate public.productos restart identity cascade;`
-- ============================================================================

insert into public.productos (sku, name, description, price, linea, image) values
('CIMAT-RW-050',  'Repair Wrap 50 mm',            'Cinta de fibra de vidrio activada con agua. Endurece en 30 min y queda con resistencia mecánica permanente. <strong>50 mm × 3,65 m</strong>.', 24500, 'reparacion', '/img/productos/armortape.png'),
('CIMAT-RW-075',  'Repair Wrap 75 mm',            'Versión intermedia para tuberías de mayor diámetro y reparaciones estructurales. <strong>75 mm × 3,65 m</strong>.',                              35800, 'reparacion', '/img/productos/armortape.png'),
('CIMAT-RW-100',  'Repair Wrap Heavy Duty 100 mm','Versión reforzada para tuberías industriales de gran diámetro y aplicaciones bajo presión. <strong>100 mm × 3,65 m</strong>.',                  48900, 'reparacion', '/img/productos/armortape.png'),
('CIMAT-PVC-019', 'Aislante PVC Premium 19 mm',   'Cinta vinílica negra dieléctrica para conexiones eléctricas hasta <strong>600 V</strong>. Adhesivo permanente y elasticidad de uso profesional. <strong>19 mm × 20 m</strong>.', 4200, 'aislacion', '/img/productos/electrictape.png'),
('CIMAT-AF-019',  'Auto-Fundente 19 mm',          'Cinta de goma EPR auto-vulcanizable. Sin adhesivo: se funde sobre sí misma. Aprobada para conexiones hasta <strong>69 kV</strong>. <strong>19 mm × 9 m</strong>.', 12300, 'aislacion', '/img/productos/electrictape.png'),
('CIMAT-CPK-005', 'Color Pack Eléctrico',         'Set de 5 cintas vinílicas en colores de identificación de fases (negro, rojo, azul, verde, amarillo). <strong>19 mm × 6 m</strong> c/u.', 18500, 'aislacion', '/img/productos/electrictape.png'),
('CIMAT-SH-050',  'Sellador Hidráulico Universal','Cinta autofusionante de silicona para reparar fugas en cañerías sin secado. Resiste hasta <strong>2,5 bar</strong>. <strong>50 mm × 3 m</strong>.',  9800, 'sellado',    '/img/productos/polytape.png'),
('CIMAT-PTF-012', 'PTFE Industrial 12 mm',        'Cinta de teflón densidad alta para sellar roscas en agua, gas y aire comprimido. <strong>12 mm × 12 m</strong>.',                                3500, 'sellado',    '/img/productos/polytape.png'),
('CIMAT-AFP-075', 'Anti-Fugas Pro 75 mm',         'Cinta epoxy reforzada para reparaciones definitivas en cañerías de alta presión. <strong>75 mm × 1,5 m</strong>.',                                22400, 'sellado',    '/img/productos/polytape.png');
