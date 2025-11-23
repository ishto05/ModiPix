import prisma from "../config/database.js";

/* -----------------------------------------------------------
   Utility: Convert Clerk userId → DB UUID (users.id)
----------------------------------------------------------- */
async function getDbUserId(clerkUserId) {
  const user = await prisma.users.findUnique({
    where: { clerk_id: clerkUserId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found for provided Clerk user ID.");
  }

  return user.id;
}

/* -----------------------------------------------------------
   Utility: Convert BigInt → Number safely
----------------------------------------------------------- */
function convertBigInts(obj) {
  if (!obj || typeof obj !== "object") return obj;

  const converted = {};
  for (const key in obj) {
    const val = obj[key];

    if (typeof val === "bigint") {
      converted[key] = Number(val);
    } else if (Array.isArray(val)) {
      converted[key] = val.map((item) => convertBigInts(item));
    } else if (val && typeof val === "object") {
      converted[key] = convertBigInts(val);
    } else {
      converted[key] = val;
    }
  }
  return converted;
}

/* -----------------------------------------------------------
   Fetch all images for a Clerk user
----------------------------------------------------------- */
export async function getUserImages(clerkUserId) {
  const dbUserId = await getDbUserId(clerkUserId);

  const images = await prisma.images.findMany({
    where: { user_id: dbUserId },
    orderBy: { created_at: "desc" },
    include: {
      moderation_logs: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });

  return images.map((img) => convertBigInts(img));
}

/* -----------------------------------------------------------
   Fetch a single image with all moderation logs
----------------------------------------------------------- */
export async function getImageWithLogs(imageId, clerkUserId) {
  const dbUserId = await getDbUserId(clerkUserId);

  const image = await prisma.images.findFirst({
    where: { id: imageId, user_id: dbUserId },
    include: {
      moderation_logs: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  return convertBigInts(image);
}

/* -----------------------------------------------------------
   Fetch only image status
----------------------------------------------------------- */
export async function getImageStatus(imageId, clerkUserId) {
  const dbUserId = await getDbUserId(clerkUserId);

  const image = await prisma.images.findFirst({
    where: { id: imageId, user_id: dbUserId },
    select: { id: true, status: true, file_size: true, created_at: true },
  });

  return convertBigInts(image);
}
