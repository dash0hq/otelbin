import Logo from "./assets/svg/otelbin-logo-full.svg";
import {
  ButtonGroup,
  ButtonGroupItem,
  ButtonGroupLinkItem,
} from "@dash0/components/ui/button-group";
import { IconButton } from "@dash0hq/ui/src/components/ui/icon-button";
import { Columns, Code2, Share2 } from "lucide-react";
import { ServiceMapIcon } from "@dash0/icons";
import { useToast } from "@dash0hq/ui/src/components/ui/use-toast";
import { Button } from "@dash0hq/ui/src/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dash0/components/ui/tooltip";
import { link } from "d3-shape";

const viewModes = [
  {
    type: "both",
    Icon: Columns,
    tooltip: "Show editor and pipeline visualization",
  },
  {
    type: "code",
    Icon: Code2,
    tooltip: "Only show the editor",
  },
  {
    type: "pipeline",
    Icon: ServiceMapIcon,
    tooltip: "Only show the pipeline visualization",
  },
];

export default function AppHeader({
  activeView,
  setView,
}: {
  activeView: string;
  setView: (view: string) => void;
}) {
  const { toast } = useToast();

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    toast({
      description: "URL copied to clipboard.",
    });
  }

  return (
    <div className="flex items-center justify-between border-b-1 bg-default px-4 py-3">
      <a
        href="https://www.dash0.com?utm_source=otelbin&utm_medium=logo&utm_campaign=otelbin"
        target="_blank"
      >
        <Logo height="26" />
      </a>
      <div className="flex gap-x-2">
        <ButtonGroup size="xs" variant="default" className="!gap-0 bg-button">
          {viewModes.map(({ type, Icon, tooltip }) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <ButtonGroupItem
                  onClick={() => setView(type)}
                  className={`${
                    activeView === type ? "!rounded-[6px] bg-primary" : ""
                  }`}
                >
                  <Icon
                    className={
                      activeView === type ? "!text-button-icon-active" : ""
                    }
                  />
                </ButtonGroupItem>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </ButtonGroup>
        <Button
          onClick={handleShare}
          className={`${
            activeView === "code" && "bg-otelbinGrey"
          }  bg-otelbinPurple`}
          variant="cta"
          size="xs"
        >
          <Share2 className="-ml-1" />
          Share
        </Button>
      </div>
    </div>
  );
}
