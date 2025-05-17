"use server";

interface CheckMessageSuccess {
  signature: `0x${string}`;
  expiry: number;
}

interface RequestSuccess {
  txHash: `0x${string}`;
}

interface BaseError {
  error: string;
}

export const requestToken = async ({
  baseUrl,
  address,
}: {
  baseUrl: string;
  address: string;
}): Promise<RequestSuccess | BaseError> => {
  const response = await fetch(`${baseUrl}/api/token-faucet`, {
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

export const requestEth = async ({
  baseUrl,
  address,
}: {
  baseUrl: string;
  address: string;
}): Promise<RequestSuccess | BaseError> => {
  const response = await fetch(`${baseUrl}/api/eth-faucet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    return {
      error: errorData.error || "Failed to request ETH. Please try again.",
    };
  }

  return response.json();
};

export const checkMessage = async ({
  baseUrl,
  message,
}: {
  baseUrl: string;
  message: string;
}): Promise<CheckMessageSuccess | BaseError> => {
  const response = await fetch(`${baseUrl}/api/check-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    return {
      error: errorData.error || "Failed to check message. Please try again.",
    };
  }

  return response.json();
};
