"use server";

export const requestToken = async ({
  baseUrl,
  address,
}: {
  baseUrl: string;
  address: string;
}) => {
  const response = await fetch(`${baseUrl}/api/faucet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    return {
      error: errorData.error || "Failed to request IDRX. Please try again.",
    };
  }

  return response.json();
};
