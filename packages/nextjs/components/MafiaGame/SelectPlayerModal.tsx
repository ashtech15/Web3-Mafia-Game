"use client";

import { useState } from "react";
import { Address as AddressType } from "viem";
import { useWriteContract } from "wagmi";
import { CheckCircleIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type RefetchLastKilled = () => void;
type RefetchState = () => void;

type SelectPlayerModalProps = {
  addresses: AddressType[];
  modalId: string;
  contractName: ContractName;
  refetchState: RefetchState;
  refetchLastKilled: RefetchLastKilled;
};

export const SelectPlayerModal = ({
  addresses,
  modalId,
  contractName,
  refetchState,
  refetchLastKilled,
}: SelectPlayerModalProps) => {
  const [selectedAddress, setSelectedAddress] = useState<AddressType>("");
  const { writeContractAsync, isPending } = useWriteContract();
  const writeTxn = useTransactor();
  const { data: mafiaContract } = useDeployedContractInfo(contractName);

  const handleAssassinKill = async () => {
    if (writeContractAsync && mafiaContract?.address) {
      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: mafiaContract.address,
            functionName: "assassinKill",
            abi: mafiaContract.abi,
            args: [selectedAddress],
          });
        await writeTxn(makeWriteWithParams);
        refetchState();
        refetchLastKilled();
      } catch (e: any) {
        console.error("⚡️ ~ file: page.tsx:handleAssassinKill ~ error", e);
      }
    }
  };

  return (
    <div>
      <label htmlFor={modalId} className="btn btn-primary btn-lg bg-base-100 gap-1">
        <DocumentCheckIcon className="h-6 w-6" />
        <span>SELECT TO KILL</span>
      </label>
      <input type="checkbox" id={modalId} className="modal-toggle" />
      <label htmlFor={modalId} className="modal cursor-pointer">
        <label className="modal-box relative">
          <h3 className="text-xl font-bold mb-3">Select Player to Kill</h3>
          <label htmlFor={modalId} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex w-full">
              <select
                className="select select-bordered w-full"
                value={selectedAddress}
                onChange={e => setSelectedAddress(e.target.value)}
              >
                <option value="" disabled>
                  Select a Player address
                </option>
                {addresses.map((address, index) => (
                  <option key={index} value={address}>
                    {address}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                className="h-10 btn btn-primary btn-sm px-2 rounded-full"
                onClick={handleAssassinKill}
                disabled={isPending}
              >
                {!isPending ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                <span>Kill</span>
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};