import { useDeleteConfig } from "~/queries/config";
import type { IConfig } from "~/queries/config";
import { Button } from "@dash0/components/ui/button";

export default function DeleteConfigButton({ config }: { config: IConfig }) {
  const mutation = useDeleteConfig();

  const handleDelete = async () => {
    mutation.mutateAsync({
      id: config.id,
      name: config.name,
      config: config.config,
    });
  };

  return <Button onClick={handleDelete}>Delete</Button>;
}
