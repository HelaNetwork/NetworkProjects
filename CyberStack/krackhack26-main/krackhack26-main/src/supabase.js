import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*//////////////////////////////////////////////////////////////
                    EMPLOYEE DB HELPERS
//////////////////////////////////////////////////////////////*/

/**
 * Fetch all employees from Supabase.
 * Returns an array of employee rows.
 */
export async function fetchAllEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single employee by their Google login email.
 */
export async function fetchEmployeeByEmail(email) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data || null;
}

/**
 * Insert a new employee record.
 * @param {{ name, email, position, salary, wallet_address }} employee
 */
export async function addEmployee(employee) {
  const { data, error } = await supabase
    .from("employees")
    .insert([employee])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing employee record by id.
 */
export async function updateEmployee(id, updates) {
  const { data, error } = await supabase
    .from("employees")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an employee record by id.
 */
export async function deleteEmployee(id) {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
