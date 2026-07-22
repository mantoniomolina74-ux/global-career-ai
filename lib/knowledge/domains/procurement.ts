import {
  ProfessionalDomain
} from "../professionalTypes";


export const procurementDomain: ProfessionalDomain = {
  id: "procurement_supply_chain",

  name: "Procurement & Supply Chain",

  description:
    "Professional domain focused on purchasing, supplier management, sourcing, cost control and supply coordination.",

  roles: [
    {
      id: "procurement_specialist",

      title: "Procurement Specialist",

      domainId: "procurement_supply_chain",

      level: "intermediate",

      competencies: [
        {
          id: "supplier_management",
          name: "Supplier Management",
          category: "operational"
        },
        {
          id: "purchase_orders",
          name: "Purchase Orders",
          category: "technical"
        },
        {
          id: "negotiation",
          name: "Negotiation",
          category: "management"
        },
        {
          id: "cost_control",
          name: "Cost Control",
          category: "operational"
        },
        {
          id: "inventory_coordination",
          name: "Inventory Coordination",
          category: "operational"
        }
      ],

      relatedRoles: [
        "buyer",
        "purchasing_coordinator",
        "supply_chain_analyst"
      ],

      transferablePaths: [
        "operations_coordinator",
        "project_coordinator",
        "logistics_specialist"
      ]
    }
  ]
};