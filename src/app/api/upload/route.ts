import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

// Dev-загрузка в /public/uploads. На проде — заменить на S3 (Yandex Object Storage и т.п.).
export async function POST(req: Request) {
  const authed = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!authed) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const data = await req.formData();
  const file = data.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Нет файла" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  await writeFile(path.join(dir, safe), bytes);
  return NextResponse.json({ url: `/uploads/${safe}` });
}
