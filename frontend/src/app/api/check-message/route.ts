import { messageApprovalSchema } from "@/lib/schemas";
import { generateErrorMessages } from "@/lib/utils";
import { account } from "@/lib/viem";
import { encodePacked, hexToBytes, keccak256 } from "viem";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = messageApprovalSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: generateErrorMessages(result.error) }),
        {
          status: 400,
        },
      );
    }

    const currentTime = Date.now();
    const expiry = BigInt(Math.floor(currentTime / 1000)) + BigInt(300);

    const packed = encodePacked(
      ["string", "uint256"],
      [result.data.message, expiry],
    );

    const messageHash = keccak256(packed);

    const signature = await account.signMessage({
      message: {
        raw: hexToBytes(messageHash),
      },
    });

    return new Response(JSON.stringify({ signature, expiry: Number(expiry) }), {
      status: 200,
    });
  } catch (error: unknown) {
  }
}
