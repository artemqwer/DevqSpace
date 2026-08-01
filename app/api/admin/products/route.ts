import { getSession } from "@/lib/session";
import { saveProduct, deleteProduct, slugExists } from "@/lib/store";
import { buildProduct } from "@/lib/productInput";

// CREATE
export async function POST(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  const product = buildProduct(body);
  if (!product)
    return Response.json(
      { ok: false, error: "Вкажіть назву товару" },
      { status: 400 },
    );

  if (await slugExists(product.slug)) {
    return Response.json(
      { ok: false, error: `Slug "${product.slug}" вже існує` },
      { status: 409 },
    );
  }

  await saveProduct(product);
  return Response.json({ ok: true, slug: product.slug });
}

// UPDATE
export async function PUT(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) return Response.json({ ok: false }, { status: 400 });

  const product = buildProduct(body);
  if (!product)
    return Response.json(
      { ok: false, error: "Вкажіть назву товару" },
      { status: 400 },
    );

  await saveProduct(product);
  return Response.json({ ok: true, slug: product.slug });
}

// DELETE
export async function DELETE(req: Request) {
  if (!(await getSession()))
    return Response.json({ ok: false }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return Response.json({ ok: false }, { status: 400 });
  await deleteProduct(slug);
  return Response.json({ ok: true });
}
