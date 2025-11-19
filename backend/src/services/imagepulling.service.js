import { Prisma } from "@prisma/client";

// Get all images for the logged-in user
export async function getUserImages(userId) {
  return Prisma.images.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      moderation_logs: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });
}

// Get a single image with full logs
export async function getImageWithLogs(imageId, userId) {
  return Prisma.images.findFirst({
    where: { id: imageId, user_id: userId },
    include: {
      moderation_logs: {
        orderBy: { created_at: "desc" },
      },
    },
  });
}

// Get only the status of an image
export async function getImageStatus(imageId, userId) {
  return Prisma.images.findFirst({
    where: { id: imageId, user_id: userId },
    select: { id: true, status: true },
  });
}
