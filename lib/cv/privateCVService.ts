
import { supabaseServer } from "@/lib/supabase-server";
import { extractCVText } from "@/lib/extract-cv";

const CV_BUCKET = "cvs";
const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024;
const SIGNED_URL_LIFETIME_SECONDS = 60;

export class PrivateCVError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrivateCVError";
  }
}

/**
 * Accepts only paths in the format:
 * <ownerUserId>/<uuid>.pdf
 *
 * The path is relative to the "cvs" bucket.
 */
function validateStoragePath(
  ownerUserId: string,
  storagePath: string
): void {
  if (
    !ownerUserId ||
    !storagePath ||
    storagePath.length > 512
  ) {
    throw new PrivateCVError("Invalid CV storage path.");
  }

  if (
    storagePath.startsWith("/") ||
    storagePath.includes("\\") ||
    storagePath.includes("..") ||
    storagePath.includes("?") ||
    storagePath.includes("#") ||
    storagePath.includes("%") ||
    storagePath.includes(":") ||
    /[\u0000-\u001F\u007F]/.test(storagePath)
  ) {
    throw new PrivateCVError("Invalid CV storage path.");
  }

  const segments = storagePath.split("/");

  if (
    segments.length !== 2 ||
    segments[0] !== ownerUserId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/i.test(
      segments[1]
    )
  ) {
    throw new PrivateCVError(
      "CV path does not match the expected owner and filename."
    );
  }
}

/**
 * Reads a response incrementally and rejects content that exceeds
 * the configured limit before accumulating the full response.
 */
async function readResponseWithLimit(
  response: Response
): Promise<Buffer> {
  const contentLength = response.headers.get("content-length");

  if (contentLength !== null) {
    const declaredSize = Number(contentLength);

    if (
      !Number.isSafeInteger(declaredSize) ||
      declaredSize < 0 ||
      declaredSize > MAX_CV_SIZE_BYTES
    ) {
      await response.body?.cancel();

      throw new PrivateCVError(
        "CV exceeds the permitted 10 MiB limit."
      );
    }
  }

  if (!response.body) {
    throw new PrivateCVError("CV response has no readable body.");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > MAX_CV_SIZE_BYTES) {
        await reader.cancel();

        throw new PrivateCVError(
          "CV exceeds the permitted 10 MiB limit."
        );
      }

      chunks.push(value);
    }
  } catch (error: unknown) {
    await reader.cancel().catch(() => undefined);

    if (error instanceof PrivateCVError) {
      throw error;
    }

    throw new PrivateCVError("Unable to read the CV file.");
  } finally {
    reader.releaseLock();
  }

  if (totalBytes === 0) {
    throw new PrivateCVError("CV file is empty.");
  }

  return Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    totalBytes
  );
}

/**
 * Downloads and extracts text from a CV in Supabase Storage.
 *
 * This is a server-only service.
 *
 * The caller MUST authenticate the requester and authorize access
 * to the CV before calling this function.
 *
 * ownerUserId identifies the owner of the stored CV. In Enterprise,
 * the caller must separately verify organization permissions and
 * candidate membership before passing the candidate's ID here.
 *
 * A signed URL is generated internally and used only for this
 * request. It must never be logged or persisted.
 */
export async function extractPrivateCVText(
  ownerUserId: string,
  storagePath: string
): Promise<string> {
  validateStoragePath(ownerUserId, storagePath);

  const { data, error } = await supabaseServer.storage
    .from(CV_BUCKET)
    .createSignedUrl(
      storagePath,
      SIGNED_URL_LIFETIME_SECONDS
    );

  if (error || !data?.signedUrl) {
    throw new PrivateCVError(
      "Unable to authorize access to the stored CV."
    );
  }

  let response: Response;

  try {
    response = await fetch(data.signedUrl, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new PrivateCVError("Unable to download the stored CV.");
  }

  if (!response.ok) {
    await response.body?.cancel();

    throw new PrivateCVError("Unable to download the stored CV.");
  }

  const buffer = await readResponseWithLimit(response);
  const pdfSignature = Buffer.from("%PDF-");

  if (
    buffer.length < pdfSignature.length ||
    !buffer.subarray(0, pdfSignature.length).equals(pdfSignature)
  ) {
    throw new PrivateCVError("The stored file is not a valid PDF.");
  }

  try {
    return await extractCVText(buffer);
  } catch {
    throw new PrivateCVError("Unable to extract text from the CV.");
  }
}
