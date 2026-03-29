import { useState } from "react";
import toast from "react-hot-toast";

export function useClipboard() {
  const [copiedValue, setCopiedValue] = useState("");

  async function copy(text, successMessage = "Copied to clipboard") {
    await navigator.clipboard.writeText(text);
    setCopiedValue(text);
    toast.success(successMessage);
    window.setTimeout(() => setCopiedValue(""), 1600);
  }

  return { copy, copiedValue };
}
