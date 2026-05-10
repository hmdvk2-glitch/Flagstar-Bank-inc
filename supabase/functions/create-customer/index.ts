import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verify Admin Session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // 2. Verify Admin Role
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('customers')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || adminProfile?.role !== 'admin') {
      throw new Error('Forbidden: Admin access required')
    }

    // 3. Extract Request Body
    const { name, email, pin, initialDeposit, accountType } = await req.json()
    const password = `Flagstar-${Math.random().toString(36).slice(-8)}` // Temp password

    // 4. Hash PIN
    const pinHash = await bcrypt.hash(pin)

    // 5. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name }
    })

    if (authError) throw authError

    const customerId = authUser.user.id
    const accountNumber = `FLAG-10${Math.floor(1000 + Math.random() * 9000)}`

    // 6. Create Customer Profile
    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        id: customerId,
        name,
        email,
        account_number: accountNumber,
        pin_hash: pinHash,
        balance: parseFloat(initialDeposit) || 0,
        role: 'member',
        kyc_status: 'verified'
      })

    if (customerError) throw customerError

    // 7. Create Account Record
    const { data: accountData, error: accountError } = await supabaseAdmin
      .from('accounts')
      .insert({
        customer_id: customerId,
        type: accountType || 'Checking',
        account_number: accountNumber,
        balance: parseFloat(initialDeposit) || 0,
        status: 'active'
      })
      .select()
      .single()

    if (accountError) throw accountError

    // 8. Generate Security Codes
    const generateCode = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    await supabaseAdmin
      .from('admin_codes')
      .insert({
        account_id: accountNumber,
        cot_code: generateCode('COT'),
        tax_code: generateCode('TAX'),
        irs_code: generateCode('IRS'),
        created_by: user.id
      })

    // 9. Audit Log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'CREATE_CUSTOMER',
        target_id: customerId,
        details: { accountNumber, email, initialDeposit }
      })

    return new Response(
      JSON.stringify({
        success: true,
        accountNumber,
        customerId,
        tempPassword: password // In real world, send via email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
