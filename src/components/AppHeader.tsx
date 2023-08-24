import Logo from "./assets/svg/otelbin-logo-full.svg";
import { ButtonGroup } from "@dash0/components/ui/button-group";
import { IconButton } from "@dash0hq/ui/src/components/ui/icon-button";
import { Columns, Code2, Share2 } from "lucide-react";
import { ServiceMapIcon } from "@dash0/icons";
import { useToast } from "@dash0hq/ui/src/components/ui/use-toast";

export default function AppHeader({
  activeView,
  setView,
}: {
  activeView: string;
  setView: (view: string) => void;
}) {
  const handleViewChange = (view: string) => {
    setView(view);
  };

  const { toast } = useToast();

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast({
      description: "URL copied to clipboard.",
    });
  }

  return (
      <div className="flex py-3 items-center justify-between border-b-1 bg-default px-4">
      <a
        href="https://www.dash0.com?utm_source=otelbin&utm_medium=logo&utm_campaign=otelbin"
        target="_blank"
      >
              <Logo height='26' />
      </a>
      <div className="flex gap-x-2">
        <ButtonGroup>
          <IconButton
            className={`${activeView === "both" && "bg-otelbinGrey"} `}
            onClick={() => handleViewChange("both")}
            variant={"default"}
                      size={"xs"}
          >
            <Columns />
          </IconButton>
          <IconButton
            className={`${activeView === "code" && "bg-otelbinGrey"} `}
            onClick={() => handleViewChange("code")}
            variant={"default"}
                      size={"xs"}
          >
            <Code2 />
          </IconButton>
          <IconButton
            className={`${activeView === "pipeline" && "bg-otelbinGrey"} `}
            onClick={() => handleViewChange("pipeline")}
            variant={"default"}
                      size={"xs"}
          >
            <ServiceMapIcon />
          </IconButton>
        </ButtonGroup>
        <IconButton
          className={`${
            activeView === "code" && "bg-otelbinGrey"
                      } min-w-[90px] bg-otelbinPurple`}
          onClick={handleShare}
          variant={"default"}
                  size={"xs"}
        >
                  <Share2 color="white" className="mr-2" />
          Share
        </IconButton>
      </div>
    </div>
  );
}
