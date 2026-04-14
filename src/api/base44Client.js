/**
 * supabaseClient.js  (was: base44Client.js)
 *
 * Single Supabase client instance used throughout the app.
 * All former `base44` imports from this file now receive the
 * Supabase client instead.
 *
 * The `base44` named export below is a FULL backward-compat shim so that
 * any page/component that still calls:
 *   base44.auth.me()
 *   base44.entities.SomeTable.filter({ created_by: email })
 *   base44.entities.SomeTable.create(data)
 *   base44.entities.SomeTable.update(id, data)
 *   base44.entities.SomeTable.delete(id)
 *   base44.functions.invoke('fn-name', body)
 * continues to work without changes while migration is in progress.
 *
 * Required env vars (.env / Vercel dashboard):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n' +
    'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ---- Backward-compat shim --------------------------------------------------
// Provides the same API surface as the old Base44 SDK so that pages still
// using base44.auth.me() / base44.entities.X.filter() keep working.

/**
 * Creates a Supabase-backed entity helper that mirrors the Base44 entity API.
 * Table name is derived by converting CamelCase -> snake_case.
 * e.g. HabitProgress -> habit_progress
 */
function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '');
}

function makeEntityProxy(tableName) {
  const table = toSnakeCase(tableName);
  return {
    /** List rows. opts.filters maps column -> value (eq). */
    async filter(filters = {}, orderBy) {
      let q = supabase.from(table).select('*');
      Object.entries(filters).forEach(([col, val]) => {
        q = q.eq(col, val);
      });
      if (orderBy) {
        const asc = !orderBy.startsWith('-');
        const col = orderBy.replace(/^-/, '');
        q = q.order(col, { ascending: asc });
      }
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async list(opts = {}) {
      return this.filter(opts.filters || {}, opts.order);
    },
    async create(payload) {
      // Attach created_by from the current session if not supplied
      if (!payload.created_by) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) payload = { ...payload, created_by: user.email };
      }
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { id };
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
  };
}

// Proxy that lazily creates entity helpers for any property access
const entitiesProxy = new Proxy({}, {
  get(target, prop) {
    if (!target[prop]) {
      target[prop] = makeEntityProxy(prop);
    }
    return target[prop];
  },
});

export const base44 = {
  auth: {
    ...supabase.auth,
    /** Replaces base44.auth.me() — returns the current user profile */
    async me() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error || new Error('Not authenticated');
      // Optionally fetch from a profiles table if it exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return profile || user;
    },
    async isAuthenticated() {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
  },
  entities: entitiesProxy,
  functions: {
    /** Replaces base44.functions.invoke() */
    async invoke(name, body = {}) {
      const { data, error } = await supabase.functions.invoke(name, { body });
      if (error) throw error;
      return data;
    },
  },
};
