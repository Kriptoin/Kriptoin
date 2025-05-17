import { Metadata } from "next";
import { headers } from "next/headers";
import { isAddress } from "viem";
import { AddressTipPage } from "./_components/address-tip-page";
import { UsernameTipPage } from "./_components/username-tip-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: isAddress(username) ? "Kriptoin" : `${username} | Kriptoin`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const head = await headers();
  const host = head.get("host");

  const { username } = await params;

  const protocol = host?.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return isAddress(username) ? (
    <AddressTipPage address={username} baseUrl={baseUrl} />
  ) : (
    <UsernameTipPage username={username} />
  );
}
