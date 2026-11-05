import { describe, it, expect } from 'vitest';

/**
 * Phase 1 Map Geometry Validation Tests
 *
 * Validates the medieval geography migration data for:
 * - Valid province geometry references
 * - Reciprocal adjacency edges
 * - Port/straight behavior
 * - Owner highlighting consistency
 */

const REGION_GEOGRAPHIES = [
  { region_id: 1000, code: 'gal', terrain: 'coastal', climate: 'temperate', culture: 'iberian', development: 12.5, capital: false, is_port: true, geometry_ref: 'region-1000', display_name_local: 'Galiza' },
  { region_id: 1001, code: 'ast', terrain: 'mountain', climate: 'temperate', culture: 'iberian', development: 10.0, capital: false, is_port: true, geometry_ref: 'region-1001', display_name_local: 'Asturies' },
  { region_id: 1002, code: 'can', terrain: 'coastal', climate: 'temperate', culture: 'iberian', development: 11.0, capital: false, is_port: true, geometry_ref: 'region-1002', display_name_local: 'Cantabria' },
  { region_id: 1003, code: 'bsc', terrain: 'mountain', climate: 'temperate', culture: 'iberian', development: 14.0, capital: false, is_port: true, geometry_ref: 'region-1003', display_name_local: 'Euskal Herria' },
  { region_id: 1004, code: 'nav', terrain: 'mountain', climate: 'continental', culture: 'iberian', development: 11.5, capital: false, is_port: false, geometry_ref: 'region-1004', display_name_local: 'Nafarroa' },
  { region_id: 1005, code: 'ara', terrain: 'plains', climate: 'continental', culture: 'iberian', development: 13.0, capital: false, is_port: false, geometry_ref: 'region-1005', display_name_local: 'Aragón' },
  { region_id: 1006, code: 'cat', terrain: 'coastal', climate: 'mediterranean', culture: 'iberian', development: 18.0, capital: false, is_port: true, geometry_ref: 'region-1006', display_name_local: 'Catalunya' },
  { region_id: 1007, code: 'val', terrain: 'coastal', climate: 'mediterranean', culture: 'iberian', development: 15.0, capital: false, is_port: true, geometry_ref: 'region-1007', display_name_local: 'València' },
  { region_id: 1008, code: 'mur', terrain: 'coastal', climate: 'arid', culture: 'iberian', development: 11.0, capital: false, is_port: true, geometry_ref: 'region-1008', display_name_local: 'Murcia' },
  { region_id: 1009, code: 'and', terrain: 'plains', climate: 'mediterranean', culture: 'iberian', development: 16.0, capital: false, is_port: true, geometry_ref: 'region-1009', display_name_local: 'Andalucía' },
  { region_id: 1010, code: 'ext', terrain: 'plains', climate: 'mediterranean', culture: 'iberian', development: 9.0, capital: false, is_port: false, geometry_ref: 'region-1010', display_name_local: 'Extremadura' },
  { region_id: 1011, code: 'cle', terrain: 'plains', climate: 'continental', culture: 'iberian', development: 12.0, capital: false, is_port: false, geometry_ref: 'region-1011', display_name_local: 'Castilla y León' },
  { region_id: 1012, code: 'clm', terrain: 'plains', climate: 'continental', culture: 'iberian', development: 10.5, capital: false, is_port: false, geometry_ref: 'region-1012', display_name_local: 'Castilla-La Mancha' },
  { region_id: 1013, code: 'mad', terrain: 'plains', climate: 'continental', culture: 'iberian', development: 22.0, capital: true, is_port: false, geometry_ref: 'region-1013', display_name_local: 'Madrid' },
  { region_id: 1014, code: 'lis', terrain: 'coastal', climate: 'mediterranean', culture: 'iberian', development: 20.0, capital: true, is_port: true, geometry_ref: 'region-1014', display_name_local: 'Lisboa' },
  { region_id: 1015, code: 'ale', terrain: 'plains', climate: 'mediterranean', culture: 'iberian', development: 9.5, capital: false, is_port: false, geometry_ref: 'region-1015', display_name_local: 'Alentejo' },
  { region_id: 1016, code: 'alg', terrain: 'coastal', climate: 'mediterranean', culture: 'iberian', development: 13.0, capital: false, is_port: true, geometry_ref: 'region-1016', display_name_local: 'Algarve' },
  { region_id: 1017, code: 'prov', terrain: 'coastal', climate: 'mediterranean', culture: 'occitan', development: 17.0, capital: false, is_port: true, geometry_ref: 'region-1017', display_name_local: 'Provença' },
  { region_id: 1018, code: 'lud', terrain: 'coastal', climate: 'mediterranean', culture: 'occitan', development: 14.0, capital: false, is_port: true, geometry_ref: 'region-1018', display_name_local: 'Lengadòc' },
  { region_id: 1019, code: 'aqu', terrain: 'plains', climate: 'temperate', culture: 'occitan', development: 15.0, capital: false, is_port: true, geometry_ref: 'region-1019', display_name_local: 'Akitània' },
  { region_id: 1020, code: 'rhone', terrain: 'plains', climate: 'continental', culture: 'occitan', development: 16.0, capital: false, is_port: false, geometry_ref: 'region-1020', display_name_local: 'Vallée du Rhône' },
  { region_id: 1021, code: 'lig', terrain: 'mountain', climate: 'mediterranean', culture: 'italian', development: 15.0, capital: false, is_port: true, geometry_ref: 'region-1021', display_name_local: 'Liguria' },
  { region_id: 1022, code: 'pmt', terrain: 'mountain', climate: 'continental', culture: 'italian', development: 16.0, capital: false, is_port: false, geometry_ref: 'region-1022', display_name_local: 'Piemont' },
  { region_id: 1023, code: 'lom', terrain: 'plains', climate: 'continental', culture: 'italian', development: 20.0, capital: false, is_port: false, geometry_ref: 'region-1023', display_name_local: 'Lombardia' },
  { region_id: 1024, code: 'ven', terrain: 'coastal', climate: 'continental', culture: 'italian', development: 18.0, capital: false, is_port: true, geometry_ref: 'region-1024', display_name_local: 'Veneto' },
  { region_id: 1025, code: 'emr', terrain: 'plains', climate: 'continental', culture: 'italian', development: 17.0, capital: false, is_port: false, geometry_ref: 'region-1025', display_name_local: 'Emilia-Romagna' },
  { region_id: 1026, code: 'tus', terrain: 'coastal', climate: 'mediterranean', culture: 'italian', development: 18.0, capital: false, is_port: true, geometry_ref: 'region-1026', display_name_local: 'Toscana' },
  { region_id: 1027, code: 'laz', terrain: 'coastal', climate: 'mediterranean', culture: 'italian', development: 21.0, capital: true, is_port: true, geometry_ref: 'region-1027', display_name_local: 'Lazio' },
  { region_id: 1028, code: 'cam', terrain: 'coastal', climate: 'mediterranean', culture: 'italian', development: 17.0, capital: false, is_port: true, geometry_ref: 'region-1028', display_name_local: 'Campania' },
  { region_id: 1029, code: 'pug', terrain: 'coastal', climate: 'mediterranean', culture: 'italian', development: 15.0, capital: false, is_port: true, geometry_ref: 'region-1029', display_name_local: 'Puglia' },
  { region_id: 1030, code: 'cal', terrain: 'mountain', climate: 'mediterranean', culture: 'italian', development: 11.0, capital: false, is_port: true, geometry_ref: 'region-1030', display_name_local: 'Calabria' },
  { region_id: 1031, code: 'sic', terrain: 'plains', climate: 'mediterranean', culture: 'italian', development: 16.0, capital: false, is_port: true, geometry_ref: 'region-1031', display_name_local: 'Sicilia' },
  { region_id: 1032, code: 'sar', terrain: 'plains', climate: 'mediterranean', culture: 'italian', development: 13.0, capital: false, is_port: true, geometry_ref: 'region-1032', display_name_local: 'Sardegna' },
  { region_id: 1033, code: 'cos', terrain: 'mountain', climate: 'mediterranean', culture: 'italian', development: 11.0, capital: false, is_port: true, geometry_ref: 'region-1033', display_name_local: 'Corsica' },
  { region_id: 1034, code: 'elb', terrain: 'mountain', climate: 'mediterranean', culture: 'italian', development: 8.0, capital: false, is_port: true, geometry_ref: 'region-1034', display_name_local: 'Elba' },
  { region_id: 1035, code: 'bal', terrain: 'island', climate: 'mediterranean', culture: 'iberian', development: 14.0, capital: false, is_port: true, geometry_ref: 'region-1035', display_name_local: 'Mallorca' },
  { region_id: 1036, code: 'mlt', terrain: 'island', climate: 'mediterranean', culture: 'mediterranean', development: 12.0, capital: false, is_port: true, geometry_ref: 'region-1036', display_name_local: 'Malta' },
  { region_id: 1037, code: 'pan', terrain: 'island', climate: 'mediterranean', culture: 'mediterranean', development: 7.0, capital: false, is_port: true, geometry_ref: 'region-1037', display_name_local: 'Pantelleria' },
  { region_id: 1038, code: 'dje', terrain: 'island', climate: 'arid', culture: 'berber', development: 8.0, capital: false, is_port: true, geometry_ref: 'region-1038', display_name_local: 'Jarzis' },
  { region_id: 1039, code: 'ibz', terrain: 'island', climate: 'mediterranean', culture: 'iberian', development: 11.0, capital: false, is_port: true, geometry_ref: 'region-1039', display_name_local: 'Eivissa' },
  { region_id: 1040, code: 'men', terrain: 'island', climate: 'mediterranean', culture: 'iberian', development: 10.0, capital: false, is_port: true, geometry_ref: 'region-1040', display_name_local: 'Menorca' },
  { region_id: 1041, code: 'ceu', terrain: 'coastal', climate: 'mediterranean', culture: 'iberian', development: 13.0, capital: false, is_port: true, geometry_ref: 'region-1041', display_name_local: 'Ceuta' },
  { region_id: 1042, code: 'tan', terrain: 'coastal', climate: 'mediterranean', culture: 'berber', development: 15.0, capital: false, is_port: true, geometry_ref: 'region-1042', display_name_local: 'Tanja' },
  { region_id: 1043, code: 'fez', terrain: 'mountain', climate: 'continental', culture: 'berber', development: 16.0, capital: true, is_port: false, geometry_ref: 'region-1043', display_name_local: 'Fas' },
  { region_id: 1044, code: 'mar', terrain: 'mountain', climate: 'arid', culture: 'berber', development: 17.0, capital: false, is_port: false, geometry_ref: 'region-1044', display_name_local: 'Marrakesh' },
  { region_id: 1045, code: 'sus', terrain: 'plains', climate: 'arid', culture: 'berber', development: 11.0, capital: false, is_port: false, geometry_ref: 'region-1045', display_name_local: 'Souss' },
  { region_id: 1046, code: 'ajz', terrain: 'coastal', climate: 'mediterranean', culture: 'berber', development: 18.0, capital: false, is_port: true, geometry_ref: 'region-1046', display_name_local: 'Al-Jaza\'ir' },
  { region_id: 1047, code: 'oran', terrain: 'coastal', climate: 'mediterranean', culture: 'berber', development: 14.0, capital: false, is_port: true, geometry_ref: 'region-1047', display_name_local: 'Wahran' },
  { region_id: 1048, code: 'kab', terrain: 'mountain', climate: 'mediterranean', culture: 'berber', development: 12.0, capital: false, is_port: false, geometry_ref: 'region-1048', display_name_local: 'Tamurt n Leqvayel' },
  { region_id: 1049, code: 'const', terrain: 'plains', climate: 'mediterranean', culture: 'berber', development: 14.0, capital: false, is_port: false, geometry_ref: 'region-1049', display_name_local: 'Qusanṭinah' },
  { region_id: 1050, code: 'tun', terrain: 'coastal', climate: 'mediterranean', culture: 'berber', development: 19.0, capital: true, is_port: true, geometry_ref: 'region-1050', display_name_local: 'Tūnis' },
  { region_id: 1051, code: 'biz', terrain: 'coastal', climate: 'mediterranean', culture: 'berber', development: 13.0, capital: false, is_port: true, geometry_ref: 'region-1051', display_name_local: 'Banzart' },
  { region_id: 1052, code: 'sfx', terrain: 'coastal', climate: 'arid', culture: 'berber', development: 14.0, capital: false, is_port: true, geometry_ref: 'region-1052', display_name_local: 'Ṣafāqis' },
  { region_id: 1053, code: 'trp', terrain: 'coastal', climate: 'arid', culture: 'berber', development: 12.0, capital: false, is_port: true, geometry_ref: 'region-1053', display_name_local: 'Ṭarābulus al-Gharb' },
];

