# Global Career AI V1.0

# Architectural Decisions

## Architecture Decision Record Repository

**Document Type:** Architecture Governance Document  
**Version:** 1.0  
**Status:** Foundational Document  
**Classification:** Internal Engineering Documentation  
**Owner:** Global Career AI Engineering  
**Related Documents:**

- ENGINEERING_CONSTITUTION.md
- DOCUMENTATION_STANDARDS.md
- GLOBAL_CAREER_AI_ARCHITECTURE.md

---

# 1. Purpose

## Objective

This document records the major architectural decisions that define the design and evolution of Global Career AI.

Its purpose is to preserve:

- Technical reasoning.
- Architectural context.
- Design alternatives.
- Long-term consequences.

---

## Why Architectural Decisions Matter

Software architecture is shaped not only by implementation.

It is shaped by decisions.

Every important decision creates consequences that affect:

- Maintainability.
- Scalability.
- Security.
- Future development.

This document ensures that future evolution understands the reasoning behind the current architecture.

---

# Decision Documentation Principle

Global Career AI follows this principle:

> A technical decision without documented reasoning becomes a future uncertainty.

---

# 2. ADR Process

## Overview

Architectural Decision Records (ADR) provide a structured method for documenting significant technical choices.

An ADR explains:

- The problem.
- The available options.
- The selected approach.
- The consequences.

---

# When an ADR Is Required

An ADR should be created when a decision affects:

- Core architecture.
- Data flow.
- Security boundaries.
- Major dependencies.
- Business engine structure.
- System evolution.

---

# ADR Structure

Every architectural decision follows this format:

