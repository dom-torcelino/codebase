"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function MfaSettings() {
  const [qr, setQr] = useState("");
  const [base32, setBase32] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");

  const generate = async () => {
    setStatus("");
    const res = await api("/api/auth/mfa/generate", { method: "POST" });
    setQr(res.qrDataUrl);
    setBase32(res.base32);
  };

  const verify = async () => {
    setStatus("Verifying...");
    try {
      await api("/api/auth/mfa/verify", { method: "POST", body: JSON.stringify({ base32, code }) });
      setStatus("Enabled!");
    } catch (e) {
      setStatus(e?.data?.message || "Failed");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-4">Multi-Factor Authentication</h1>
      <button onClick={generate} className="rounded-lg border px-3 py-2 text-sm">Generate QR</button>
      {qr && (
        <div className="mt-4">
          <img src={qr} alt="QR" className="w-48 h-48" />
          <p className="text-xs mt-2">Secret (save for backup): {base32}</p>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="border px-3 py-2 rounded-lg"
            />
            <button onClick={verify} className="rounded-lg bg-[#1F7A8C] text-white px-3 py-2 text-sm">Verify & Enable</button>
          </div>
          <p className="text-sm mt-2">{status}</p>
        </div>
      )}
    </div>
  );
}
