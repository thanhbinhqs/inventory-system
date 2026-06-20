"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();

  const productId = formData.get("product_id") as string;
  const type = formData.get("type") as "IN" | "OUT";
  const quantity = parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);
  const note = (formData.get("note") as string) || null;
  const transactionDate =
    (formData.get("transaction_date") as string) || new Date().toISOString();

  // Validation
  if (!productId || !type || !quantity || !price) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  if (quantity <= 0) {
    return { error: "Số lượng phải lớn hơn 0" };
  }

  if (price <= 0) {
    return { error: "Đơn giá phải lớn hơn 0" };
  }

  // Check stock for OUT transactions
  if (type === "OUT") {
    const { data: summary } = await supabase
      .from("inventory_summary")
      .select("current_stock")
      .eq("id", productId)
      .single();

    if (summary && summary.current_stock < quantity) {
      return {
        error: `Không đủ hàng trong kho! Tồn kho hiện tại: ${summary.current_stock}`,
      };
    }
  }

  const { error } = await supabase.from("inventory_transactions").insert({
    product_id: productId,
    type,
    quantity,
    price,
    note,
    transaction_date: transactionDate,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("inventory_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}