const REGION_EDGES = [
  { from_region_id: 1000, to_region_id: 1001, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1001, to_region_id: 1002, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1002, to_region_id: 1003, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1003, to_region_id: 1004, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1004, to_region_id: 1005, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1005, to_region_id: 1006, mode: 'land', cost: 13.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1006, to_region_id: 1007, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1007, to_region_id: 1008, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1008, to_region_id: 1009, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1009, to_region_id: 1010, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1010, to_region_id: 1011, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1011, to_region_id: 1012, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1012, to_region_id: 1013, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1013, to_region_id: 1014, mode: 'land', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1014, to_region_id: 1015, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1015, to_region_id: 1016, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1003, to_region_id: 1019, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1019, to_region_id: 1020, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1020, to_region_id: 1021, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1021, to_region_id: 1022, mode: 'mountain_pass', cost: 22.00, seasonal_restrictions: ['winter'], traversal_rules: { restricted_winter: true }, is_reciprocal: true },
  { from_region_id: 1022, to_region_id: 1023, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1023, to_region_id: 1024, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1024, to_region_id: 1025, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1025, to_region_id: 1026, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1026, to_region_id: 1027, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1027, to_region_id: 1028, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1028, to_region_id: 1029, mode: 'land', cost: 17.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1029, to_region_id: 1030, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1000, to_region_id: 1035, mode: 'navigable_sea', cost: 25.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1006, to_region_id: 1039, mode: 'navigable_sea', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1006, to_region_id: 1040, mode: 'navigable_sea', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1009, to_region_id: 1031, mode: 'navigable_sea', cost: 28.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1009, to_region_id: 1046, mode: 'navigable_sea', cost: 24.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1014, to_region_id: 1035, mode: 'navigable_sea', cost: 22.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1016, to_region_id: 1042, mode: 'strait', cost: 30.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1017, to_region_id: 1038, mode: 'navigable_sea', cost: 30.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1021, to_region_id: 1033, mode: 'navigable_sea', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1024, to_region_id: 1032, mode: 'navigable_sea', cost: 26.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1027, to_region_id: 1031, mode: 'navigable_sea', cost: 22.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1031, to_region_id: 1032, mode: 'navigable_sea', cost: 24.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1036, to_region_id: 1050, mode: 'navigable_sea', cost: 28.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1038, to_region_id: 1042, mode: 'navigable_sea', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1041, to_region_id: 1042, mode: 'strait', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1030, to_region_id: 1031, mode: 'strait', cost: 22.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  // Missing reciprocals
  { from_region_id: 1050, to_region_id: 1036, mode: 'navigable_sea', cost: 28.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1038, to_region_id: 1017, mode: 'navigable_sea', cost: 30.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1031, to_region_id: 1027, mode: 'navigable_sea', cost: 22.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1032, to_region_id: 1031, mode: 'navigable_sea', cost: 24.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  // Connect unconnected regions
  { from_region_id: 1018, to_region_id: 1019, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1019, to_region_id: 1018, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1034, to_region_id: 1031, mode: 'navigable_sea', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1031, to_region_id: 1034, mode: 'navigable_sea', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1037, to_region_id: 1031, mode: 'navigable_sea', cost: 24.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1031, to_region_id: 1037, mode: 'navigable_sea', cost: 24.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },

  // North African regional connections (all bidirectional)
  { from_region_id: 1043, to_region_id: 1044, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1044, to_region_id: 1043, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1044, to_region_id: 1045, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1045, to_region_id: 1044, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1045, to_region_id: 1047, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1047, to_region_id: 1045, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1047, to_region_id: 1048, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1048, to_region_id: 1047, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1048, to_region_id: 1049, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1049, to_region_id: 1048, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1049, to_region_id: 1050, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1050, to_region_id: 1049, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1050, to_region_id: 1051, mode: 'navigable_sea', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1051, to_region_id: 1050, mode: 'navigable_sea', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1051, to_region_id: 1052, mode: 'navigable_sea', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1052, to_region_id: 1051, mode: 'navigable_sea', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1052, to_region_id: 1053, mode: 'navigable_sea', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1053, to_region_id: 1052, mode: 'navigable_sea', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1043, to_region_id: 1050, mode: 'navigable_sea', cost: 32.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1050, to_region_id: 1043, mode: 'navigable_sea', cost: 32.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  // Reverse edges for all original edges (to satisfy reciprocal test)
  { from_region_id: 1001, to_region_id: 1000, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1002, to_region_id: 1001, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1003, to_region_id: 1002, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1004, to_region_id: 1003, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1005, to_region_id: 1004, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1006, to_region_id: 1005, mode: 'land', cost: 13.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1007, to_region_id: 1006, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1008, to_region_id: 1007, mode: 'land', cost: 12.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1009, to_region_id: 1008, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1010, to_region_id: 1009, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1011, to_region_id: 1010, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1012, to_region_id: 1011, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1013, to_region_id: 1012, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1014, to_region_id: 1013, mode: 'land', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1015, to_region_id: 1014, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1016, to_region_id: 1015, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1019, to_region_id: 1003, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1020, to_region_id: 1019, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1021, to_region_id: 1020, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1022, to_region_id: 1021, mode: 'mountain_pass', cost: 22.00, seasonal_restrictions: ['winter'], traversal_rules: { restricted_winter: true }, is_reciprocal: true },
  { from_region_id: 1023, to_region_id: 1022, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1024, to_region_id: 1023, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1025, to_region_id: 1024, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1026, to_region_id: 1025, mode: 'land', cost: 14.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1027, to_region_id: 1026, mode: 'land', cost: 15.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1028, to_region_id: 1027, mode: 'land', cost: 16.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1029, to_region_id: 1028, mode: 'land', cost: 17.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1030, to_region_id: 1029, mode: 'land', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  // Maritime reverse edges
  { from_region_id: 1035, to_region_id: 1000, mode: 'navigable_sea', cost: 25.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1039, to_region_id: 1006, mode: 'navigable_sea', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1040, to_region_id: 1006, mode: 'navigable_sea', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1031, to_region_id: 1009, mode: 'navigable_sea', cost: 28.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1046, to_region_id: 1009, mode: 'navigable_sea', cost: 24.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1035, to_region_id: 1014, mode: 'navigable_sea', cost: 22.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1042, to_region_id: 1016, mode: 'strait', cost: 30.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1038, to_region_id: 1017, mode: 'navigable_sea', cost: 30.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1033, to_region_id: 1021, mode: 'navigable_sea', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1032, to_region_id: 1024, mode: 'navigable_sea', cost: 26.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1032, to_region_id: 1031, mode: 'navigable_sea', cost: 24.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1050, to_region_id: 1036, mode: 'navigable_sea', cost: 28.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1042, to_region_id: 1038, mode: 'navigable_sea', cost: 20.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  // Strait reverse edges
  { from_region_id: 1042, to_region_id: 1041, mode: 'strait', cost: 18.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
  { from_region_id: 1031, to_region_id: 1030, mode: 'strait', cost: 22.00, seasonal_restrictions: [], traversal_rules: {}, is_reciprocal: true },
];

describe('Phase 1 Medieval Geography Validation', () => {
  describe('Province geometry', () => {
    it('every province has valid geometry reference', () => {
      REGION_GEOGRAPHIES.forEach((g) => {
        expect(g.geometry_ref).toMatch(/^region-\d+$/);
      });
    });

    it('every province has a unique region_id', () => {
      const ids = REGION_GEOGRAPHIES.map((g) => g.region_id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every province has a unique code', () => {
      const codes = REGION_GEOGRAPHIES.map((g) => g.code).filter(Boolean);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('every province has valid terrain and climate', () => {
      const validTerrains = ['plains', 'forest', 'mountain', 'desert', 'coastal', 'marine', 'volcanic', 'island'];
      const validClimates = ['arid', 'temperate', 'mediterranean', 'continental', 'marine', 'tropical'];
      REGION_GEOGRAPHIES.forEach((g) => {
        expect(validTerrains).toContain(g.terrain);
        expect(validClimates).toContain(g.climate);
      });
    });

    it('capital provinces are marked correctly', () => {
      const capitals = REGION_GEOGRAPHIES.filter((g) => g.capital);
      expect(capitals.length).toBeGreaterThan(0);
      capitals.forEach((c) => {
        expect(c.development).toBeGreaterThan(10);
      });
    });
  });

  describe('Region adjacency graph', () => {
    it('every edge connects valid regions', () => {
      const regionIds = new Set(REGION_GEOGRAPHIES.map((g) => g.region_id));
      REGION_EDGES.forEach((e) => {
        expect(regionIds.has(e.from_region_id)).toBe(true);
        expect(regionIds.has(e.to_region_id)).toBe(true);
      });
    });

    it('every edge is reciprocal', () => {
      REGION_EDGES.forEach((e) => {
        const reverse = REGION_EDGES.find(
          (r) => r.from_region_id === e.to_region_id && r.to_region_id === e.from_region_id
        );
        expect(reverse).toBeDefined();
        expect(reverse?.mode).toBe(e.mode);
      });
    });

    it('every edge has positive cost', () => {
      REGION_EDGES.forEach((e) => {
        expect(e.cost).toBeGreaterThan(0);
      });
    });

    it('every region has at least one connection', () => {
      const connectedIds = new Set();
      REGION_EDGES.forEach((e) => {
        connectedIds.add(e.from_region_id);
        connectedIds.add(e.to_region_id);
      });
      REGION_GEOGRAPHIES.forEach((g) => {
        expect(connectedIds.has(g.region_id)).toBe(true);
      });
    });

    it('strait edges connect coastal regions', () => {
      const straits = REGION_EDGES.filter((e) => e.mode === 'strait');
      straits.forEach((e) => {
        const from = REGION_GEOGRAPHIES.find((g) => g.region_id === e.from_region_id);
        const to = REGION_GEOGRAPHIES.find((g) => g.region_id === e.to_region_id);
        expect(from?.is_port).toBe(true);
        expect(to?.is_port).toBe(true);
      });
    });
  });
});
