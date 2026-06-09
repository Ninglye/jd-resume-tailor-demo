import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
};

function CopyButton({ text, label = "复制" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      className="secondary-button"
      disabled={!text.trim()}
      onClick={handleCopy}
      type="button"
    >
      {copied ? "已复制" : label}
    </button>
  );
}

export default CopyButton;
