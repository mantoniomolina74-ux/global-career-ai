# ADR-013 — Knowledge Domain Intelligence Engine

## Status

Accepted

---

## Date

2026-07-22

---

## Context

Global Career AI inicialmente evaluaba experiencia profesional mediante
competencias individuales.

El sistema era capaz de determinar:

- qué competencias aparecen en una experiencia profesional;
- qué nivel de evidencia tiene cada competencia;
- qué tan confiable es la evidencia encontrada.

Sin embargo, una evaluación profesional real requiere una visión superior.

Los perfiles profesionales no están definidos únicamente por competencias
aisladas, sino por dominios completos de conocimiento.

Ejemplo:

Procurement no es una sola habilidad.

Está compuesto por:

- Supplier Management
- Purchase Management
- Negotiation
- Cost Control

Por esta razón se requiere una capa superior capaz de agrupar y evaluar
competencias relacionadas dentro de dominios profesionales.

---

# Decision

Se introduce el **Knowledge Domain Intelligence Engine**.

Esta capa será responsable de transformar resultados individuales de
competencias en evaluaciones agregadas de dominios de conocimiento.

La nueva arquitectura será:
Professional Experience

    |

    v

Competency Evaluation

    |

    v

Knowledge Domain Evaluation

    |

    v

Knowledge Intelligence


---

# Architecture

## Input

El motor recibe:


CompetencyEvaluationResult[]


Cada elemento contiene:

- competency score;
- evidence strength;
- confidence;
- evidence classification;
- matched evidence.

---

## Domain Catalog

Los dominios se definen mediante contratos estáticos.

Ejemplo:


Procurement

|
+-- supplier_management
|
+-- purchase_management
|
+-- negotiation
|
+-- cost_control


Implementación:


lib/knowledge/domains/procurementDomain.ts


---

## Domain Evaluation

El evaluador procesa:


KnowledgeDomain

CompetencyEvaluationResult[]


y genera:


KnowledgeDomainEvaluationResult


Conteniendo:

- domain;
- overall score;
- evidence score;
- confidence;
- competency count;
- contributing competencies.

---

# Implemented Components

## Knowledge Contracts


lib/knowledge/knowledgeTypes.ts


Responsabilidad:

Definir:

- KnowledgeDomain
- KnowledgeDomainEvaluationResult


---

## Domain Catalog


lib/knowledge/domains/procurementDomain.ts


Responsabilidad:

Definir el primer dominio profesional.

---

## Domain Evaluator


lib/knowledge/evaluation/knowledgeDomainEvaluator.ts


Responsabilidad:

Evaluar cualquier dominio sin lógica específica del dominio.

---

## Validation Script


scripts/testKnowledgeDomainEvaluator.ts


Responsabilidad:

Validar el flujo completo:

Experience Text

↓

Competency Evaluation

↓

Knowledge Domain Evaluation

---

# Validation

Validated successfully:


npm run typecheck
PASS

npm run lint
PASS

npx tsx scripts/testKnowledgeDomainEvaluator.ts
PASS


Example result:


Domain:
Procurement

Score:
0.408

Evidence Score:
0.605

Confidence:
0.605

Competencies:
4


---

# Design Principles

The Knowledge Domain Intelligence Engine follows:

## Separation of Concerns

Domain definitions are separated from evaluation logic.

---

## Extensibility

New domains can be added without modifying the evaluator.

Examples:

- Finance
- Logistics
- Manufacturing
- Healthcare
- Information Technology

---

## Domain Knowledge Evolution

The system can evolve toward:

- weighted domains;
- hierarchical knowledge models;
- knowledge graphs;
- career intelligence;
- learning recommendations.

---

# Future Evolution

Potential future ADRs:

## ADR-013.1

Domain Scoring Strategy

Introduce domain-specific competency weighting.

---

## ADR-013.2

Knowledge Domain Hierarchy

Support relationships between domains and subdomains.

---

## ADR-013.3

Knowledge Graph Integration

Represent professional knowledge as interconnected entities.

---

# Conclusion

ADR-013 introduces the first layer capable of evaluating professional
knowledge at a domain level.

This moves Global Career AI from competency detection toward professional
intelligence modeling.