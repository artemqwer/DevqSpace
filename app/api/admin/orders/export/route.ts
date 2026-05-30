import { getSession } from "@/lib/session";
import { getAllOrders } from "@/lib/store";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!(await getSession())) {
    return new Response("Unauthorized", { status: 401 });
  }
  const orders = await getAllOrders();

  const header = [
    "id",
    "date",
    "type",
    "product",
    "price",
    "customType",
    "budget",
    "deadline",
    "name",
    "contactMethod",
    "contact",
    "status",
    "message",
  ];

  const rows = orders.map((o) =>
    [
      o.id,
      new Date(o.createdAt).toISOString(),
      o.type,
      o.productTitle ?? "",
      o.productPrice ?? "",
      o.customType ?? "",
      o.budget ?? "",
      o.deadline ?? "",
      o.name,
      o.contactMethod,
      o.contact,
      o.status,
      o.message,
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = "﻿" + [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
