
import { extractJobRequirements } from "./jobRequirementExtractor";
import { extractPremiumATSRequirements } from "./premiumATSRequirementExtractor";

const tennetDescription = `
ERP Expert / SAP Super User with focus on Substations

As an ERP Expert or SAP Super User, you will work in the team to continuously improve
the SAP-EAM/PM, MRS Plantafel & SSAM for the maintenance processes in the TenneT
transmission network (AC Onshore).

You will work actively on cross-site SAP Change Requests with neighboring departments.
You will accompany the phases in Requirements Management, Test phase, development,
Acceptance and Implementation.

You will conduct training in SAP working methods or the SAP application for Key Users
or SAP users.

You will deepen your methodological and technical knowledge in SAP S/4 modules such
as Enterprise Asset Management / Plant Maintenance, MRS Plantafel, SAP Service &
Asset Manager (SSAM), Project System, Material Management and Portfolio Management.

Requirements:
Bachelor's or Master's degree in Engineering, IT or comparable.

Master's or Technician's qualification and extensive experience in maintenance
processes, ideally substation or FACTS facilities.

Experience as Super User / Key User for SAP EAM/PM advantageous.
`;

const baselineRequirements = extractJobRequirements(tennetDescription);
const premiumRequirements = extractPremiumATSRequirements(tennetDescription);

console.log("\n===== EXTRACTOR GENERAL =====");
console.log(baselineRequirements);
console.log(`COUNT: ${baselineRequirements.length}`);

console.log("\n===== EXTRACTOR PREMIUM =====");
console.table(
  premiumRequirements.map((item) => ({
    requirement: item.requirement,
    category: item.category,
    criticality: item.criticality,
    context: item.context,
  }))
);
console.log(`COUNT: ${premiumRequirements.length}`);
