import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface OrderRequest {
  items: CartItem[];
  shippingAddressId: string;
  paymentMethod: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { items, shippingAddressId, paymentMethod, notes }: OrderRequest = await req.json();

    if (!items || items.length === 0) {
      throw new Error('No items in order');
    }

    console.log('Creating order for user:', user.id, 'with', items.length, 'items');

    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      // Fetch actual price from database
      const { data: variant, error: variantError } = await supabaseClient
        .from('product_variants')
        .select('id, price, product_id, stock_quantity')
        .eq('id', item.variantId)
        .eq('is_active', true)
        .single();

      if (variantError || !variant) {
        console.error('Variant not found:', item.variantId, variantError);
        throw new Error(`Invalid product variant: ${item.variantId}`);
      }

      // Check stock
      if (variant.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for variant ${item.variantId}`);
      }

      // Get product details
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('title')
        .eq('id', variant.product_id)
        .single();

      if (productError || !product) {
        console.error('Product not found:', variant.product_id, productError);
        throw new Error(`Invalid product: ${variant.product_id}`);
      }

      // Get primary image
      const { data: image } = await supabaseClient
        .from('product_images')
        .select('image_url')
        .eq('product_id', variant.product_id)
        .eq('is_primary', true)
        .single();

      // Calculate item total using server-side price
      const itemTotal = Number(variant.price) * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: variant.product_id,
        productName: product.title,
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: variant.price,
        totalPrice: itemTotal,
        productImage: image?.image_url || null,
        variantColor: item.color || null,
        variantSize: item.size || null,
      });
    }

    console.log('Validated items, total amount:', totalAmount);

    // Create order using service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate order number
    const { data: orderNumber, error: orderNumError } = await supabaseAdmin.rpc('generate_order_number');
    
    if (orderNumError) {
      console.error('Error generating order number:', orderNumError);
      throw new Error('Failed to generate order number');
    }

    // Insert order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        shipping_address_id: shippingAddressId,
        payment_method: paymentMethod,
        payment_status: 'pending',
        status: 'pending',
        order_number: orderNumber,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('Order created:', order.id);

    // Insert order items
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      product_image: item.productImage,
      variant_color: item.variantColor,
      variant_size: item.variantSize,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw new Error('Failed to create order items');
    }

    // Update stock quantities
    for (const item of validatedItems) {
      const { data: currentVariant } = await supabaseAdmin
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variantId)
        .single();

      if (currentVariant) {
        const newStock = currentVariant.stock_quantity - item.quantity;
        const { error: stockError } = await supabaseAdmin
          .from('product_variants')
          .update({ stock_quantity: newStock })
          .eq('id', item.variantId);

        if (stockError) {
          console.error('Error updating stock:', stockError);
          // Continue anyway - stock update is not critical for order creation
        }
      }
    }

    console.log('Order created successfully:', order.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        orderNumber: order.order_number,
        totalAmount: totalAmount 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-order function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred creating the order';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
