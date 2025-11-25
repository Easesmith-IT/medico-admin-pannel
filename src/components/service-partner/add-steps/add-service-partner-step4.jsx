import DatePicker from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFieldArray, useFormContext } from "react-hook-form";

export const AddServicePartnerStep4 = () => {
  const { control, setValue, watch, register, getValues } = useFormContext();

  // FIELD ARRAYS
  const eduArray = useFieldArray({
    control,
    name: "educationalCertificates",
  });
  const profArray = useFieldArray({
    control,
    name: "professionalCertificates",
  });
  const expArray = useFieldArray({
    control,
    name: "experienceCertificates",
  });

  // Profile photo (image preview)
  const [photoPreview, setPhotoPreview] = useState(null);

  const photo = watch("profilePhoto");

  useEffect(() => {
    if (!photo) return setPhotoPreview(null);

    if (typeof photo === "string") {
      setPhotoPreview(photo);
    } else if (photo instanceof File) {
      setPhotoPreview(URL.createObjectURL(photo));
    }
  }, [photo]); // <---- FIXED

  // Dropzone for profile photo
  const onDropPhoto = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles?.length) return;
      const file = acceptedFiles[0];
      setValue("profilePhoto", file, {
        shouldValidate: true,
        shouldTouch: true,
      });
      setPhotoPreview(URL.createObjectURL(file));
    },
    [setValue]
  );

  const { getRootProps: getRootPhotoProps, getInputProps: getInputPhotoProps } =
    useDropzone({
      onDrop: onDropPhoto,
      accept: { "image/*": [] },
      maxFiles: 1,
    });

  // Generic helper for PDF file inputs (store File object)
  function handlePdfChange(e, path) {
    const file = e.target.files?.[0];

    if (!file) return setValue(path, undefined);
    console.log("file", file);
    setValue(path, file, { shouldValidate: true, shouldTouch: true });
  }

  // Helper to display filename for a given path inside documents
  function filenameFor(path) {
    const val = watch(path);

    if (!val) return "";
    if (typeof val === "string") return val.split("/").pop();
    if (val instanceof File) return val.name;
    return "selected";
  }

  function removeFile(path) {
    setValue(path, null, { shouldValidate: true, shouldTouch: true });
    // if we removed profilePhoto, revoke preview
    if (path === "profilePhoto") setPhotoPreview(null);
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo (image preview) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <h4 className="font-medium mb-2">Profile Photo</h4>
          <div
            {...getRootPhotoProps()}
            className="border rounded p-3 cursor-pointer min-h-24 flex items-center justify-center"
          >
            <input {...getInputPhotoProps()} />
            <div className="text-center">
              <div className="text-sm">
                Drop or click to upload profile photo
              </div>
              <div className="text-xs text-muted-foreground">
                JPEG/PNG recommended
              </div>
            </div>
          </div>
          {photoPreview ? (
            <div className="mt-3">
              <Image
                src={photoPreview}
                alt="profile preview"
                width={160}
                height={160}
                className="rounded"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  onClick={() => removeFile("profilePhoto")}
                  type="button"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Identity Proof */}
        <div className="md:col-span-2">
          <h4 className="font-medium mb-2">Identity Proof</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <FormField
              control={control}
              name="identityProof.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aadhar">Aadhar</SelectItem>
                        <SelectItem value="PAN">PAN</SelectItem>
                        <SelectItem value="Voter ID">Voter ID</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="identityProof.documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-3">
            {/* <FormItem>
              <FormLabel>Upload Identity Document (PDF)</FormLabel>
              <div className="flex items-center gap-3">
                <input
                  id="identity-doc"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    handlePdfChange(e, "identityProof.documentUrl")
                  }
                />
                <Button type="button" asChild>
                  <label htmlFor="identity-doc">Upload PDF</label>
                </Button>
                <FormMessage></FormMessage>
                <div className="text-sm">
                  {filenameFor("identityProof.documentUrl")}
                </div>
                {filenameFor("identityProof.documentUrl") && (
                  <Button
                    variant="ghost"
                    onClick={() => removeFile("identityProof.documentUrl")}
                    type="button"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <FormDescription>
                Accepted: PDF. Store as File — upload handled on submit.
              </FormDescription>
            </FormItem> */}

            <FormField
              control={control}
              name="identityProof.documentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Identity Document (PDF)</FormLabel>

                  <FormControl>
                    <div className="flex items-center gap-3">
                      {/* Hidden actual input */}
                      <input
                        id="identity-doc"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          field.onChange(file); // 🔥 store File in RHF
                        }}
                      />

                      {/* Button acting as label */}
                      <Button type="button" asChild>
                        <label htmlFor="identity-doc">Upload PDF</label>
                      </Button>

                      {/* Show filename */}
                      {field.value && (
                        <div className="text-sm">{field.value.name}</div>
                      )}

                      {/* Remove button */}
                      {field.value && (
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => field.onChange(null)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </FormControl>

                  <FormDescription>
                    Accepted: PDF. File is stored in form state and uploaded on
                    submit.
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Address Proof */}
      <div>
        <h4 className="font-medium mb-2">Address Proof</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <FormField
            control={control}
            name="addressProof.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aadhar">Aadhar</SelectItem>
                      <SelectItem value="Utility Bill">Utility Bill</SelectItem>
                      <SelectItem value="Rent Agreement">
                        Rent Agreement
                      </SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            id="address-doc"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handlePdfChange(e, "addressProof.documentUrl")}
          />
          <Button type="button" asChild>
            <label htmlFor="address-doc">Upload PDF</label>
          </Button>
          <div className="text-sm">
            {filenameFor("addressProof.documentUrl")}
          </div>
          {filenameFor("addressProof.documentUrl") && (
            <Button
              variant="ghost"
              onClick={() => removeFile("addressProof.documentUrl")}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Educational Certificates (array) */}
      <div>
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Educational Certificates</h4>
          <Button
            type="button"
            onClick={() =>
              eduArray.append({
                degree: "",
                institution: "",
                year: undefined,
                certificateUrl: undefined,
              })
            }
          >
            Add
          </Button>
        </div>

        <div className="space-y-3 mt-3">
          {eduArray.fields.map((f, idx) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end"
            >
              <FormField
                control={control}
                name={`educationalCertificates.${idx}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`educationalCertificates.${idx}.institution`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`educationalCertificates.${idx}.year`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col justify-end gap-2">
                <div>
                  <input
                    id={`edu-cert-${idx}`}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      handlePdfChange(
                        e,
                        `educationalCertificates.${idx}.certificateUrl`
                      )
                    }
                  />

                  <div className="text-xs">
                    {filenameFor(
                      `educationalCertificates.${idx}.certificateUrl`
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" asChild>
                    <label htmlFor={`edu-cert-${idx}`}>Upload PDF</label>
                  </Button>

                  <Button variant="ghost" onClick={() => eduArray.remove(idx)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Professional Certificates (array) */}
      <div>
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Professional Certificates</h4>
          <Button
            type="button"
            onClick={() =>
              profArray.append({
                certificateName: "",
                issuingAuthority: "",
                issueDate: "",
                expiryDate: "",
                certificateUrl: undefined,
              })
            }
          >
            Add
          </Button>
        </div>

        <div className="space-y-3 mt-3">
          {profArray.fields.map((f, idx) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end"
            >
              <FormField
                control={control}
                name={`professionalCertificates.${idx}.certificateName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`professionalCertificates.${idx}.issuingAuthority`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Authority</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`professionalCertificates.${idx}.issueDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`professionalCertificates.${idx}.expiryDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col justify-end gap-2">
                <div>
                  <input
                    id={`prof-cert-${idx}`}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      handlePdfChange(
                        e,
                        `professionalCertificates.${idx}.certificateUrl`
                      )
                    }
                  />

                  <div className="text-sm">
                    {filenameFor(
                      `professionalCertificates.${idx}.certificateUrl`
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" asChild>
                    <label htmlFor={`prof-cert-${idx}`}>Upload PDF</label>
                  </Button>

                  <Button variant="ghost" onClick={() => profArray.remove(idx)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Registration Certificate */}
      <div>
        <h4 className="font-medium mb-2">Registration Certificate</h4>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
          <FormField
            control={control}
            name="registrationCertificate.issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="registrationCertificate.expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            id="reg-cert"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) =>
              handlePdfChange(e, "registrationCertificate.certificateUrl")
            }
          />

          <Button type="button" asChild>
            <label htmlFor="reg-cert">Upload PDF</label>
          </Button>

          <div className="text-sm">
            {filenameFor("registrationCertificate.certificateUrl")}
          </div>
          {filenameFor("registrationCertificate.certificateUrl") && (
            <Button
              variant="ghost"
              onClick={() =>
                removeFile("registrationCertificate.certificateUrl")
              }
              type="button"
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Experience Certificates (array) */}
      <div>
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Experience Certificates</h4>
          <Button
            type="button"
            onClick={() =>
              expArray.append({
                organization: "",
                role: "",
                from: "",
                to: "",
                certificateUrl: undefined,
              })
            }
          >
            Add
          </Button>
        </div>

        <div className="space-y-3 mt-3">
          {expArray.fields.map((f, idx) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end"
            >
              <FormField
                control={control}
                name={`experienceCertificates.${idx}.organization`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`experienceCertificates.${idx}.role`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`experienceCertificates.${idx}.from`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`experienceCertificates.${idx}.to`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col justify-end gap-2">
                <div>
                  <input
                    id={`exp-cert-${idx}`}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      handlePdfChange(
                        e,
                        `experienceCertificates.${idx}.certificateUrl`
                      )
                    }
                  />

                  <div className="text-sm">
                    {filenameFor(
                      `experienceCertificates.${idx}.certificateUrl`
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" asChild>
                    <label htmlFor={`exp-cert-${idx}`}>Upload PDF</label>
                  </Button>

                  <Button variant="ghost" onClick={() => expArray.remove(idx)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Police Verification */}
      <div>
        <h4 className="font-medium mb-2">Police Verification</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <FormField
            control={control}
            name="policeVerification.issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            id="police-cert"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) =>
              handlePdfChange(e, "policeVerification.certificateUrl")
            }
          />

          <Button type="button" asChild>
            <label htmlFor="police-cert">Upload PDF</label>
          </Button>

          <div className="text-sm">
            {filenameFor("policeVerification.certificateUrl")}
          </div>
          {filenameFor("policeVerification.certificateUrl") && (
            <Button
              variant="ghost"
              onClick={() => removeFile("policeVerification.certificateUrl")}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
