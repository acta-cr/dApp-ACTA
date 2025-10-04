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
  dateOfBirth: string;
  nationality: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  occupation: string;
  employer: string;
  annualIncome:
    | "0-25000"
    | "25000-50000"
    | "50000-100000"
    | "100000-250000"
    | "250000+";
  sourceOfFunds: string;
  purposeOfAccount: string;
  documentType: "passport" | "drivers_license" | "national_id";
  documentNumber: string;
  documentFile: File | null;
}

// Zod Schema
const kycSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
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
  nationality: z.string().min(1, "Nationality is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number with country code"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  occupation: z.string().min(1, "Occupation is required"),
  employer: z.string().min(1, "Employer is required"),
  annualIncome: z
    .enum([
      "0-25000",
      "25000-50000",
      "50000-100000",
      "100000-250000",
      "250000+",
    ])
    .refine(val => val !== undefined, "Please select an annual income range"),
  sourceOfFunds: z.string().min(1, "Source of funds is required"),
  purposeOfAccount: z.string().min(1, "Purpose of account is required"),
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

const incomeRanges = [
  { value: "0-25000", label: "$0 - $25,000" },
  { value: "25000-50000", label: "$25,000 - $50,000" },
  { value: "50000-100000", label: "$50,000 - $100,000" },
  { value: "100000-250000", label: "$100,000 - $250,000" },
  { value: "250000+", label: "$250,000+" },
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
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(kycSchema),
    mode: "onBlur",
  });

  const watchedValues = watch();

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      reset();
      setCurrentStep(1);
      setUploadedFile(null);
    }
  }, [isOpen, reset]);

  // Debug: Log form values when they change
  React.useEffect(() => {
    console.log("=== FORM VALUES DEBUG ===");
    console.log("Date of Birth:", watchedValues.dateOfBirth);
    console.log("Phone:", watchedValues.phone);
    console.log("Occupation:", watchedValues.occupation);
    console.log("Employer:", watchedValues.employer);
    console.log("Source of Funds:", watchedValues.sourceOfFunds);
    console.log("Purpose of Account:", watchedValues.purposeOfAccount);
    console.log("All values:", watchedValues);
    console.log("=========================");
  }, [watchedValues]);

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
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["firstName", "lastName", "dateOfBirth", "nationality"];
      case 2:
        return ["email", "phone", "address", "city", "postalCode", "country"];
      case 3:
        return ["occupation", "employer", "annualIncome"];
      case 4:
        return ["sourceOfFunds", "purposeOfAccount"];
      case 5:
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
        {[1, 2, 3, 4, 5].map(step => (
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
            {step < 5 && (
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
          <Label htmlFor="firstName-step1">First Name *</Label>
          <Input
            id="firstName-step1"
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
          <Label htmlFor="lastName-step1">Last Name *</Label>
          <Input
            id="lastName-step1"
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
        <Label htmlFor="dateOfBirth-step1">Date of Birth *</Label>
        <Input
          id="dateOfBirth-step1"
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

      <div>
        <Label htmlFor="nationality-step1">Nationality *</Label>
        <Select
          value={watchedValues.nationality}
          onValueChange={value => setValue("nationality", value)}
        >
          <SelectTrigger
            className={errors.nationality ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select nationality" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.nationality && (
          <p className="text-sm text-destructive mt-1">
            {errors.nationality.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email-step2">Email Address *</Label>
        <Input
          id="email-step2"
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
        <Label htmlFor="phone-step2">Phone Number *</Label>
        <Input
          id="phone-step2"
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
        <Label htmlFor="address-step2">Address *</Label>
        <Input
          id="address-step2"
          {...register("address")}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && (
          <p className="text-sm text-destructive mt-1">
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city-step2">City *</Label>
          <Input
            id="city-step2"
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
          <Label htmlFor="postalCode-step2">Postal Code *</Label>
          <Input
            id="postalCode-step2"
            {...register("postalCode")}
            className={errors.postalCode ? "border-destructive" : ""}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive mt-1">
              {errors.postalCode.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="country-step2">Country *</Label>
        <Select
          value={watchedValues.country}
          onValueChange={value => setValue("country", value)}
        >
          <SelectTrigger className={errors.country ? "border-destructive" : ""}>
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
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="occupation-step3">Occupation *</Label>
        <Input
          id="occupation-step3"
          {...register("occupation")}
          className={errors.occupation ? "border-destructive" : ""}
        />
        {errors.occupation && (
          <p className="text-sm text-destructive mt-1">
            {errors.occupation.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="employer-step3">Employer *</Label>
        <Input
          id="employer-step3"
          {...register("employer")}
          className={errors.employer ? "border-destructive" : ""}
        />
        {errors.employer && (
          <p className="text-sm text-destructive mt-1">
            {errors.employer.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="annualIncome-step3">Annual Income *</Label>
        <Select
          value={watchedValues.annualIncome}
          onValueChange={value =>
            setValue(
              "annualIncome",
              value as
                | "0-25000"
                | "25000-50000"
                | "50000-100000"
                | "100000-250000"
                | "250000+"
            )
          }
        >
          <SelectTrigger
            className={errors.annualIncome ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select annual income range" />
          </SelectTrigger>
          <SelectContent>
            {incomeRanges.map(range => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.annualIncome && (
          <p className="text-sm text-destructive mt-1">
            {errors.annualIncome.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sourceOfFunds-step4">Source of Funds *</Label>
        <Input
          id="sourceOfFunds-step4"
          {...register("sourceOfFunds")}
          className={errors.sourceOfFunds ? "border-destructive" : ""}
        />
        {errors.sourceOfFunds && (
          <p className="text-sm text-destructive mt-1">
            {errors.sourceOfFunds.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="purposeOfAccount-step4">Purpose of Account *</Label>
        <Input
          id="purposeOfAccount-step4"
          {...register("purposeOfAccount")}
          className={errors.purposeOfAccount ? "border-destructive" : ""}
        />
        {errors.purposeOfAccount && (
          <p className="text-sm text-destructive mt-1">
            {errors.purposeOfAccount.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="documentType-step5">Document Type *</Label>
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
        <Label htmlFor="documentNumber-step5">Document Number *</Label>
        <Input
          id="documentNumber-step5"
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
        <Label htmlFor="documentUpload-step5">Document Upload *</Label>
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
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Personal Information";
      case 2:
        return "Contact Information";
      case 3:
        return "Professional Information";
      case 4:
        return "Additional Information";
      case 5:
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
              Step {currentStep} of 5
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div key={`step-${currentStep}`}>{renderStepContent()}</div>

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

              {currentStep < 5 ? (
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
