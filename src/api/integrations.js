/**
 * integrations.js  (was: base44.integrations.Core.*)
 *
 * Replaces all Base44 integration helpers with self-contained
 * implementations that call your own Supabase Edge Functions or
 * external APIs directly.
 *
 * Each export mirrors the original Base44 API shape so call-sites
 * require minimal changes.
 */
import { supabase } from './base44Client';

// ── Supabase Edge Function caller (generic) ───────────────────────────────
async function invokeEdgeFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return data;
}

// ── Core namespace (mirrors base44.integrations.Core) ─────────────────────
export const Core = {
  InvokeLLM: (params) => invokeEdgeFunction('invoke-llm', params),
  SendEmail: (params) => invokeEdgeFunction('send-email', params),
  SendSMS: (params) => invokeEdgeFunction('send-sms', params),
  UploadFile: (params) => invokeEdgeFunction('upload-file', params),
  GenerateImage: (params) => invokeEdgeFunction('generate-image', params),
  ExtractDataFromUploadedFile: (params) => invokeEdgeFunction('extract-data', params),
};

// ── Named exports (same shape as before) ─────────────────────────────────
export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const SendSMS = Core.SendSMS;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;

/**
 * SUPABASE STORAGE - upload helper (replaces base44.integrations.Core.UploadFile)
 *
 * Usage:
 *   const url = await uploadFileToStorage(file, 'avatars');
 */
export async function uploadFileToStorage(file, bucket = 'uploads') {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