```text
ADR Number

Title

Status

Context

Problem

Decision

Alternatives Considered

Consequences

Implementation Notes

References

ADR Status Values

Architectural decisions may have:

Proposed

Accepted

Implemented

Superseded

Deprecated
ADR Quality Principle

An ADR is successful when a future engineer can understand:

What was decided.
Why it was decided.
What impact it created.
3. Architectural Decision Index

The following decisions define the foundation of Global Career AI V1.0:

ADR	Decision
ADR-001	Engine Contracts as Source of Truth
ADR-002	Orchestrator V7 Architecture
ADR-003	Clean Architecture Adoption
ADR-004	Strong Type Safety Strategy
ADR-005	Core Engine Independence
ADR-006	Learning System Separation
ADR-007	Validation Boundary Strategy
ADR-008	Documentation Governance

End of Part 1
# ADR-001 — Engine Contracts as Source of Truth

## Status

Accepted

## Date

2026-07-14

## Decision Type

Core Architecture Decision

---

# Context

As Global Career AI evolved, multiple business capabilities were introduced:

- ATS Analysis.
- Scoring.
- Ranking.
- Decision Support.
- Recommendations.
- Learning Intelligence.

Each capability required communication with other parts of the system.

Without a centralized contract strategy, the system could develop:

- Different interpretations of the same data.
- Inconsistent interfaces.
- Hidden dependencies.
- Difficult maintenance.

---

# Problem

How can Global Career AI ensure that multiple business engines communicate consistently while maintaining independence?

The architecture required a mechanism that could provide:

- Stable communication.
- Strong typing.
- Clear ownership.
- Future evolution capability.

---

# Alternatives Considered

## Alternative 1 — Direct Engine Communication

### Description

Allow engines to communicate directly using locally defined structures.

---

### Advantages

- Simple initial implementation.
- Faster development at small scale.

---

### Disadvantages

- Creates tight coupling.
- Increases dependency between engines.
- Makes future changes risky.

---

## Alternative 2 — Shared Implicit Structures

### Description

Allow multiple components to share similar data models without a formal contract.

---

### Advantages

- Reduced initial documentation effort.

---

### Disadvantages

- No clear ownership.
- Difficult to maintain.
- Possible structural divergence.

---

## Alternative 3 — Centralized Engine Contracts

### Description

Create explicit shared contracts that define communication between engines.

---

### Advantages

- Single source of truth.
- Strong type safety.
- Clear ownership.
- Predictable communication.

---

### Disadvantages

- Requires discipline.
- Requires contract maintenance.

---

# Decision

Global Career AI adopts centralized Engine Contracts as the official communication foundation between business components.

Contracts become the single source of truth for:

- Inputs.
- Outputs.
- Shared business structures.
- Engine communication.

---

# Architectural Principle

The system follows this rule:

> Components may evolve independently, but communication contracts must remain explicit and stable.

---

# Consequences

## Positive Consequences

This decision provides:

### Strong Type Safety

The compiler can detect incompatible changes earlier.

---

### Reduced Coupling

Engines remain independent while sharing defined communication standards.

---

### Better Maintainability

Future engineers can understand system relationships through contracts.

---

### Safer Evolution

New capabilities can be added without redesigning existing communication patterns.

---

## Negative Consequences

This decision requires:

- Maintaining contract definitions.
- Reviewing changes carefully.
- Avoiding unnecessary contract modifications.

---

# Implementation Impact

The architecture establishes:

- Central contract definitions.
- Shared domain models.
- Explicit engine interfaces.
- Predictable orchestration communication.

---

# Long-Term Value

Engine Contracts create a stable foundation for future expansion.

As Global Career AI grows, new intelligence capabilities can integrate through established architectural boundaries.

---

# Final Decision Statement

Engine Contracts are the architectural language of Global Career AI.

They define how independent intelligence components communicate while preserving system clarity and reliability.

---

**ADR-001 Status:** Accepted

**End of ADR-001**

# ADR-002 — Orchestrator V7 Architecture

## Status

Accepted

## Date

2026-07-14

## Decision Type

Core Runtime Architecture Decision

---

# Context

Global Career AI requires coordination between multiple intelligent components:

- ATS Engine.
- Scoring Pipeline.
- Ranking Engine.
- Decision Engine.
- Recommendation Engine.
- Learning Intelligence.

As the platform evolved, direct execution flows became increasingly complex.

A centralized coordination mechanism was required to manage:

- Execution order.
- Engine communication.
- Result aggregation.
- Workflow consistency.

---

# Problem

How can Global Career AI coordinate multiple intelligence engines while preserving:

- Engine independence.
- Clear responsibilities.
- Strong contracts.
- Future scalability?

The architecture needed a coordinator that could manage workflows without becoming a source of business logic complexity.

---

# Previous Challenges

Before the current architecture, workflow coordination could introduce:

- Scattered execution logic.
- Hidden dependencies.
- Duplicate decision processes.
- Difficult maintenance.

As the number of capabilities increased, the system required a stronger architectural boundary.

---

# Alternatives Considered

## Alternative 1 — Distributed Workflow Logic

### Description

Allow each engine or feature module to manage its own execution flow.

---

### Advantages

- Local implementation simplicity.
- Less central coordination code.

---

### Disadvantages

- Workflow logic becomes fragmented.
- Difficult to understand complete execution paths.
- Higher risk of inconsistent behavior.

---

## Alternative 2 — Large Central Business Controller

### Description

Create a single controller containing all business decisions.

---

### Advantages

- Simple visibility.
- Centralized execution.

---

### Disadvantages

- Creates a large monolithic component.
- Violates separation of responsibilities.
- Difficult to evolve.

---

## Alternative 3 — Contract-Driven Orchestrator Architecture

### Description

Use a dedicated orchestrator responsible only for workflow coordination.

---

### Advantages

- Clear responsibility.
- Preserves engine independence.
- Supports future expansion.
- Maintains predictable execution.

---

### Disadvantages

- Requires strong contracts.
- Requires disciplined architecture.

---

# Decision

Global Career AI adopts the Orchestrator V7 architecture as the official workflow coordination model.

The orchestrator is responsible for:

- Receiving validated inputs.
- Executing defined workflows.
- Coordinating engines.
- Aggregating results.

---

# Architectural Principle

The system follows this rule:

> The orchestrator coordinates intelligence; it does not implement intelligence.

---

# Orchestrator Responsibilities

The Orchestrator V7 manages:

## Workflow Execution

Controls the sequence of operations.

---

## Engine Coordination

Invokes specialized engines through contracts.

---

## Result Aggregation

Combines outputs into structured responses.

---

## Execution Consistency

Maintains predictable system behavior.

---

# Orchestrator Non-Responsibilities

The Orchestrator does not:

- Calculate ATS scores.
- Implement ranking algorithms.
- Own recommendation logic.
- Store domain knowledge.
- Replace business engines.

---

# Consequences

## Positive Consequences

### Clear Architecture

Workflow responsibility has a defined location.

---

### Engine Independence

Business engines can evolve independently.

---

### Improved Testing

Individual engines can be tested separately from workflows.

---

### Safer Evolution

New capabilities can be added without restructuring the entire system.

---

## Negative Consequences

The architecture requires:

- Maintaining orchestration contracts.
- Careful workflow design.
- Avoiding excessive orchestrator responsibilities.

---

# Implementation Impact

The Orchestrator V7 establishes:

- Contract-driven execution.
- Type-safe workflow coordination.
- Clear separation between coordination and intelligence.

---

# Long-Term Value

The Orchestrator V7 provides the foundation for future capabilities such as:

- Additional intelligence engines.
- New career workflows.
- Multi-domain expansion.
- Advanced automation.

---

# Final Decision Statement

Orchestrator V7 is the execution backbone of Global Career AI.

It provides coordination without sacrificing modularity, allowing the platform to grow while preserving architectural integrity.

---

**ADR-002 Status:** Accepted

**End of ADR-002**
# ADR-003 — Clean Architecture Adoption

## Status

Accepted

## Date

2026-07-14

## Decision Type

System Architecture Decision

---

# Context

As Global Career AI expanded, the platform introduced multiple responsibilities:

- User interfaces.
- API communication.
- Validation.
- Business engines.
- Learning intelligence.
- Data persistence.
- Infrastructure services.

Without clear architectural boundaries, system growth could create:

- Strong coupling.
- Difficult maintenance.
- Unclear ownership.
- Reduced flexibility.

---

# Problem

How can Global Career AI grow in functionality while preserving:

- Business logic independence.
- Maintainability.
- Testability.
- Future adaptability?

---

# Alternatives Considered

## Alternative 1 — Feature-Centric Mixed Architecture

### Description

Place UI, API, business logic, and data access together by feature.

---

### Advantages

- Fast initial development.
- Simple small-scale organization.

---

### Disadvantages

- Responsibilities become mixed.
- Difficult long-term maintenance.
- Higher coupling.

---

## Alternative 2 — Monolithic Application Structure

### Description

Centralize most functionality into a single application layer.

---

### Advantages

- Simple deployment model.
- Easy initial navigation.

---

### Disadvantages

- Poor scalability.
- Difficult component isolation.
- High risk of architectural degradation.

---

## Alternative 3 — Clean Architecture Model

### Description

Separate the system into layers with clear dependency boundaries.

---

### Advantages

- Independent business logic.
- Better testing.
- Controlled evolution.
- Clear responsibilities.

---

### Disadvantages

- Requires architectural discipline.
- Requires additional structure.

---

# Decision

Global Career AI adopts Clean Architecture principles as the official architectural model.

The system separates:

- Presentation concerns.
- Application workflows.
- Domain intelligence.
- Infrastructure implementation.

---

# Architectural Principle

The platform follows:

> Business intelligence must remain independent from technical implementation details.

---

# Consequences

## Positive Consequences

### Improved Maintainability

Each responsibility has a defined location.

---

### Better Testing

Components can be evaluated independently.

---

### Safer Evolution

New technologies can be introduced without rewriting business logic.

---

## Negative Consequences

The architecture requires:

- Clear boundaries.
- More deliberate design.
- Strong discipline during development.

---

# Final Decision Statement

Clean Architecture provides the structural foundation that allows Global Career AI to evolve without losing clarity.

---

**ADR-003 Status:** Accepted


---

# ADR-004 — Strong Type Safety Strategy

## Status

Accepted

## Date

2026-07-14

## Decision Type

Engineering Reliability Decision

---

# Context

Global Career AI contains multiple intelligent components exchanging complex information.

The system depends on reliable communication between:

- Engines.
- Orchestrators.
- APIs.
- Learning components.
- Data boundaries.

Weak typing could introduce:

- Runtime failures.
- Unexpected structures.
- Hidden incompatibilities.

---

# Problem

How can Global Career AI reduce errors and increase confidence during system evolution?

---

# Alternatives Considered

## Alternative 1 — Flexible Dynamic Structures

### Description

Allow unrestricted data structures using weak typing.

---

### Advantages

- Faster experimentation.
- Less initial definition work.

---

### Disadvantages

- More runtime errors.
- Reduced predictability.
- Harder maintenance.

---

## Alternative 2 — Partial Type Safety

### Description

Use types only in selected areas.

---

### Advantages

- Balanced initial effort.

---

### Disadvantages

- Leaves critical areas vulnerable.
- Creates inconsistent reliability.

---

## Alternative 3 — Strict Type Safety

### Description

Use explicit types and contracts across critical system boundaries.

---

### Advantages

- Earlier error detection.
- Better maintainability.
- Stronger architecture.

---

### Disadvantages

- Requires more design discipline.

---

# Decision

Global Career AI adopts strong type safety as a core engineering principle.

The system prioritizes:

- Explicit interfaces.
- Defined contracts.
- Predictable structures.
- Compile-time validation.

---

# Type Safety Principle

The platform follows:

> Errors should be discovered during development whenever possible, not during production execution.

---

# Implementation Impact

Strong type safety is applied through:

- TypeScript strict configuration.
- Engine Contracts.
- Domain models.
- Validation schemas.
- Explicit interfaces.

---

# Consequences

## Positive Consequences

### Increased Reliability

Many structural problems are detected before deployment.

---

### Improved Refactoring

Large architectural changes become safer.

---

### Better Developer Understanding

Types document system expectations.

---

## Negative Consequences

Requires:

- Maintaining accurate definitions.
- Reviewing type changes carefully.

---

# Final Decision Statement

Strong Type Safety is a foundational reliability mechanism for Global Career AI V1.0.

---

**ADR-004 Status:** Accepted


**End of Part 4**

# ADR-005 — Core Engine Independence

## Status

Accepted

## Date

2026-07-14

## Decision Type

Core Domain Architecture Decision

---

# Context

Global Career AI is composed of multiple specialized intelligence engines.

The platform includes capabilities such as:

- ATS Analysis.
- Scoring.
- Ranking.
- Decision Support.
- Recommendations.
- Learning Intelligence.

Each capability represents a different business responsibility.

As the system grows, maintaining independence between these capabilities becomes essential.

---

# Problem

How can Global Career AI allow specialized engines to evolve independently while maintaining consistent system behavior?

The architecture must avoid:

- Direct dependencies between engines.
- Shared internal implementation details.
- Uncontrolled communication patterns.

---

# Alternatives Considered

## Alternative 1 — Fully Coupled Engine Architecture

### Description

Allow engines to directly access each other's internal logic.

---

### Advantages

- Fast initial implementation.
- Simple direct communication.

---

### Disadvantages

- Creates strong coupling.
- Makes changes risky.
- Reduces testing isolation.

---

## Alternative 2 — Single Intelligence Engine

### Description

Combine all intelligence capabilities into one large processing component.

---

### Advantages

- Centralized logic.
- Simplified initial structure.

---

### Disadvantages

- Creates a monolithic design.
- Difficult to maintain.
- Limits future expansion.

---

## Alternative 3 — Independent Contract-Based Engines

### Description

Maintain specialized engines that communicate only through defined contracts.

---

### Advantages

- Clear responsibilities.
- Independent evolution.
- Better testing.
- Reduced architectural risk.

---

### Disadvantages

- Requires contract discipline.
- Requires clear domain boundaries.

---

# Decision

Global Career AI adopts independent core engines as the official domain architecture model.

Each engine owns a specific business capability and communicates through established contracts.

---

# Architectural Principle

The system follows:

> Each engine owns its intelligence. No engine owns another engine.

---

# Engine Responsibilities

## ATS Engine

Responsible for career document and requirement analysis.

---

## Scoring Engine

Responsible for evaluation and scoring processes.

---

## Ranking Engine

Responsible for prioritization and ordering of opportunities.

---

## Decision Engine

Responsible for structured decision generation.

---

## Recommendation Engine

Responsible for improvement and action guidance.

---

# Engine Communication Model

Engines communicate through:

- Explicit contracts.
- Defined inputs.
- Defined outputs.
- Controlled workflows.

---

# Consequences

## Positive Consequences

### Better Maintainability

Each engine can evolve independently.

---

### Better Testing

Individual intelligence capabilities can be tested separately.

---

### Easier Expansion

New engines can be introduced without redesigning the entire system.

---

### Clear Ownership

Each business capability has a defined responsibility.

---

## Negative Consequences

The architecture requires:

- Maintaining stable contracts.
- Preventing hidden dependencies.
- Reviewing engine boundaries regularly.

---

# Implementation Impact

This decision establishes:

- Modular business intelligence.
- Contract-driven communication.
- Independent domain ownership.

---

# Long-Term Value

Engine independence allows Global Career AI to expand its intelligence capabilities while preserving architectural stability.

Future capabilities can be added as new specialized engines without compromising existing behavior.

---

# Final Decision Statement

Core Engine Independence is a fundamental design principle of Global Career AI V1.0.

The platform grows by adding capabilities, not by increasing internal dependency.

---

**ADR-005 Status:** Accepted

**End of ADR-005**

# ADR-006 — Learning System Separation

## Status

Accepted

## Date

2026-07-14

## Decision Type

Intelligence Architecture Decision

---

# Context

Global Career AI includes an adaptive learning capability designed to improve system intelligence through:

- Historical data.
- User feedback.
- System outcomes.
- Learning signals.
- Semantic relationships.

As learning capabilities evolve, they introduce a different type of responsibility from deterministic business execution.

The core system requires stability, predictability, and controlled behavior.

The learning system requires experimentation, adaptation, and continuous improvement.

---

# Problem

How can Global Career AI introduce learning capabilities while preserving the reliability of the core business architecture?

The architecture must prevent learning processes from:

- Directly modifying core execution.
- Introducing unpredictable behavior.
- Bypassing established contracts.
- Reducing system explainability.

---

# Alternatives Considered

## Alternative 1 — Integrated Learning Inside Core Engines

### Description

Place learning logic directly inside business engines.

---

### Advantages

- Direct access to execution context.
- Faster initial integration.

---

### Disadvantages

- Mixes deterministic and adaptive behavior.
- Makes testing harder.
- Reduces predictability.

---

## Alternative 2 — Independent Learning Layer

### Description

Create a separate learning architecture connected through defined signals and events.

---

### Advantages

- Preserves core stability.
- Allows independent evolution.
- Supports experimentation.
- Maintains clear responsibilities.

---

### Disadvantages

- Requires event communication.
- Requires additional architecture.

---

## Alternative 3 — External Learning Service

### Description

Move all learning capabilities into a completely separate external system.

---

### Advantages

- Strong separation.
- Independent scaling.

---

### Disadvantages

- Increased complexity.
- More integration overhead.
- Reduced internal visibility.

---

# Decision

Global Career AI adopts a separated Learning Intelligence Architecture.

The Learning System operates as an independent intelligence layer connected through:

- Learning Events.
- Learning Signals.
- Memory Systems.
- Defined integration boundaries.

---

# Architectural Principle

The system follows:

> Learning may improve intelligence, but it must not compromise core reliability.

---

# Core System Responsibilities

The Core System remains responsible for:

- Deterministic execution.
- Business rules.
- Contract compliance.
- User-facing decisions.

---

# Learning System Responsibilities

The Learning System manages:

- Event processing.
- Knowledge accumulation.
- Pattern identification.
- Adaptive signals.
- Semantic intelligence.

---

# Learning Integration Model

The architecture follows:

Core Execution

  |

Learning Event Generation

  |

Learning Processing

  |

Knowledge Storage

  |

Adaptive Intelligence Signals

  |

Future Improvement


---

# Consequences

## Positive Consequences

### Improved Stability

Core execution remains predictable.

---

### Controlled Intelligence Growth

Learning capabilities can evolve independently.

---

### Better Explainability

The system can separate:

- Current decision logic.
- Learning influence.

---

### Safer Experimentation

New learning approaches can be tested without affecting core workflows.

---

## Negative Consequences

The architecture requires:

- Event management.
- Learning boundary discipline.
- Clear signal definitions.

---

# Implementation Impact

This decision establishes separation between:

## Core Domain

Responsible for:

- Execution.
- Business intelligence.
- Deterministic behavior.

---

## Learning Domain

Responsible for:

- Improvement.
- Memory.
- Adaptation.

---

# Long-Term Value

Learning System Separation enables Global Career AI to become progressively more intelligent while preserving architectural trust.

---

# Final Decision Statement

The Learning System is an intelligence enhancement layer, not a replacement for the Core Architecture.

This separation allows Global Career AI to evolve safely.

---

**ADR-006 Status:** Accepted

**End of ADR-006**

# ADR-007 — Validation Boundary Strategy

## Status

Accepted

## Date

2026-07-14

## Decision Type

System Reliability and Security Decision

---

# Context

Global Career AI receives information from multiple external and internal sources:

- User inputs.
- API requests.
- Application data.
- Career documents.
- External integrations.

External information cannot be assumed to be correct or complete.

The Core Runtime requires reliable and structured information to execute business workflows safely.

---

# Problem

How can Global Career AI protect internal business execution from invalid or unexpected data?

The architecture must prevent:

- Invalid structures entering core processing.
- Runtime failures caused by malformed inputs.
- Security risks from uncontrolled data.
- Inconsistent business behavior.

---

# Alternatives Considered

## Alternative 1 — Validation Inside Each Engine

### Description

Allow every business engine to validate its own incoming information.

---

### Advantages

- Local responsibility.
- Simple engine implementation.

---

### Disadvantages

- Duplicate validation logic.
- Inconsistent validation rules.
- Increased maintenance complexity.

---

## Alternative 2 — No Formal Validation Boundary

### Description

Allow data to flow directly into business execution.

---

### Advantages

- Faster initial implementation.

---

### Disadvantages

- Higher failure risk.
- Reduced reliability.
- Increased security exposure.

---

## Alternative 3 — Central Validation Boundary

### Description

Create a dedicated validation layer before business execution.

---

### Advantages

- Consistent validation.
- Clear responsibility.
- Protected core execution.

---

### Disadvantages

- Requires maintaining validation schemas.
- Adds an architectural layer.

---

# Decision

Global Career AI adopts a centralized Validation Boundary Strategy.

All external information must pass through validation before entering core workflows.

---

# Architectural Principle

The system follows:

> Untrusted information must become trusted information before business execution.

---

# Validation Responsibilities

The Validation Layer manages:

## Structure Validation

Ensures incoming information follows expected formats.

---

## Type Validation

Ensures values match defined system expectations.

---

## Business Input Validation

Ensures required information exists before processing.

---

## Boundary Protection

Prevents invalid information from reaching internal components.

---

# Validation Flow

The architecture follows:

External Input

  |

Validation Layer

  |

Validated Data Contract

  |

Orchestrator

  |

Business Engines

  |

Result Generation


---

# Relationship With Engine Contracts

Validation and Engine Contracts work together.

Validation ensures:

- Data entering the system is correct.

Contracts ensure:

- Internal communication remains consistent.

---

# Consequences

## Positive Consequences

### Improved Reliability

Invalid data is detected early.

---

### Better Security

Input risks are reduced before execution.

---

### Consistent Behavior

All workflows receive predictable structures.

---

### Easier Debugging

Failures occur closer to their source.

---

## Negative Consequences

The architecture requires:

- Maintaining schemas.
- Updating validation rules with contract changes.
- Reviewing boundary changes carefully.

---

# Implementation Impact

This decision establishes:

- Validation as an architectural boundary.
- Schema-driven protection.
- Safer Core Runtime execution.

---

# Long-Term Value

A strong validation boundary allows Global Career AI to integrate more capabilities while maintaining system reliability.

---

# Final Decision Statement

Validation is not only a data quality mechanism.

It is an architectural protection layer that preserves the integrity of Global Career AI.

---

**ADR-007 Status:** Accepted

**End of ADR-007**

# ADR-008 — Documentation Governance

## Status

Accepted

## Date

2026-07-14

## Decision Type

Engineering Governance Decision

---

# Context

Global Career AI is a continuously evolving intelligent platform.

As the system grows, architectural complexity increases through:

- New capabilities.
- New integrations.
- New intelligence models.
- New operational requirements.

Without a structured documentation strategy, important knowledge can be lost.

---

# Problem

How can Global Career AI preserve architectural knowledge and ensure that future evolution remains aligned with the original engineering principles?

The project requires a system that maintains:

- Decision history.
- Architectural context.
- Technical understanding.
- Engineering continuity.

---

# Alternatives Considered

## Alternative 1 — Documentation as Optional Material

### Description

Create documentation only when considered necessary.

---

### Advantages

- Less initial effort.
- Faster short-term development.

---

### Disadvantages

- Knowledge can be lost.
- Decisions become difficult to understand.
- Future maintenance becomes harder.

---

## Alternative 2 — Documentation as Code Comments Only

### Description

Rely mainly on comments inside source files.

---

### Advantages

- Information remains close to implementation.

---

### Disadvantages

- Does not preserve architectural reasoning.
- Cannot describe complete system behavior.
- Difficult to organize.

---

## Alternative 3 — Documentation as Engineering Asset

### Description

Treat documentation as a permanent part of the architecture.

---

### Advantages

- Preserves knowledge.
- Improves maintainability.
- Supports future evolution.
- Creates engineering continuity.

---

### Disadvantages

- Requires ongoing maintenance.
- Requires documentation discipline.

---

# Decision

Global Career AI adopts Documentation Governance as an official engineering practice.

Documentation is considered part of the system architecture.

---

# Architectural Principle

The system follows:

> Code defines behavior. Documentation preserves understanding.

---

# Documentation Responsibilities

The documentation system preserves:

## Architecture Knowledge

Including:

- System structure.
- Component responsibilities.
- Design principles.

---

## Decision History

Including:

- Problems considered.
- Alternatives evaluated.
- Decisions selected.

---

## Operational Knowledge

Including:

- Procedures.
- Maintenance practices.
- System requirements.

---

# Documentation Relationship With Architecture

Documentation supports:

- Architecture evolution.
- Engineering decisions.
- Knowledge transfer.
- Long-term maintainability.

---

# Consequences

## Positive Consequences

### Preserved Knowledge

Important decisions remain available over time.

---

### Better Evolution

Future changes can respect previous architectural reasoning.

---

### Improved Collaboration

Engineers share a common understanding of the system.

---

### Reduced Architectural Drift

The project maintains alignment with established principles.

---

## Negative Consequences

Requires:

- Continuous updates.
- Review discipline.
- Documentation ownership.

---

# Implementation Impact

This decision establishes:

- ENGINEERING_CONSTITUTION.md as architectural governance.
- DOCUMENTATION_STANDARDS.md as documentation rules.
- ADR records as decision history.

---

# Long-Term Value

Documentation Governance ensures that Global Career AI remains understandable as the platform evolves.

---

# Final Decision Statement

Documentation is a permanent engineering asset of Global Career AI.

The system preserves not only software functionality, but also the knowledge required to maintain and improve it.

---

**ADR-008 Status:** Accepted

**End of ADR-008**

---

## ADR-009 — Evidence Based Matching Engine Scoring

### Estado

Aceptado

### Fecha

2026-07-18

### Contexto

El Matching Engine de Global Career AI requiere evolucionar desde un modelo basado únicamente en coincidencias de palabras hacia un sistema capaz de evaluar evidencia real del candidato frente a los requisitos de una oportunidad laboral.

Un sistema de matching tradicional puede generar falsos positivos al considerar equivalentes diferentes niveles de información:

* Experiencia laboral demostrada.
* Habilidades declaradas.
* Educación relacionada.
* Certificaciones.
* Cursos realizados.
* Palabras clave repetidas.

Sin una evaluación del contexto, un candidato puede recibir una puntuación elevada solamente por mencionar una habilidad, aunque no exista evidencia suficiente de experiencia práctica.

Global Career AI debe diferenciar entre una habilidad declarada y una capacidad demostrada.

### Decisión

El Matching Engine utilizará un modelo de puntuación basado en evidencia contextual del candidato.

El sistema evaluará:

1. Qué requisito solicita la vacante.
2. Qué evidencia existe dentro del CV.
3. Qué nivel de relevancia tiene esa evidencia.
4. Cuánto debe contribuir al resultado final.

La evidencia del candidato tendrá diferentes niveles de valor.

Orden de prioridad:

1. Experiencia laboral demostrada.
2. Proyectos o aplicaciones prácticas.
3. Skills declaradas.
4. Certificaciones profesionales.
5. Educación relacionada.
6. Cursos o formación complementaria.
7. Keywords sin evidencia adicional.

Los pesos serán administrados centralmente mediante `weights.ts`.

El algoritmo no contendrá valores numéricos fijos dentro de la lógica de scoring.

### Principios del algoritmo

#### 1. La experiencia demostrada tiene mayor valor que una declaración

Una habilidad mencionada dentro de experiencia laboral tendrá mayor peso que la misma habilidad encontrada únicamente en una lista de conocimientos.

Ejemplo:

Candidato A:

```
Experiencia:
5 años operando maquinaria pesada en minería.
```

Candidato B:

```
Skills:
Maquinaria pesada.
```

Ambos contienen la misma habilidad, pero la evidencia no tiene el mismo valor.

El sistema debe reflejar esa diferencia.

#### 2. La coincidencia de palabras no equivale a experiencia

El Matching Engine no debe interpretar una coincidencia textual como una capacidad profesional automáticamente.

Una palabra clave puede indicar:

* experiencia real,
* conocimiento básico,
* formación,
* interés,
* o simplemente una mención aislada.

La puntuación debe depender de la calidad de la evidencia.

#### 3. Acumulación controlada de evidencia

El sistema permitirá combinar diferentes evidencias relacionadas con un mismo requisito.

Sin embargo, cada habilidad tendrá límites máximos de contribución para evitar inflación artificial.

La repetición de una misma palabra en diferentes partes del CV no podrá dominar el resultado únicamente por frecuencia.

#### 4. Reducción del impacto por repetición

La frecuencia de aparición de una palabra tendrá rendimiento decreciente.

El sistema dará mayor importancia a la primera evidencia relevante y reducirá el impacto de repeticiones posteriores.

Objetivo:

Evitar que CVs optimizados con palabras clave superen candidatos con experiencia real.

#### 5. Explicabilidad obligatoria

El Matching Engine deberá conservar las razones utilizadas para calcular cada resultado.

El sistema debe poder explicar:

* Qué requisito fue evaluado.
* Qué evidencia encontró.
* Dónde apareció dentro del CV.
* Qué peso recibió.
* Cómo contribuyó al score final.

Ejemplo:

```
Match Score: 87%

