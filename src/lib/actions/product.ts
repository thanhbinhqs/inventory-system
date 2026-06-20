"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const cost_price = parseFloat(formData.get("cost_price") as string);
  const selling_price = parseFloat(formData.get("selling_price") as string);
  const min_stock = parseInt(formData.get("min_stock") as string) || 0;
  const barcode = (formData.get("barcode") as string) || null;

  if (!name || !sku || !cost_price || !selling_price) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  const { error } = await supabase.from("products").insert({
    name,
    sku,
    cost_price,
    selling_price,
    min_stock,
    barcode,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const cost_price = parseFloat(formData.get("cost_price") as string);
  const selling_price = parseFloat(formData.get("selling_price") as string);
  const min_stock = parseInt(formData.get("min_stock") as string) || 0;
  const barcode = (formData.get("barcode") as string) || null;

  if (!id || !name || !sku || !cost_price || !selling_price) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  const { error } = await supabase
    .from("products")
    .update({ name, sku, cost_price, selling_price, min_stock, barcode })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();

  // Check if product has transactions
  const { count } = await supabase
    .from("inventory_transactions")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  if (count && count > 0) {
    return { error: `Không thể xóa sản phẩm này vì có ${count} giao dịch liên quan` };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function getProductWithStock(productId: string) {
  const supabase = await createClient();

  // Lấy thông tin sản phẩm
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (productError) return { error: productError.message };

  // Lấy tồn kho hiện tại
  const { data: summary } = await supabase
    .from("inventory_summary")
    .select("current_stock")
    .eq("id", productId)
    .single();

  // Lấy giá nhập gần nhất
  const { data: lastImport } = await supabase
    .from("inventory_transactions")
    .select("price, transaction_date")
    .eq("product_id", productId)
    .eq("type", "IN")
    .order("transaction_date", { ascending: false })
    .limit(1)
    .single();

  return {
    product,
    current_stock: (summary as any)?.current_stock ?? 0,
    last_import_price: (lastImport as any)?.price ?? null,
    last_import_date: (lastImport as any)?.transaction_date ?? null,
  };
}

export async function quickImport(formData: FormData) {
  const supabase = await createClient();

  const productId = formData.get("product_id") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);
  const note = (formData.get("note") as string) || null;

  if (!productId || !quantity || !price) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  const { error } = await supabase.from("inventory_transactions").insert({
    product_id: productId,
    type: "IN",
    quantity,
    price,
    note,
    transaction_date: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

export async function searchProducts(query: string) {
  const supabase = await createClient();

  if (!query.trim()) {
    return { products: [] };
  }

  const q = query.trim().toLowerCase();

  // Split search into name-like query and exact barcode check
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .or(
      `name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%`
    )
    .order("name")
    .limit(30);

  if (error) return { error: error.message, products: [] };
  return { products: products ?? [] };
}

export async function createSalesTransaction(items: {
  product_id: string;
  quantity: number;
  price: number;
}[]) {
  const supabase = await createClient();
  for (const item of items) {
    const { data: summary } = await supabase
      .from("inventory_summary")
      .select("current_stock")
      .eq("id", item.product_id)
      .single();

    if (summary && summary.current_stock < item.quantity) {
      return {
        error: `Sản phẩm #${item.product_id.slice(0, 8)} không đủ hàng! Tồn kho: ${summary.current_stock}`,
      };
    }
  }

  const { error } = await supabase.from("inventory_transactions").insert(
    items.map((item) => ({
      product_id: item.product_id,
      type: "OUT" as const,
      quantity: item.quantity,
      price: item.price,
      transaction_date: new Date().toISOString(),
      note: "Bán hàng",
    }))
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { success: true, count: items.length };
}
