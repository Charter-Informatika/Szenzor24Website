import { Checkbox } from "@/components/ui/checkbox";
import { InputGroup } from "@/components/ui/input-group";
import { passwordValidation } from "@/utils/validations";
import { integrations, messages } from "@integrations-config";
import axios from "axios";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  privacyPolicy: boolean;
};

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<Input>();

  const password = watch("password");

  async function onSubmit({ privacyPolicy, confirmPassword, ...payload }: Input) {
    if (!integrations?.isAuthEnabled) {
      toast.error(messages?.auth);
      return;
    }

    try {
      await axios.post("/api/register", {
        ...payload,
        name: payload.fullName,
      });

      toast.success("Regisztráció sikeres! Most már bejelentkezhetsz.");
      reset();
    } catch (error) {
      toast.error("Valami hiba történt.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        <InputGroup
          label="Teljes név"
          placeholder="Keresztnév és vezetéknév"
          required
          {...register("fullName", { required: "Teljes név megadása kötelező" })}
          errorMessages={errors.fullName?.message}
        />
      </div>

      <div className="mb-5">
        <InputGroup
          type="email"
          label="Munkahelyi email"
          placeholder="Add meg az email címed"
          required
          {...register("email", {
            required: "Email megadása kötelező",
            validate: (value) => value.includes("@") || "Érvénytelen email cím",
          })}
          errorMessages={errors.email?.message}
        />
      </div>

      <div className="mb-5">
        <InputGroup
          type="password"
          label="Jelszó"
          placeholder="Add meg a jelszavad"
          required
          {...register("password", {
            required: "Jelszó megadása kötelező",
            validate: (value) =>
              passwordValidation(value) ||
              "A jelszónak tartalmaznia kell legalább egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert",
          })}
          errorMessages={errors.password?.message}
        />
      </div>

      <div className="mb-6">
        <InputGroup
          type="password"
          label="Jelszó megerősítése"
          placeholder="Add meg újra a jelszavad"
          required
          {...register("confirmPassword", {
            required: "Jelszó megerősítése kötelező",
            validate: (value) =>
              value === password || "A jelszavak nem egyeznek",
          })}
          errorMessages={errors.confirmPassword?.message}
        />
      </div>

      <div className="mb-[30px]">
        <Controller
          control={control}
          name="privacyPolicy"
          rules={{ required: "El kell fogadnod a felhasználási feltételeket" }}
          render={({ field, fieldState }) => (
            <>
              <Checkbox
                name={field.name}
                onChange={(e) => field.onChange(e.target.checked)}
                defaultChecked={field.value}
                label={
                  <>
                    A fiók létrehozásával elfogadod a{" "}
                    <Link
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Felhasználási feltételek
                    </Link>
                    , és a mi{" "}
                    <Link
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Adatvédelmi irányelveinket
                    </Link>
                  </>
                }
              />
              {fieldState.error && (
                <p className="mt-2 text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      <button className="bg-primary hover:bg-primary/90 flex w-full justify-center rounded-md p-3 text-base font-medium text-white">
        Regisztráció
      </button>
    </form>
  );
}
