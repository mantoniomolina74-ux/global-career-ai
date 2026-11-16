
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

const BUCKET = "cvs";
const OWNER_ID = "36fcc84c-dbe6-473c-b9cf-7735d1ac31be";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const migrations = [
  {
    analysisId: "157efc81-aaba-4b3b-a902-98aadbaeb0c4",
    source: "cvs/b6de4c6f-40c0-464b-931e-4d78f6824109-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "26ebdafb-be7a-41cd-b08d-ce9d969b65ad",
    source: "cvs/e1a343ad-f5a8-43cd-837b-09de2399a190-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "704d0b1c-243e-4861-b558-5c8004e215ff",
    source: "cvs/1786915885034-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "9c705ba0-93db-4daa-a037-822d4cefce84",
    source: "cvs/1786919328359-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "a64ed9a8-0a6c-4344-8d95-bc131f343524",
    source: "cvs/1786915165789-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "aca75955-70be-4975-8544-75d8d6080283",
    source: "cvs/bac3ce95-c3df-4f72-adce-579e8b90a5ab-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "b7341ccf-bcab-4d5e-87db-9c34d9287088",
    source: "cvs/6cd1257b-096e-4da3-b096-a28dd9078e41-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "d9f8a77e-9ebc-41f7-87c7-1f7162a742bb",
    source: "cvs/1786915269247-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "e01b1ef9-dcf4-41f3-82e2-cc17dc236b88",
    source: "cvs/1786911747624-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
  {
    analysisId: "f2f5e833-721a-4d82-a2e6-e8e827eaa701",
    source: "cvs/20c744d9-7cda-4a99-9d83-aa47676c636f-CVMarco_Antonio_Gaxiola_Molina_Bilingue.pdf",
  },
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function assertPdf(buffer, description) {
  if (
    buffer.length < 5 ||
    buffer.length > MAX_FILE_SIZE ||
    buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    throw new Error(
      `${description}: PDF inválido o tamaño fuera del límite de 10 MiB.`
    );
  }
}

async function downloadPdf(storage, path) {
  const { data, error } = await storage.download(path);

  if (error || !data) {
    throw new Error(
      `No se pudo descargar ${path}: ${error?.message ?? "sin datos"}.`
    );
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  assertPdf(buffer, path);

  return buffer;
}

async function destinationExists(storage, fileName) {
  const { data, error } = await storage.list(OWNER_ID, {
    limit: 1000,
    search: fileName,
  });

  if (error) {
    throw new Error(
      `No se pudo comprobar el destino ${fileName}: ${error.message}`
    );
  }

  return (data ?? []).some((item) => item.name === fileName);
}

async function main() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Falta la URL de Supabase o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  if (migrations.length !== 10) {
    throw new Error("La lista debe contener exactamente diez archivos.");
  }

  const ids = new Set(migrations.map((item) => item.analysisId));
  const sources = new Set(migrations.map((item) => item.source));

  if (ids.size !== migrations.length) {
    throw new Error("Hay identificadores de análisis duplicados.");
  }

  if (sources.size !== migrations.length) {
    throw new Error("Hay rutas de origen duplicadas.");
  }

  for (const item of migrations) {
    if (
      !/^[0-9a-f-]{36}$/i.test(item.analysisId) ||
      !item.source.startsWith("cvs/") ||
      item.source.includes("..")
    ) {
      throw new Error("La lista contiene un identificador o una ruta inválidos.");
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const storage = supabase.storage.from(BUCKET);
  const plan = [];

  // FASE 1: validar todos los orígenes y destinos.
  // En esta fase no se sube, modifica ni elimina ningún archivo.
  console.log("FASE 1: verificando los diez archivos antes de copiar.");

  for (const item of migrations) {
    const fileName = `${item.analysisId}.pdf`;
    const destination = `${OWNER_ID}/${fileName}`;

    console.log(`Verificando análisis ${item.analysisId}...`);

    const sourceBuffer = await downloadPdf(storage, item.source);
    const sourceHash = sha256(sourceBuffer);
    const exists = await destinationExists(storage, fileName);

    if (exists) {
      const existingBuffer = await downloadPdf(storage, destination);

      if (sha256(existingBuffer) !== sourceHash) {
        throw new Error(
          `El destino existe con contenido diferente: ${destination}. ` +
          "Se detuvo la operación sin iniciar las copias."
        );
      }

      plan.push({
        item,
        destination,
        sourceBuffer,
        sourceHash,
        alreadyCopied: true,
      });

      console.log("Destino existente: contenido idéntico.");
    } else {
      plan.push({
        item,
        destination,
        sourceBuffer,
        sourceHash,
        alreadyCopied: false,
      });

      console.log("Origen válido; destino disponible.");
    }
  }

  console.log(
    `\nPrevalidación completada: ${plan.length} de 10 archivos revisados.`
  );

  const pending = plan.filter((entry) => !entry.alreadyCopied);

  console.log(`Archivos pendientes de copia: ${pending.length}.`);

  // FASE 2: copiar únicamente después de completar la prevalidación.
  // upsert:false impide sobrescribir un destino existente.
  console.log("\nFASE 2: copiando y verificando los archivos pendientes.");

  let verified = plan.length - pending.length;

  for (const entry of pending) {
    const { destination, sourceBuffer, sourceHash, item } = entry;

    console.log(`Copiando análisis ${item.analysisId}...`);

    const { error } = await storage.upload(destination, sourceBuffer, {
      cacheControl: "0",
      contentType: "application/pdf",
      upsert: false,
    });

    if (error) {
      throw new Error(
        `Falló la copia a ${destination}: ${error.message}. ` +
        "Los archivos originales se conservaron."
      );
    }

    const copiedBuffer = await downloadPdf(storage, destination);

    if (sha256(copiedBuffer) !== sourceHash) {
      throw new Error(
        `Falló la verificación SHA-256 de ${destination}.`
      );
    }

    verified++;
    console.log("Copia verificada correctamente con SHA-256.");
  }

  console.log(`\nResultado: ${verified} de 10 archivos verificados.`);
  console.log("No se eliminaron ni sobrescribieron archivos originales.");
  console.log("No se modificó la tabla cv_analyses.");
}

main().catch((error) => {
  console.error("\nOPERACIÓN DETENIDA:", error.message);
  process.exitCode = 1;
});
