import {
  Button,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Company } from "@repo/db";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

import { deleteCompany } from "../../actions/delete-company-action";

type DeleteCompanyDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  company: Company;
};

export default function DeleteCompanyDialog({
  open,
  onOpenChange,
  company,
}: DeleteCompanyDialogProps) {
  const deleteHandler = () => {
    deleteCompany(company.slug);
    onOpenChange(false);
    toast.success("Empresa eliminada exitosamente");
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      as="div"
      className="relative z-10 focus:outline-none"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true">
        <div className="flex min-h-full items-center pb-20 justify-center p-4">
          <DialogPanel
            transition
            className="space-y-1 w-full max-w-md rounded-xl bg-gray-200 p-6  duration-100 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="font-semibold text-2xl text-black mb-1.5"
            >
              Eliminar empresa:{` ${company.name}?`}
            </DialogTitle>
            <Description className={"text-md text-gray-600"}>
              Confirmación de operación irreversible
            </Description>
            <p className="mt-4 mb-3">
              Esto desactivará la empresa permanentemente, esta seguro?
            </p>
            <div className="flex gap-4">
              <Button
                className="font-semibold border px-3 py-1.5 rounded-md bg-red-600 text-white shadow-inner "
                onClick={() => deleteHandler()}
              >
                Eliminar empresa
              </Button>
              <Button
                className="font-semibold border px-3 py-1.5 rounded-md bg-white text-black shadow-inner "
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