Razones:

+40 Experiencia laboral comprobada en operación de maquinaria.
+20 Skill relacionada declarada.
+15 Certificación relevante.
-10 Falta experiencia específica requerida.
```

### Consecuencias positivas

* Reduce falsos positivos.
* Mejora la calidad de recomendaciones laborales.
* Diferencia experiencia real de conocimiento declarado.
* Aumenta la confianza del usuario.
* Permite explicaciones transparentes.
* Prepara la integración futura con Learning System.
* Mantiene separación entre configuración y lógica.

### Riesgos aceptados

* Los pesos iniciales requerirán calibración con datos reales.
* La calidad del resultado dependerá de la extracción correcta de información del CV.
* El modelo necesitará validación continua mediante feedback del sistema.

### Próximos pasos técnicos

1. Definir el modelo interno de evidencia del candidato.
2. Crear estructuras internas del Matching Engine.
3. Integrar pesos contextuales en el pipeline de scoring.
4. Implementar cálculo de contribuciones explicables.
5. Crear pruebas con escenarios reales.
6. Validar resultados con diferentes tipos de CV.

# ADR-010 — Evidence Layer Integration Strategy

**Status:** Accepted  
**Date:** 2026-07-18

## Context

The current Matching Engine evaluates compatibility between a candidate CV and a job opportunity using aggregated scoring logic based on available CV information, job requirements, skills, and contextual attributes.

During the evolution toward a more explainable and reliable matching system, a limitation was identified:

The existing scoring model can determine similarity between candidate and opportunity, but it does not explicitly measure the strength and quality of the evidence supporting each match.

A candidate may contain a keyword, skill, or related experience, but the system must distinguish between:

* Verified direct experience.
* Related professional experience.
* Transferable skills.
* Weak or irrelevant signals.

Without an evidence evaluation layer, the system risks overestimating compatibility based only on textual similarity.

## Decision

A new Evidence Layer will be introduced as an additional intelligence layer inside the Matching Engine architecture.

The Evidence Layer will generate an Evidence Score based on the quality, relevance, and strength of detected candidate evidence.

The Evidence Score will not immediately replace the existing Matching Score.

Instead, it will operate as a hybrid scoring component that enhances the existing Matching Engine through additional evidence validation and confidence adjustment.

The Evidence Score will initially operate in **shadow mode**, running alongside the existing scoring system without affecting production decisions.

The purpose of shadow mode is:

* Validate scoring behavior.
* Compare Evidence Score results against existing Matching Scores.
* Measure improvement in recommendation accuracy.
* Identify unexpected scoring patterns.
* Tune evidence weights before production integration.

## Approved Architecture
CV Analyzer
|
↓
Candidate Evidence Extraction
|
↓
Evidence Evaluation Layer
|
↓
Evidence Score
|
↓
Base Matching Score
|
+
Confidence Adjustment
|
↓
Final Match Result

The final matching decision will follow a hybrid model:
Base Matching Score
+
Evidence Score
+
Confidence Adjustment
↓
Final Match Result


This approach preserves existing scoring behavior while allowing evidence-based intelligence to progressively improve matching accuracy.

## Evidence Classification Model

Each detected evidence item must be classified according to contextual relevance:

### Direct Evidence

Evidence that directly demonstrates the required skill, role, certification, or experience.

Example:

* Job requires welding.
* CV contains professional welding experience.

### Related Evidence

Evidence that belongs to a closely connected domain.

Example:

* Job requires industrial maintenance.
* CV contains mechanical equipment maintenance.

### Transferable Evidence

Evidence that provides supporting capability but does not prove direct experience.

Example:

* Job requires mining experience.
* CV contains heavy equipment operation in agriculture.

### Irrelevant Evidence

Evidence that does not contribute meaningful compatibility.

## Evidence Accumulation Rules

The Evidence Layer must avoid artificial score inflation.

Approved rules:

* Multiple confirmations of the same evidence type have diminishing returns.
* Each skill has a maximum accumulation limit.
* Additional evidence only increases confidence when it provides independent support.
* Repeated keywords alone cannot significantly increase the final score.

## Weight Management Strategy

Evidence weights will be externalized and configurable.

Initial weight categories:

* Evidence type weight.
* Experience duration adjustment.
* Context relevance adjustment.
* Confidence adjustment.
* Maximum contribution limits.

Weights will be maintained separately from scoring logic to allow calibration without architectural changes.

## Consequences

### Positive Consequences

* More explainable recommendations.
* Better distinction between real experience and keyword similarity.
* Reduced false positive matches.
* Improved transparency for candidates and employers.
* Foundation for future AI learning calibration.

### Trade-offs

* Additional processing layer.
* More complex scoring pipeline.
* Requires validation before increasing Evidence Score influence.

## Migration Strategy

The Evidence Layer will follow a progressive adoption model:

### Phase 1 — Shadow Mode

Evidence Score calculated but not used for final ranking.

### Phase 2 — Hybrid Assisted Scoring

Evidence Score contributes partially to final matching decisions through confidence adjustment and controlled weighting.

### Phase 3 — Evidence Driven Matching

Evidence Score becomes a primary intelligence component of the Matching Engine.

Migration will only proceed after validation metrics demonstrate improved recommendation quality.

## Implementation Constraints

The Evidence Layer must preserve:

* Existing engine contracts.
* Type safety.
* Backward compatibility.
* Current Matching Engine behavior during validation.

The Evidence Layer extends the architecture without replacing existing scoring abruptly.

## Decision Outcome

ADR-010 is accepted.

The Evidence Layer becomes the official evolution path toward a Hybrid Evidence Based Matching Engine architecture.

# ADR-010.1 — Evidence Transparency Layer Validation Findings

## Estado

Aceptado y validado en entorno local.

## Contexto

Después de integrar la Evidence Layer en modo Shadow Mode, se agregó la capa de transparencia para observar cómo el sistema construye el Evidence Score.

La validación se realizó utilizando datos reales provenientes de:

```
Supabase
   ↓
