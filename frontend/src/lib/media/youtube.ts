import { z } from "zod";
import yt from "youtube-dl-exec";

export const youtubeApprovalSchema = z.object({
  url: z
    .string()
    .regex(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      "Invalid Youtube URL",
    ),
  message: z
    .string()
    .min(1, { message: "Message must be at least 1 character" })
    .max(250, { message: "Message must be at most 250 characters" }),
});

export const checkYoutubeVideo = async (url: string) => {
  const output = await yt(url, {
    // downloadSections: "*00:00:10-00:00:40"
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: ["referer:youtube.com", "user-agent:googlebot"],
  });
};
