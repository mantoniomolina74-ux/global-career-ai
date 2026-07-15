import { Dispatch, SetStateAction } from "react";

export interface CertificationFormData {
  whmis: string;
  first_aid: string;
  csts_2020: string;
}

interface CertificationPanelProps {
  certForm: CertificationFormData;
  setCertForm: Dispatch<SetStateAction<CertificationFormData>>;
}

export default function CertificationPanel({
  certForm,
  setCertForm,
}: CertificationPanelProps) {
  return (
    <div className="border p-4 rounded mb-4">
      <h2 className="font-semibold mb-2">Certificaciones</h2>

      <select
        value={certForm.whmis}
        onChange={(e) =>
          setCertForm({ ...certForm, whmis: e.target.value })
        }
      >
        <option value="none">WHMIS no</option>
        <option value="completed">WHMIS sí</option>
      </select>

      <select
        value={certForm.first_aid}
        onChange={(e) =>
          setCertForm({ ...certForm, first_aid: e.target.value })
        }
      >
        <option value="none">First Aid no</option>
        <option value="completed">First Aid sí</option>
      </select>

      <select
        value={certForm.csts_2020}
        onChange={(e) =>
          setCertForm({ ...certForm, csts_2020: e.target.value })
        }
      >
        <option value="none">CSTS no</option>
        <option value="completed">CSTS sí</option>
      </select>
    </div>
  );
}