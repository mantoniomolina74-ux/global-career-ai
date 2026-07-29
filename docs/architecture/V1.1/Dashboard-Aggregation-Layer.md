\# Dashboard Aggregation Layer — V1.1



\## Status



Draft



\## Version



1.0.0



\## Purpose



The Dashboard Aggregation Layer (DAL) is the integration layer responsible for transforming Global Career AI intelligence outputs into a unified Dashboard experience.



The DAL connects internal intelligence producers with Dashboard consumers through stable contracts.



Its responsibility is aggregation, normalization and orchestration.



The DAL does not replace intelligence engines.



It coordinates and prepares intelligence for presentation.



\---



\# 1. Architectural Role



The Dashboard Aggregation Layer acts as the bridge between intelligence generation and user experience.



High level flow:

Intelligence Engines



&#x20;   |



&#x20;   v



Dashboard Aggregation Layer



&#x20;   |



&#x20;   v



Dashboard Contract



&#x20;   |



&#x20;   v



Dashboard Experience





\---



\# 2. Core Responsibilities



The DAL is responsible for:



\## Aggregation



Collecting intelligence outputs from different domains:



\- ATS Intelligence

\- Career Matching

\- Competency Intelligence

\- Knowledge Intelligence

\- Learning Intelligence

\- Decision Intelligence

\- Evidence Layer



\---



\## Normalization



Transforming internal engine responses into Dashboard-oriented models.



Internal models are not exposed directly.



The DAL creates a stable representation aligned with the Dashboard Data Contract.



\---



\## Orchestration



Managing the execution flow required to generate a complete Dashboard response.



Responsibilities include:



\- Data retrieval

\- Engine coordination

\- Contract generation

\- Response preparation



\---



\## Isolation



The UI layer must not communicate directly with intelligence engines.



All Dashboard data access flows through the DAL.





3\. Data Flow Architecture



Ahí vamos a definir exactamente cómo viaja la información:



User Request



↓



Dashboard API



↓



DAL



↓



Engines + Repositories



↓



DashboardContract



↓



Response

\---



\# 3. Data Flow Architecture



The Dashboard data generation process follows a controlled aggregation flow.



The objective is to maintain separation between data sources, intelligence processing and user presentation.



\---



\# Request Flow

User Request



&#x20;   |



&#x20;   v



Dashboard API Endpoint



&#x20;   |



&#x20;   v



Dashboard Aggregation Layer



&#x20;   |



&#x20;   +----------------+

&#x20;   |                |

&#x20;   v                v



Intelligence Data Sources

Services Repositories



&#x20;   |



&#x20;   v



Dashboard Contract Builder



&#x20;   |



&#x20;   v



Dashboard Response



&#x20;   |



&#x20;   v



User Interface





\---



\# Flow Responsibilities



\## Dashboard API Endpoint



Responsible for:



\- Receiving Dashboard requests

\- Validating user context

\- Passing execution control to DAL



The API does not contain intelligence logic.



\---



\## Dashboard Aggregation Layer



Responsible for:



\- Coordinating data retrieval

\- Executing required services

\- Combining intelligence outputs

\- Building DashboardContract response



\---



\## Intelligence Services



Responsible for providing domain intelligence:



\- ATS analysis

\- Career matching

\- Competency evaluation

\- Knowledge analysis

\- Learning insights

\- Decision recommendations



\---



\## Data Sources



Responsible for providing persisted information:



\- User profile data

\- Analysis history

\- Learning events

\- Intelligence records



\---



\## Dashboard Contract Builder



Responsible for:



\- Mapping internal models

\- Creating stable Dashboard structures

\- Ensuring contract compliance



\---



\# Design Principle



The Dashboard generation process must preserve strict layer separation:



Data



↓



Intelligence



↓



Aggregation



↓



Contract



↓



Presentation





\---



\# 4. Multi-Tenant Architecture



The Dashboard Aggregation Layer must preserve tenant isolation throughout the complete data generation process.



Every Dashboard request must execute within an explicit tenant context.



\---



\# Tenant Context Flow

Dashboard Request



&#x20;   |



&#x20;   v



SaaS Context Validation



&#x20;   |



&#x20;   v



tenantId Resolution



&#x20;   |



&#x20;   v



Dashboard Aggregation Layer



&#x20;   |



&#x20;   v



Tenant Scoped Data Retrieval



&#x20;   |



&#x20;   v



DashboardContract





\---



\# Tenant Isolation Responsibilities



The DAL must ensure:



\- Every request contains valid tenant context.

\- Repository queries are tenant scoped.

\- Intelligence results belong to the correct tenant.

\- Dashboard responses cannot mix information between tenants.



\---



\# Tenant-Aware Services



All services participating in Dashboard generation must support tenant context:



