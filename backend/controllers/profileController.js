// backend/controllers/profileController.js
import path from "path";
import { supabase } from "../config/supabase.js";

const BUCKET =
  process.env.SUPABASE_AVATAR_BUCKET ||
  process.env.SUPABASE_IMAGE_BUCKET ||
  "avatars";

/**
 * sanitizeExt: pastikan ekstensi aman (.png, .jpg, .jpeg, .webp, .gif, .svg)
 * fallback .png jika ekstensi tidak dikenal
 */
function sanitizeExt(ext) {
  if (!ext) return ".png";
  const e = ext.toLowerCase();
  if (e.match(/^\.(png|jpe?g|gif|webp|svg)$/)) return e;
  return ".png";
}

/**
 * makeSafeFilename: buat path filename yang aman dan unik.
 * Contoh: avatars/1690000000000_ab12cd3.png
 */
function makeSafeFilename(originalName = "avatar.png") {
  const ext = sanitizeExt(path.extname(originalName));
  const suffix = Math.random().toString(36).slice(2, 9);
  return `avatars/${Date.now()}_${suffix}${ext}`;
}

/**
 * Upload buffer ke Supabase storage dan kembalikan public URL.
 * Melempar error jika gagal (dengan pesan yang lebih informatif).
 */
async function uploadAvatarBuffer(buffer, originalName = "avatar.png", mimeType = "image/png") {
  // validasi buffer (bisa Buffer atau Uint8Array)
  if (!buffer || (typeof buffer.length !== "number") || buffer.length === 0) {
    throw new Error("No valid buffer provided for avatar upload.");
  }

  const filename = makeSafeFilename(originalName);

  console.log(`[uploadAvatarBuffer] uploading -> bucket=${BUCKET} filename=${filename} mime=${mimeType} size=${buffer.length}`);

  // Supabase upload
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadErr) {
    console.error("[uploadAvatarBuffer] uploadErr:", uploadErr);
    // pesan khusus bila bucket tidak ditemukan atau permission
    const msg = (uploadErr?.message || JSON.stringify(uploadErr)).toString();
    if (msg.toLowerCase().includes("bucket") || msg.toLowerCase().includes("not found")) {
      throw new Error(`Upload failed: bucket "${BUCKET}" problem (${msg}). Periksa env SUPABASE_IMAGE_BUCKET / SUPABASE_AVATAR_BUCKET.`);
    }
    throw new Error(`Upload failed: ${msg}`);
  }

  // dapatkan public URL
  const { data: publicData, error: publicErr } = supabase.storage.from(BUCKET).getPublicUrl(filename) || {};
  if (publicErr) {
    console.error("[uploadAvatarBuffer] getPublicUrl error:", publicErr);
    throw new Error(`Upload succeeded but failed to get public URL: ${publicErr.message || JSON.stringify(publicErr)}`);
  }

  // getPublicUrl usually returns { data: { publicUrl: '...' } }
  const publicUrl = publicData?.publicUrl || publicData?.public_url || null;
  if (!publicUrl) {
    throw new Error("Upload succeeded but public URL couldn't be retrieved.");
  }

  console.log("[uploadAvatarBuffer] uploaded ok ->", publicUrl);
  return publicUrl;
}

/**
 * GET /api/public-profiles
 */
export async function getProfile(req, res) {
  try {
    const { data, error } = await supabase
      .from("public_profiles")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      // jika tidak ada row, jangan error 500 — kembalikan profile: null
      console.warn("getProfile warning:", error.message || error);
      return res.json({ profile: null });
    }

    return res.json({ profile: data || null });
  } catch (err) {
    console.error("getProfile err", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}

/**
 * POST /api/public-profiles
 * - menerima multipart/form-data (avatar file) OR application/json/urlencoded
 * Behavior:
 * - Jika file `avatar` dikirim -> upload dan set avatar_url
 * - Jika tidak ada file dan client kirim fields.avatar_url -> pakai itu
 * - Jika tidak ada file dan tidak ada avatar_url -> PRESERVE existing avatar (jangan overwrite)
 */
export async function upsertProfile(req, res) {
  try {
    // debug log masukin metadata request (bantu trace)
    console.log("[upsertProfile] incoming request - hasFile:", !!req.file, "bodyKeys:", Object.keys(req.body || {}));

    const file = req.file; // multer memoryStorage => file.buffer
    const fields = req.body || {};

    // ambil profile yang ada (kita pakai single row public profile)
    const { data: existing, error: errExisting } = await supabase
      .from("public_profiles")
      .select("*")
      .limit(1)
      .single();

    if (errExisting) {
      // jika no rows, supabase bisa mengembalikan error; kita handle dengan existing = null
      console.warn("existing profile fetch warning (may be no row):", errExisting.message || errExisting);
    }

    const existingId = existing?.id || null;

    // prepare data update (jangan set avatar_url kecuali kita sudah memutuskan)
    const updateData = {
      full_name: fields.full_name ?? fields.name ?? existing?.full_name ?? undefined,
      email: fields.email ?? existing?.email ?? undefined,
      gender: fields.gender ?? existing?.gender ?? undefined,
      location: fields.location ?? existing?.location ?? undefined,
      // avatar_url: akan ditetapkan di bawah jika perlu
    };

    // Jika ada file, upload dan set avatar_url
    if (file && (file.buffer || file.stream)) {
      try {
        // multer memoryStorage memberikan file.buffer (Buffer)
        const buf = file.buffer || Buffer.from([]);
        console.log("[upsertProfile] uploading avatar file:", {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });

        const publicUrl = await uploadAvatarBuffer(buf, file.originalname || "avatar.png", file.mimetype || "image/png");
        if (publicUrl) updateData.avatar_url = publicUrl;
      } catch (upErr) {
        console.error("avatar upload error:", upErr);
        return res.status(500).json({ error: "Gagal mengunggah avatar: " + (upErr.message || upErr) });
      }
    } else if (typeof fields.avatar_url === "string" && fields.avatar_url.trim() !== "") {
      // client eksplisit mengirim avatar_url (misalnya sebelumnya disimpan), kita terima
      updateData.avatar_url = fields.avatar_url;
    } else {
      // Tidak ada file dan tidak ada avatar_url -> PRESERVE existing avatar
      // Dengan cara: jangan masukkan key avatar_url pada updateData
    }

    // hapus undefined keys supaya upsert tidak menulis null/undefined
    Object.keys(updateData).forEach((k) => {
      if (updateData[k] === undefined) delete updateData[k];
    });

    // build payload upsert
    const payload = existingId ? { id: existingId, ...updateData } : { ...updateData };

    // jika payload kosong -> kembalikan profile saat ini
    if (Object.keys(payload).length === 0) {
      return res.json({ profile: existing || null });
    }

    const { data, error } = await supabase
      .from("public_profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("upsertProfile DB error:", error);
      return res.status(500).json({ error: error.message || error });
    }

    return res.json({ profile: data });
  } catch (err) {
    console.error("upsertProfile err", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
