import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { error } = await supabase
    .from("promos")
    .update({ status: "expired" })
    .lt("promo_expiry", new Date().toISOString().split("T")[0])
    .eq("status", "active")

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 })
  }

  return new Response("Promo expiration update done.", { status: 200 })
})