```typescript

interface DashboardContext {



&#x20;   tenantId: string;



&#x20;   userId: string;



}

Design Principle



Multi-tenancy is a foundational architectural constraint.



Tenant isolation must exist at every layer:



Request



↓



Context



↓



Services



↓



Repositories



↓



Dashboard Contract



\---



\# 5. Aggregation Strategy



The Dashboard Aggregation Layer uses a coordinated aggregation strategy to combine multiple intelligence domains into a unified Dashboard response.



The strategy prioritizes:



\- Performance

\- Reliability

\- Partial failure handling

\- Consistent user experience



\---



\# Aggregation Flow

Dashboard Request



&#x20;   |



&#x20;   v



Aggregation Coordinator



&#x20;   |



&#x20;   +----------------+

&#x20;   |                |

&#x20;   v                v



ATS Intelligence Matching Intelligence



Knowledge Competency Intelligence



Learning Decision Intelligence



Evidence



&#x20;   |



&#x20;   v



Aggregation Result



&#x20;   |



&#x20;   v



DashboardContract





\---



\# Parallel Execution



Independent intelligence domains should be executed in parallel when possible.



Benefits:



\- Reduced response time

\- Better scalability

\- Independent service evolution



\---



\# Partial Failure Handling



The Dashboard should degrade gracefully.



If one intelligence domain fails:



\- Available intelligence should still be returned.

\- Failure information should be captured in diagnostics.

\- The user experience should remain functional.



Example:





Learning Intelligence unavailable



↓



Dashboard generated with:



ATS ✅

Matching ✅

Knowledge ✅

Learning ⚠️

Evidence ✅





\---



\# Priority Levels



Dashboard data can be categorized:



\## Critical



Required for basic Dashboard generation:



\- User context

\- Profile information

\- Executive Summary



\## Important



Enhances intelligence:



\- ATS

\- Matching

\- Competency

\- Knowledge



\## Advanced



Provides deeper experience:



\- Learning Evolution

\- Timeline

\- Predictive Insights



\---



\# Design Principle



The Dashboard should maximize intelligence availability while maintaining reliability.



A partial intelligent response is preferable to a complete failure.



\---



\# 6. Error Handling \& Observability



The Dashboard Aggregation Layer must provide visibility and resilience during Dashboard generation.



The objective is to maintain reliability while preserving available intelligence.



\---



\# Error Management Flow

Execution



&#x20;   |



&#x20;   v



Domain Response Validation



&#x20;   |



&#x20;   v



Error Detection



&#x20;   |



&#x20;   v



Diagnostics Collection



&#x20;   |



&#x20;   v



Dashboard Response





\---



\# Error Categories



\## Critical Errors



Errors that prevent Dashboard generation.



Examples:



\- Missing tenant context

\- Invalid user context

\- Contract generation failure



Expected behavior:



\- Stop execution

\- Return controlled error

\- Register diagnostics



\---



\## Recoverable Errors



Errors affecting individual intelligence domains.



Examples:



\- Learning service unavailable

\- Temporary repository failure

\- Missing optional intelligence data



Expected behavior:



\- Continue Dashboard generation

\- Mark affected domain status

\- Register warning



\---



\# Observability Requirements



The DAL should provide:



\- Trace identifier

\- Execution status

\- Processing duration

\- Domain execution results

\- Warning information



\---



\# Design Principle



The Dashboard must fail gracefully.



System reliability depends on maintaining useful intelligence availability even when individual components experience problems.

\---



\# 7. Implementation Considerations



The Dashboard Aggregation Layer will be implemented following the existing Global Career AI architecture principles.



The implementation must preserve:



\- Clean Architecture

\- Type safety

\- Domain separation

\- Multi-tenant security

\- Contract-driven development



\---



\# Proposed Structure



Conceptual organization:

lib/



├── dashboard/



│ ├── contracts/



│ │ └── dashboardContract.ts



│ ├── aggregation/



│ │ └── dashboardAggregator.ts



│ ├── services/



│ │ ├── atsDashboardService.ts



│ │ ├── matchingDashboardService.ts



│ │ ├── knowledgeDashboardService.ts



│ │ ├── learningDashboardService.ts



│ │ └── evidenceDashboardService.ts



│ └── builders/



│ └── dashboardContractBuilder.ts





\---



\# Service Responsibilities



Each Dashboard service should:



\- Consume existing intelligence outputs.

\- Transform internal models.

\- Return Dashboard-oriented structures.



Services must not:



\- Modify engine behavior.

\- Access UI components.

\- Bypass tenant validation.



\---



\# API Integration



The Dashboard API layer should:



1\. Receive request.

2\. Validate authentication context.

3\. Resolve tenant context.

4\. Invoke Dashboard Aggregation Layer.

5\. Return DashboardContract response.



\---



\# Type Safety Principle



All Dashboard communication should be based on explicit TypeScript contracts.



Avoid:



\- any types

\- unsafe casting

\- implicit data structures



Prefer:



\- interfaces

\- schemas

\- validated transformations



\---



\# Evolution Strategy



The implementation should support future additions:



\- New intelligence domains

\- New AI agents

\- Mobile consumers

\- Enterprise dashboards

\- External APIs



without changing the core aggregation architecture.

