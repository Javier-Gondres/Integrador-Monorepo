import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/errors";
import { Modal } from "@/shared/ui/modal";

import { WasteForm } from "../components/waste-form";
import { useCreateWasteMutation } from "../hooks/use-waste";
import type { CreateWastePayload } from "../types/waste.types";

interface WasteFormModalContainerProps {
  branchId: string;
  onClose: () => void;
}

export function WasteFormModalContainer({ branchId, onClose }: WasteFormModalContainerProps) {
  const { mutateAsync: createWaste, isPending } = useCreateWasteMutation();

  const handleSubmit = async (data: CreateWastePayload) => {
    try {
      await createWaste(data);
      toast.success("Merma registrada exitosamente");
      onClose();
    } catch (e) {
      toast.error(getErrorMessage(e, "Error al registrar la merma"));
    }
  };

  return (
    <Modal
      maxWidth="600px"
      onClose={onClose}
      title="Registrar Merma"
      description="Completa los detalles para registrar una salida por merma del inventario."
    >
      <WasteForm branchId={branchId} onSubmit={handleSubmit} isSubmitting={isPending} />
    </Modal>
  );
}
