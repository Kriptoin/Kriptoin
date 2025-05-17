import { UniversalKriptoinAbi } from "@/abi/UniversalKriptoinAbi";
import { KriptoinAbi } from "@/abi/KriptoinAbi";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IDRXTokenAddress, UniversalKriptoinAddress } from "@/constants";
import { formSchema } from "@/lib/schemas";
import { TipFormData } from "@/lib/types";
import { config } from "@/lib/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Loader2, Send, TextSearch } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import { BaseError, useAccount, useBalance, useWriteContract } from "wagmi";
import { checkMessage } from "@/lib/actions";

const AMOUNTS = [5000, 10000, 25000, 50000];

export default function TipForm({
  creatorAddress,
  contractAddress,
  isToAddress,
}: {
  creatorAddress: `0x${string}` | undefined;
  contractAddress: `0x${string}` | undefined;
  isToAddress: boolean;
}) {
  const form = useForm<TipFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 1000,
      message: "",
      anonymous: false,
    },
  });

  const { isConnected, address: senderAddress } = useAccount();

  const balance = useBalance({
    address: senderAddress,
    token: IDRXTokenAddress,
    query: { enabled: !!senderAddress },
  });

  const { writeContract } = useWriteContract();

  const [isLoading, setIsLoading] = useState(false);

  const handleSendToUnregisteredCreator = (
    formData: TipFormData,
    approval: { signature: `0x${string}`; expiry: number },
  ) => {
    if (!creatorAddress) {
      toast.error("Send tip failed. Recipient address not found.");
      return;
    }

    setIsLoading(true);

    writeContract(
      {
        abi: erc20Abi,
        address: IDRXTokenAddress,
        functionName: "approve",
        args: [
          UniversalKriptoinAddress,
          parseUnits(formData.amount.toString(), 2),
        ],
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          writeContract(
            {
              abi: UniversalKriptoinAbi,
              address: UniversalKriptoinAddress,
              functionName: "sendTip",
              args: [
                creatorAddress,
                formData.anonymous ? "Anonymous" : formData.name,
                formData.message,
                parseUnits(formData.amount.toString(), 2),
                BigInt(approval.expiry),
                approval.signature,
              ],
            },
            {
              onSuccess: async (data) => {
                await waitForTransactionReceipt(config, { hash: data });

                toast.success("Tip sent successfully.");

                setIsLoading(false);
              },
              onError: (error) => {
                toast.error(
                  (error as BaseError).details ||
                    "Send tip failed. See console for detailed error.",
                );

                console.error(error.message);

                setIsLoading(false);
              },
            },
          );
        },
        onError: (error) => {
          toast.error(
            (error as BaseError).details ||
              "Approve failed. See console for detailed error.",
          );

          console.error(error.message);

          setIsLoading(false);
        },
      },
    );
  };

  const handleSendToRegisteredCreator = (
    formData: TipFormData,
    approval: { signature: `0x${string}`; expiry: number },
  ) => {
    if (!contractAddress) {
      toast.error("Send tip failed. Contract address not found.");
      return;
    }

    setIsLoading(true);

    writeContract(
      {
        abi: erc20Abi,
        address: IDRXTokenAddress,
        functionName: "approve",
        args: [contractAddress, parseUnits(formData.amount.toString(), 2)],
      },
      {
        onSuccess: async (data) => {
          await waitForTransactionReceipt(config, { hash: data });

          writeContract(
            {
              abi: KriptoinAbi,
              address: contractAddress,
              functionName: "sendTip",
              args: [
                formData.anonymous ? "Anonymous" : formData.name,
                formData.message,
                parseUnits(formData.amount.toString(), 2),
                BigInt(approval.expiry),
                approval.signature,
              ],
            },
            {
              onSuccess: async (data) => {
                await waitForTransactionReceipt(config, { hash: data });

                toast.success("Tip sent successfully.");

                setIsLoading(false);
              },
              onError: (error) => {
                toast.error(
                  (error as BaseError).details ||
                    "Send tip failed. See console for detailed error.",
                );

                console.error(error.message);

                setIsLoading(false);
              },
            },
          );
        },
        onError: (error) => {
          toast.error(
            (error as BaseError).details ||
              "Approve failed. See console for detailed error.",
          );

          console.error(error.message);

          setIsLoading(false);
        },
      },
    );
  };

  const onSubmit = async (formData: TipFormData) => {
    try {
      if (!isConnected) {
        toast.error("Send tip failed. Please connect your wallet.");
        return;
      }

      if (!creatorAddress) {
        toast.error("Send tip failed. Recipient address not found.");
        return;
      }

      if (creatorAddress.toLowerCase() === senderAddress?.toLowerCase()) {
        toast.error("Send tip failed. Cannot tip yourself.");
        return;
      }

      const message = form.watch("message");

      const result = await checkMessage({
        baseUrl: window.location.origin,
        message,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      if (isToAddress) {
        return handleSendToUnregisteredCreator(formData, result);
      }

      handleSendToRegisteredCreator(formData, result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Send tip failed.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full"
      >
        <div className="flex flex-col gap-4 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="name" className="text-sm">
                  Name
                </Label>
                <FormControl>
                  <Input
                    id="name"
                    placeholder="Name"
                    autoComplete="off"
                    {...field}
                    disabled={form.watch("anonymous")}
                    value={form.watch("anonymous") ? "Anonymous" : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center space-x-2 mr-auto -mt-2">
            <FormField
              control={form.control}
              name="anonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Switch
                      id="anonymous"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="anonymous" className="font-normal">
                    Anonymous
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount" className="text-sm">
                    Amount (IDRX)
                  </Label>
                  {balance.isSuccess && (
                    <p className="text-xs text-gray-500">
                      Balance:{" "}
                      {Number(formatUnits(balance.data.value, 2)).toFixed(2)}{" "}
                      {balance.data.symbol}
                    </p>
                  )}
                </div>
                <FormControl>
                  <Input
                    id="amount"
                    placeholder="Amount"
                    type="number"
                    step="0.0001"
                    min={form.formState.defaultValues?.amount}
                    {...field}
                  />
                </FormControl>
                <div className="flex gap-2 justify-between">
                  {AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      className="w-full"
                      variant={
                        Number(form.watch("amount")) === amount
                          ? "default"
                          : "neutral"
                      }
                      onClick={() => form.setValue("amount", amount)}
                      type="button"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="message" className="text-sm">
                    Message
                  </Label>
                  <p className="text-xs text-gray-500 ml-auto">
                    {field.value.length} / 250
                  </p>
                </div>
                <FormControl>
                  <Textarea
                    id="message"
                    placeholder="Message"
                    maxLength={250}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="mt-8 flex gap-2 items-center"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          <span>Send Tip</span>
        </Button>
      </form>
    </Form>
  );
}
