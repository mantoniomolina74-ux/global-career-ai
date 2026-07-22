import {
  ProfessionalCompetency
} from "../professionalTypes";


export const procurementCompetencies: ProfessionalCompetency[] = [

  {
    id: "supplier_management",

    name: "Supplier Management",

    category: "operational",

    description:
      "Ability to manage supplier relationships, coordination and performance.",

    recognitionPatterns: [
      "supplier management",
      "managed suppliers",
      "vendor coordination",
      "supplier relationships",
      "supplier performance"
    ],

    semanticPatterns: [
      {
        requiredTokens: [
          "managed",
          "supplier"
        ],
        weight: 1
      },
      {
        requiredTokens: [
          "vendor",
          "coordination"
        ],
        weight: 0.8
      },
      {
        requiredTokens: [
          "supplier",
          "performance"
        ],
        weight: 0.8
      }
    ]
  },


  {
    id: "purchase_management",

    name: "Purchase Management",

    category: "technical",

    description:
      "Ability to manage purchasing processes, purchase orders and procurement workflows.",

    recognitionPatterns: [
      "purchase management",
      "purchase orders",
      "purchasing processes",
      "procurement workflows",
      "buying activities"
    ],

    semanticPatterns: [
      {
        requiredTokens: [
          "purchase",
          "order"
        ],
        weight: 1
      },
      {
        requiredTokens: [
          "procurement",
          "process"
        ],
        weight: 0.9
      },
      {
        requiredTokens: [
          "purchasing",
          "activity"
        ],
        weight: 0.8
      }
    ]
  },


  {
    id: "negotiation",

    name: "Negotiation",

    category: "management",

    description:
      "Ability to negotiate commercial terms, costs and supplier agreements.",

    recognitionPatterns: [
      "negotiation",
      "negotiated agreements",
      "supplier negotiations",
      "contract negotiations",
      "commercial terms"
    ],

    semanticPatterns: [
      {
        requiredTokens: [
          "negotiated",
          "agreement"
        ],
        weight: 1
      },
      {
        requiredTokens: [
          "negotiated",
          "contract"
        ],
        weight: 1
      },
      {
        requiredTokens: [
          "supplier",
          "negotiation"
        ],
        weight: 0.9
      }
    ]
  },


  {
    id: "cost_control",

    name: "Cost Control",

    category: "operational",

    description:
      "Ability to analyze and optimize operational costs.",

    recognitionPatterns: [
      "cost control",
      "controlled costs",
      "cost reduction",
      "cost optimization",
      "expense management"
    ],

    semanticPatterns: [
      {
        requiredTokens: [
          "controlled",
          "cost"
        ],
        weight: 1
      },
      {
        requiredTokens: [
          "optimized",
          "cost"
        ],
        weight: 0.9
      },
      {
        requiredTokens: [
          "reduced",
          "cost"
        ],
        weight: 0.9
      }
    ]
  },


  {
    id: "inventory_coordination",

    name: "Inventory Coordination",

    category: "operational",

    description:
      "Ability to coordinate inventory availability and material flow.",

    recognitionPatterns: [
      "inventory coordination",
      "material availability",
      "stock coordination",
      "inventory management",
      "materials planning"
    ],

    semanticPatterns: [
      {
        requiredTokens: [
          "inventory",
          "management"
        ],
        weight: 1
      },
      {
        requiredTokens: [
          "material",
          "availability"
        ],
        weight: 0.9
      },
      {
        requiredTokens: [
          "stock",
          "coordination"
        ],
        weight: 0.8
      }
    ]
  }
];