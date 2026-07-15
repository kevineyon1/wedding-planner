import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { brosurFilePath } from "@/lib/upload";

// Route handler tidak ikut ter-proteksi oleh layout (protected)/layout.tsx,
// jadi auth harus dicek manual di sini.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const vendorId = Number(id);
  if (!vendorId) return new NextResponse("Not found", { status: 404 });

  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { brosurPath: true, brosurNama: true },
  });
  if (!vendor?.brosurPath) return new NextResponse("Not found", { status: 404 });

  try {
    const buffer = await readFile(brosurFilePath(vendor.brosurPath));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${vendor.brosurNama ?? "brosur.pdf"}"`,
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