cv_analyses
   ↓
/api/jobs
   ↓
jobScoring.ts
   ↓
Evidence Layer
   ↓
evidence_analysis
```

## Objetivo de la validación

Confirmar que la Evidence Layer:

* genera resultados explicables;
* mantiene separado el `match_score` oficial;
* permite analizar la calidad y origen de la evidencia;
* evita modificar el comportamiento existente del Matching Engine.

## Resultados confirmados

### 1. Match Score independiente

Se confirmó que:

```
match_score
```

permanece como métrica oficial del Matching Engine.

La Evidence Layer funciona como una capa adicional de análisis y no reemplaza el scoring existente.

Ejemplo:

```
match_score: 75

evidence_analysis.totalScore: 74
```

Ambos valores representan perspectivas diferentes del candidato.

---

### 2. Evidence Transparency funcionando

La salida ahora incluye:

```json
{
  "transparency": {
    "relevanceBreakdown": {},
    "confidenceBreakdown": {},
    "sourceBreakdown": {},
    "evidenceTypeBreakdown": {}
  }
}
```

Esto permite conocer:

* tipo de evidencia;
* fuente de evidencia;
* nivel de confianza;
* relación con la habilidad evaluada.

---

## Casos validados

### Caso A — Operador de maquinaria (Construction)

Resultado:

* match_score alto;
* evidencia consistente;
* combinación de experiencia y habilidades relacionadas.

Conclusión:

La Evidence Layer identifica correctamente una relación fuerte entre el perfil del candidato y la oportunidad.

---

### Caso B — Trabajador agrícola (Agriculture)

Resultado:

* evidencia directa y relacionada;
* confianza alta y media;
* experiencia proveniente de fuentes del CV.

Conclusión:

El sistema reconoce correctamente la alineación con la experiencia demostrada del candidato.

---

### Caso C — Minero en Canadá (Mining)

Resultado:

* match_score bajo;
* ausencia de habilidades e industria coincidente;
* recomendaciones limitadas.

Conclusión:

El Matching Engine mantiene correctamente una baja compatibilidad.

---

# Hallazgo arquitectónico

Durante la validación se identificó una limitación esperada de la primera versión de Evidence Layer.

Actualmente la evaluación funciona como:

```
Candidate Profile Evidence
          ↓
