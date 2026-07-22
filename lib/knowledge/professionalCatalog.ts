import {
  ProfessionalDomain
} from "./professionalTypes";

import {
  procurementDomain
} from "./domains/procurement";


export const professionalCatalog: ProfessionalDomain[] = [
  procurementDomain
];


export function getProfessionalDomains(): ProfessionalDomain[] {
  return professionalCatalog;
}


export function getProfessionalDomainById(
  id: string
): ProfessionalDomain | undefined {
  return professionalCatalog.find(
    domain => domain.id === id
  );
}