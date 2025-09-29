"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, FileText } from "lucide-react";

// Types
interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: KYCFormData) => void;
}

export interface KYCFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  documentType: "passport" | "drivers_license" | "national_id";
  documentNumber: string;
  documentFile: File | null;
}

// Zod Schema
const kycSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number with country code"),
  dateOfBirth: z.string().refine(date => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }, "You must be at least 18 years old"),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  documentType: z
    .enum(["passport", "drivers_license", "national_id"])
    .refine(val => val !== undefined, "Please select a document type"),
  documentNumber: z
    .string()
    .min(1, "Document number is required")
    .regex(/^[A-Za-z0-9]+$/, "Document number must be alphanumeric"),
  documentFile: z
    .instanceof(File, { message: "Please upload a document" })
    .refine(
      file => file && file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      file =>
        file &&
        (file.type.startsWith("image/") || file.type === "application/pdf"),
      "File must be an image or PDF"
    ),
});

type FormData = z.infer<typeof kycSchema>;

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "Hong Kong",
];

const documentTypes = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID" },
];

export const KYCModal: React.FC<KYCModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(kycSchema),
    mode: "onBlur",
  });

  const watchedValues = watch();

  const handleFileUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("File must be an image or PDF");
      return;
    }
    setUploadedFile(file);
    setValue("documentFile", file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["firstName", "lastName", "email", "phone", "dateOfBirth"];
      case 2:
        return ["streetAddress", "city", "state", "postalCode", "country"];
      case 3:
        return ["documentType", "documentNumber", "documentFile"];
      default:
        return [];
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Mock API call with 2s delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("KYC verification submitted successfully!");
      onSuccess?.(data);
      onClose();
    } catch {
      toast.error("Failed to submit KYC verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    const hasData = Object.values(getValues()).some(
      value => value !== "" && value !== null && value !== undefined
    );

    if (hasData) {
      if (
        confirm("You have unsaved changes. Are you sure you want to close?")
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  step < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          {...register("phone")}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-destructive mt-1">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          {...register("dateOfBirth")}
          className={errors.dateOfBirth ? "border-destructive" : ""}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-destructive mt-1">
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="streetAddress">Street Address *</Label>
        <Input
          id="streetAddress"
          {...register("streetAddress")}
          className={errors.streetAddress ? "border-destructive" : ""}
        />
        {errors.streetAddress && (
          <p className="text-sm text-destructive mt-1">
            {errors.streetAddress.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register("city")}
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && (
            <p className="text-sm text-destructive mt-1">
              {errors.city.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="state">State/Province *</Label>
          <Input
            id="state"
            {...register("state")}
            className={errors.state ? "border-destructive" : ""}
          />
          {errors.state && (
            <p className="text-sm text-destructive mt-1">
              {errors.state.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            {...register("postalCode")}
            className={errors.postalCode ? "border-destructive" : ""}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive mt-1">
              {errors.postalCode.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="country">Country *</Label>
          <Select
            value={watchedValues.country}
            onValueChange={value => setValue("country", value)}
          >
            <SelectTrigger
              className={errors.country ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-destructive mt-1">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="documentType">Document Type *</Label>
        <Select
          value={watchedValues.documentType}
          onValueChange={value =>
            setValue(
              "documentType",
              value as "passport" | "drivers_license" | "national_id"
            )
          }
        >
          <SelectTrigger
            className={errors.documentType ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.documentType && (
          <p className="text-sm text-destructive mt-1">
            {errors.documentType.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="documentNumber">Document Number *</Label>
        <Input
          id="documentNumber"
          {...register("documentNumber")}
          className={errors.documentNumber ? "border-destructive" : ""}
        />
        {errors.documentNumber && (
          <p className="text-sm text-destructive mt-1">
            {errors.documentNumber.message}
          </p>
        )}
      </div>

      <div>
        <Label>Document Upload *</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground hover:border-primary"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          {uploadedFile ? (
            <div className="space-y-2">
              <FileText className="w-8 h-8 mx-auto text-primary" />
              <p className="text-sm font-medium">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, PDF up to 5MB
              </p>
            </div>
          )}
        </div>
        {errors.documentFile && (
          <p className="text-sm text-destructive mt-1">
            {errors.documentFile.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Address Information";
      case 3:
        return "Identity Verification";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">KYC Verification</DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">{getStepTitle()}</h3>
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of 3
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {renderStepContent()}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="w-full md:w-auto"
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="w-full md:w-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Verification"
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
