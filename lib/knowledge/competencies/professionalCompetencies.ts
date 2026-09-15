import type { ProfessionalCompetency } from "../professionalTypes";

import { procurementCompetencies } from "./procurementCompetencies";

export const professionalCompetencies: ProfessionalCompetency[] = [

  ...procurementCompetencies.map(
    competency => ({
      id: competency.id,
      name: competency.name,
      category: "operational" as const,
      recognitionPatterns: competency.recognitionPatterns,
      semanticPatterns: competency.semanticPatterns,
    })
  ),

  {
    id: "personnel_management",
    name: "Personnel Management",
    category: "management",
    recognitionPatterns: [
      "personnel management",
      "managed personnel",
      "staff management",
      "team management",
      "gestión de personal",
      "manejo de personal",
      "administración de personal",
      "supervisión de personal",
      "supervisar personal",
    ],
  },

  {
    id: "operational_supervision",
    name: "Operational Supervision",
    category: "operational",
    recognitionPatterns: [
      "operational supervision",
      "operations supervision",
      "supervised operations",
      "operational management",
      "supervisión operativa",
      "supervisión de operaciones",
      "supervisar operaciones",
      "coordinación operativa",
    ],
  },

  {
    id: "planning_coordination",
    name: "Planning & Coordination",
    category: "management",
    recognitionPatterns: [
      "planning and coordination",
      "planning",
      "coordination",
      "coordinated activities",
      "coordinated operations",
      "planificación",
      "planeación",
      "coordinación",
      "organización",
      "organizar",
    ],
  },

  {
    id: "leadership",
    name: "Leadership",
    category: "management",
    recognitionPatterns: [
      "leadership",
      "team leadership",
      "led teams",
      "leadership skills",
      "liderazgo",
      "dirigió",
      "dirigir equipos",
      "jefatura",
      "jefe",
    ],
  },

  {
    id: "negotiation_conflict_resolution",
    name: "Negotiation & Conflict Resolution",
    category: "management",
    recognitionPatterns: [
      "negotiation",
      "negotiated",
      "conflict resolution",
      "commercial negotiation",
      "supplier negotiations",
      "negociación",
      "negociación comercial",
      "resolución de conflictos",
      "resolver conflictos",
    ],
  },

  {
    id: "communication",
    name: "Professional Communication",
    category: "administrative",
    recognitionPatterns: [
      "communication",
      "effective communication",
      "client communication",
      "customer communication",
      "professional communication",
      "comunicación",
      "comunicación efectiva",
      "trato con clientes",
      "atención a clientes",
      "trato con proveedores",
    ],
  },

  {
    id: "security_management",
    name: "Security Management",
    category: "compliance",
    recognitionPatterns: [
      "security management",
      "industrial security",
      "asset security",
      "physical security",
      "security operations",
      "patrimonial security",
      "seguridad industrial",
      "seguridad patrimonial",
      "seguridad física",
      "gestión de seguridad",
      "supervisión de seguridad",
    ],
  },

  {
    id: "investigation",
    name: "Investigation",
    category: "technical",
    recognitionPatterns: [
      "investigation",
      "field investigation",
      "research investigation",
      "investigative work",
      "investigación",
      "investigación de campo",
      "investigación de gabinete",
      "trabajo de investigación",
    ],
  },

  {
    id: "data_analysis",
    name: "Data Analysis",
    category: "technical",
    recognitionPatterns: [
      "data analysis",
      "data analyst",
      "analyzed data",
      "information analysis",
      "data analysis skills",
      "análisis de datos",
      "analista de datos",
      "análisis de información",
      "analizar información",
    ],
  },

  {
    id: "administration",
    name: "Administration",
    category: "administrative",
    recognitionPatterns: [
      "administration",
      "administrative management",
      "business administration",
      "administrador",
      "administración",
      "gestión administrativa",
      "administración de recursos",
      "administración de cartera",
    ],
  },

  {
    id: "resource_management",
    name: "Resource Management",
    category: "management",
    recognitionPatterns: [
      "resource management",
      "managed resources",
      "resource planning",
      "gestión de recursos",
      "manejo de recursos",
      "administración de recursos",
    ],
  },

  {
    id: "purchasing",
    name: "Purchasing",
    category: "operational",
    recognitionPatterns: [
      "purchasing",
      "purchase management",
      "purchasing management",
      "raw material purchasing",
      "compras",
      "jefe de compras",
      "gestión de compras",
      "adquisición",
      "adquisiciones",
      "compra de productos",
      "compra de materia prima",
    ],
  },

  {
    id: "research_information",
    name: "Information Research",
    category: "technical",
    recognitionPatterns: [
      "information research",
      "online research",
      "information search",
      "research information",
      "investigación de información",
      "búsqueda de información",
      "investigación en línea",
    ],
  },

  {
    id: "digital_tools",
    name: "Digital Tools",
    category: "technical",
    recognitionPatterns: [
      "microsoft word",
      "microsoft excel",
      "microsoft powerpoint",
      "excel",
      "word",
      "powerpoint",
      "email",
      "digital tools",
      "herramientas digitales",
      "correo electrónico",
      "plataformas de comunicación",
    ],
  },

  {
    id: "teamwork",
    name: "Teamwork",
    category: "management",
    recognitionPatterns: [
      "teamwork",
      "team work",
      "worked in teams",
      "collaboration",
      "trabajo en equipo",
      "colaboración",
    ],
  },

  {
    id: "decision_making",
    name: "Decision Making",
    category: "management",
    recognitionPatterns: [
      "decision making",
      "decision-making",
      "made decisions",
      "toma de decisiones",
      "toma de decisión",
    ],
  },

];
