/**
 * entities.js  (was: base44 entity layer)
 *
 * Provides a generic Supabase data-access helper that mirrors the
 * former base44.entities.EntityName CRUD pattern:
 *
 *   Query.list('habits', { filters: { created_by: email } })
 *   Query.create('habits', { name: 'Sleep 8h' })
 *   Query.update('habits', id, { name: 'Sleep 9h' })
 *   Query.delete('habits', id)
 *
 * All table names must match your Supabase schema exactly.
 */
import { supabase } from './base44Client';

// ── Generic CRUD helper ───────────────────────────────────────────────────────────────
export const Query = {
  /**
   * List rows from a table with optional eq-filters.
   * @param {string} table   - Supabase table name
   * @param {object} [opts]  - { filters, order, limit }
   */
  async list(table, opts = {}) {
    let q = supabase.from(table).select('*');
    if (opts.filters) {
      Object.entries(opts.filters).forEach(([col, val]) => {
        q = q.eq(col, val);
      });
    }
    if (opts.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? true });
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  /** Fetch a single row by primary key. */
  async get(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  /** Insert a new row and return it. */
  async create(table, payload) {
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  /** Update a row by id and return it. */
  async update(table, id, payload) {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  /** Delete a row by id. */
  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
  },
};

// ── Auth re-export (replaces base44.auth) ────────────────────────────────────────
export const User = supabase.auth;
