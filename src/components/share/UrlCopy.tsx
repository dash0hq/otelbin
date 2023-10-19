// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Input } from "~/components/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { IconButton } from "~/components/icon-button";
import { Copy } from "lucide-react";
import { useToast } from "~/components/use-toast";
import { track } from "@vercel/analytics";

export interface UrlCopyProps {
  url: string;
}
export function UrlCopy({ url }: UrlCopyProps) {
  const { toast } = useToast();

  return (
    <div className="mx-4 flex gap-2">‚
      <Input type="url" readOnly value={url} size="xs" />
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton size="xs" onClick={copyToClipboard}>
            <Copy />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Copy URL to clipboard</TooltipContent>
      </Tooltip>
    </div>
  );

  function copyToClipboard() {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          description: "URL copied to clipboard.",
        });
      })
      .catch((e) => {
        console.error("Failed to copy to clipboard", e);
        toast({
          description: "Failed to copy to clipboard",
        });
      });
    track("Shared Link");
  }
}
