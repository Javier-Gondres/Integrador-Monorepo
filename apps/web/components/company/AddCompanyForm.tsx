import {
  Button,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
} from "@headlessui/react";
import { Company } from "@repo/db";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { createCompany } from "../../actions/create-company-action";
import { updateCompany as updateAction } from "../../actions/update-company-action";
import { DraftCompany } from "../../src/types";
import Error from "../ui/Error";

type AddCompanyFormProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  company: Company | null;
  stateSelection: Dispatch<SetStateAction<Company | null>>;
};

export default function AddCompanyForm({
  open,
  onOpenChange,
  company,
  stateSelection,
}: AddCompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DraftCompany>();

  useEffect(() => {
    if (open) {
      reset({
        name: company?.name ?? "",
        rnc: company?.rnc ?? "",
      });
    }
  }, [open, company, reset]);

  const registerCompany = (data: DraftCompany) => {
    createCompany(data);
    reset();
    onOpenChange(false);
    toast.success("Empresa creada exitosamente");
  };

  const updateCompany = (data: DraftCompany) => {
    if (company) {
      updateAction(data, company?.slug);
      reset();
      onOpenChange(false);
      toast.success("Empresa actualizada exitosamente");
    }
  };

  const handleClose = () => {
    stateSelection(null);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      as="div"
      className="relative z-10 focus:outline-none"
      onClose={() => handleClose()}
    >
      {/* Para mostrar el background oscuro */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true">
        {/* Contenedor de pantalla completa */}
        <div className="fixed inset-0 z-10 w-full overflow-y-auto">
          {/* wrapper para centrar */}
          <div className="flex min-h-full items-center pb-20 justify-center p-4">
            {/* ahora si el panel de vdd */}
            <DialogPanel
              transition
              className="w-full max-w-xl rounded-xl bg-gray-200 p-6  duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-black"
              >
                {company ? "Actualizar Empresa" : "Registrar Empresa"}
              </DialogTitle>

              <form
                onSubmit={
                  company !== null
                    ? handleSubmit(updateCompany)
                    : handleSubmit(registerCompany)
                }
                noValidate
              >
                <Field className={"mt-5"}>
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    placeholder="Nombre de la empresa"
                    id="name"
                    defaultValue={company !== null ? company.name : ""}
                    className={
                      "block my-1 w-full bg-gray-50 py-1 border border-gray-300 rounded-md px-3"
                    }
                    {...register("name", {
                      required: "El nombre es obligatorio",
                    })}
                  />
                  {errors.name && <Error> {errors.name.message} </Error>}
                </Field>

                <Field>
                  <Label>RNC</Label>
                  <Input
                    type="text"
                    placeholder="RNC"
                    id="rnc"
                    defaultValue={company !== null ? company.rnc : ""}
                    className={
                      "block my-1 w-full bg-gray-50 py-1 border border-gray-300 rounded-md px-3"
                    }
                    {...register("rnc", { required: "El rnc es obligatorio" })}
                  />
                  {errors.rnc && <Error>{errors.rnc.message}</Error>}
                </Field>

                <div className="flex gap-2 mt-4">
                  <Button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                  >
                    {company ? "Actualizar" : "Registrar"}
                  </Button>

                  <Button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-3 py-1.5 text-sm/6 font-semibold text-black shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                    onClick={() => handleClose()}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
