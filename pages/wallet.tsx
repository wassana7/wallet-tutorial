import React, { useContext, useEffect } from "react";
import { NextPage } from "next";
import { Button, Tooltip } from "antd";
import { GlobalContext } from "../context";
import { useRouter } from "next/router";
import styles from "../styles/Wallet.module.css";
import TransactionLayout from "../components/TransactionLayout";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { refreshBalance } from "../utils";

const Wallet: NextPage = () => {
  const { network, account, balance, setBalance } = useContext(GlobalContext);

  const router = useRouter();

  useEffect(() => {
    if (!account) {
      router.push("/");
      return;
    }
    refreshBalance(network, account)
      .then((updatedBalance) => {
        setBalance(updatedBalance);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [account, router, network]);

  const handleAirdrop = async () => {
    try {
      const connection = new Connection(clusterApiUrl(network), "confirmed");
      const publicKey = account?.publicKey;
      const transaction = await connection.requestAirdrop(
        publicKey,
        LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(transaction);
      setBalance(await refreshBalance(network, account));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {account && (
        <div className={styles.wallet}>
          <h1>Account Dashboard</h1>
          <p>Account: {account?.publicKey.toString()}</p>
          <p>
            Connected to{" "}
            {network === "mainnet-beta"
              ? network.charAt(0).toUpperCase() + network.slice(1, 7)
              : network.charAt(0).toUpperCase() + network.slice(1)}
          </p>
          <h2>
            {balance} <span>SOL</span>
          </h2>
          {network === "devnet" && account && (
            <>
              <Button onClick={handleAirdrop} className={styles.airdrop}>
                Airdrop
              </Button>
              <Tooltip
                title="Click to receive 1 devnet SOL into your account"
                placement={"right"}
              >
                <p className={styles.question}>?</p>
              </Tooltip>
            </>
          )}
          <TransactionLayout />
        </div>
      )}
    </>
  );
};

export default Wallet;