Evidence Score general
          ↓
evidence_analysis
```

Esto permite conocer la fortaleza general de la evidencia del candidato.

Sin embargo, todavía no evalúa completamente:

```
Candidate Evidence
          +
Specific Job Requirements
          ↓
Job-Specific Evidence Score
```

Por lo tanto, el mismo perfil de evidencia puede aparecer en diferentes empleos aunque la relación específica con cada puesto sea distinta.

---

# Decisión futura

Este hallazgo no requiere cambios inmediatos.

La arquitectura actual cumple el objetivo de ADR-010:

* introducir evidencia sin riesgo;
* observar comportamiento real;
* mantener reversibilidad;
* evitar degradar el Matching Engine.

La siguiente evolución será definida como:

## ADR-010.2 — Job-Specific Evidence Matching

Objetivo:

Crear una evaluación de evidencia específica por empleo capaz de distinguir:

* evidencia directa;
* evidencia transferible;
* evidencia insuficiente;
* ausencia de experiencia relevante.

---

# Estado final

ADR-010:

✅ Evidence Layer integrada.

ADR-010.1:

✅ Evidence Transparency implementada y validada.

Próximo paso:

ADR-010.2 — Job-Specific Evidence Matching.

## ADR-010.2 – Evidence Analytics Layer

### Status
Accepted

### Context

The Evidence Layer currently operates in Shadow Mode, generating evidence-based metrics without influencing the official match_score.

Although evidence is already calculated, the system lacks an analytics layer capable of evaluating evidence quality, coverage, confidence, and gaps over time.

Without objective analytics, future calibration of the matching engine would rely on assumptions rather than measurable data.

### Decision

Introduce an Evidence Analytics Layer immediately after the Evidence Layer.

Responsibilities:

- Analyze evidence quality.
- Calculate evidence coverage.
- Measure confidence.
- Detect missing evidence.
- Produce analytics only.

The module SHALL NOT modify:

- match_score
- Ranking Engine
- Decision Engine

### Consequences

Positive:

- Objective measurement.
- Historical analytics.
- Safer future calibration.
- Better explainability.

Negative:

- Small increase in processing time.
- Additional analytics object generated.

### Compatibility

Fully backward compatible.

Shadow Mode remains unchanged.

No API changes.

No database schema changes.

### Future Evolution

ADR-011 Adaptive Calibration

ADR-011.7.8 Competency Evidence Weighting

ADR-011.8 Competency Evaluation Contract

ADR-012 Evidence Weight Learning

ADR-013 Knowledge Domain Intelligence Engine

The following architectural decisions define the foundation of Global Career AI V1.0.
| ADR | Decision | Status |
|---|---|---|
| ADR-001 | Engine Contracts as Source of Truth | Accepted |
| ADR-002 | Orchestrator V7 Architecture | Accepted |
| ADR-003 | Clean Architecture Adoption | Accepted |
| ADR-004 | Strong Type Safety Strategy | Accepted |
| ADR-005 | Core Engine Independence | Accepted |
| ADR-006 | Learning System Separation | Accepted |
| ADR-007 | Validation Boundary Strategy | Accepted |
| ADR-008 | Documentation Governance | Accepted |
| ADR-009 | Evidence Based Matching Engine Scoring | Accepted |
| ADR-010 | Evidence Layer Integration Strategy | Accepted |
| ADR-010.1 | Evidence Transparency Layer | Accepted |
| ADR-010.2 | Evidence Analytics Layer | Accepted |
| ADR-011 | Competency Intelligence Architecture | Accepted |
| ADR-011.7.8 | Competency Evidence Weighting | Accepted |
| ADR-011.8 | Competency Evaluation Contract | Accepted |
| ADR-012 | Evidence Weight Learning | Accepted |
| ADR-013 | Knowledge Domain Intelligence Engine | Accepted |
| ADR-013.1 | Knowledge Domain Scoring Strategy | Accepted |
---

# Final Architecture Governance Statement

Global Career AI V1.0 architecture is defined not only by code, but by the principles, contracts, decisions, and knowledge that guide its evolution.

Architectural decisions provide the foundation for:

- Reliability.
- Maintainability.
- Security.
- Scalability.
- Continuous improvement.

---

# Version History

| Version | Date | Description |
|---|---|---|
| 1.0 | 2026-07-14 | Initial architectural decisions repository created |

---

**Document Status:** Architecture Reference Document

**Version:** 1.0

**End of ARCHITECTURAL_DECISIONS.md**