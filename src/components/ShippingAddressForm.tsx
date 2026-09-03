"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Info,
  BookmarkPlus,
  Check
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

/**
 * Standard list of 28 States and 8 Union Territories of India
 */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

/**
 * Fast-lookup dictionary for India postal zones (instant offline mock fallback)
 */
const PINCODE_MOCK_DIRECTORY: Record<string, { city: string; state: (typeof INDIAN_STATES)[number] }> = {
  "11": { city: "New Delhi", state: "Delhi" },
  "12": { city: "Gurugram", state: "Haryana" },
  "13": { city: "Ambala", state: "Haryana" },
  "14": { city: "Amritsar", state: "Punjab" },
  "16": { city: "Chandigarh", state: "Chandigarh" },
  "20": { city: "Noida", state: "Uttar Pradesh" },
  "22": { city: "Lucknow", state: "Uttar Pradesh" },
  "24": { city: "Dehradun", state: "Uttarakhand" },
  "28": { city: "Agra", state: "Uttar Pradesh" },
  "30": { city: "Jaipur", state: "Rajasthan" },
  "31": { city: "Udaipur", state: "Rajasthan" },
  "34": { city: "Jodhpur", state: "Rajasthan" },
  "36": { city: "Rajkot", state: "Gujarat" },
  "38": { city: "Ahmedabad", state: "Gujarat" },
  "39": { city: "Surat", state: "Gujarat" },
  "40": { city: "Mumbai", state: "Maharashtra" },
  "41": { city: "Pune", state: "Maharashtra" },
  "42": { city: "Nashik", state: "Maharashtra" },
  "44": { city: "Nagpur", state: "Maharashtra" },
  "45": { city: "Indore", state: "Madhya Pradesh" },
  "46": { city: "Bhopal", state: "Madhya Pradesh" },
  "49": { city: "Raipur", state: "Chhattisgarh" },
  "50": { city: "Hyderabad", state: "Telangana" },
  "52": { city: "Vijayawada", state: "Andhra Pradesh" },
  "53": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "56": { city: "Bengaluru", state: "Karnataka" },
  "57": { city: "Mangaluru", state: "Karnataka" },
  "60": { city: "Chennai", state: "Tamil Nadu" },
  "62": { city: "Madurai", state: "Tamil Nadu" },
  "64": { city: "Coimbatore", state: "Tamil Nadu" },
  "68": { city: "Kochi", state: "Kerala" },
  "69": { city: "Thiruvananthapuram", state: "Kerala" },
  "70": { city: "Kolkata", state: "West Bengal" },
  "75": { city: "Bhubaneswar", state: "Odisha" },
  "78": { city: "Guwahati", state: "Assam" },
  "80": { city: "Patna", state: "Bihar" },
  "83": { city: "Ranchi", state: "Jharkhand" },
};

/**
 * Strict Zod Validation Schema for Indian Address Compliance
 */
export const shippingAddressSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),

  lastName: z
    .string()
    .trim()
    .regex(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g. name@example.com)"),

  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits without prefix")
    .refine((val) => /^[6-9]/.test(val), {
      message: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9",
    }),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "PIN code must be exactly 6 digits"),

  flatHouse: z
    .string()
    .trim()
    .min(1, "Flat, House no., or Building name is required")
    .max(100, "Maximum 100 characters allowed"),

  areaStreet: z
    .string()
    .trim()
    .min(1, "Area, Street, Sector, or Village is required")
    .max(100, "Maximum 100 characters allowed"),

  landmark: z
    .string()
    .trim()
    .max(100, "Maximum 100 characters allowed")
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(60, "City name is too long"),

  state: z
    .string()
    .min(1, "Please select a state")
    .refine((val) => INDIAN_STATES.includes(val as any), {
      message: "Please select a valid Indian State or Union Territory",
    }),
});

export type ShippingAddressFormValues = z.infer<typeof shippingAddressSchema>;

/**
 * Consolidated payload schema formatted for Shiprocket & Razorpay
 */
export interface ConsolidatedShippingPayload {
  // Shiprocket Adhoc payload fields
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_state: string;
  billing_pincode: string;
  billing_email: string;
  billing_phone: string;

  // Normalized structured object for Firestore & Order storage
  shippingAddress: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    flatHouse: string;
    areaStreet: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

/**
 * Formats validated form values into Shiprocket and Razorpay payloads
 */
export function consolidateShippingAddress(
  data: ShippingAddressFormValues
): ConsolidatedShippingPayload {
  const firstNameClean = data.firstName.trim();
  const lastNameClean = (data.lastName || "").trim();
  const fullName = lastNameClean ? `${firstNameClean} ${lastNameClean}` : firstNameClean;

  // Shiprocket constraint: combine Flat/House with Area/Street into billing_address
  const billingAddress = `${data.flatHouse.trim()}, ${data.areaStreet.trim()}`;
  const billingAddress2 = (data.landmark || "").trim();

  return {
    billing_customer_name: fullName,
    billing_last_name: lastNameClean || undefined,
    billing_address: billingAddress,
    billing_address_2: billingAddress2,
    billing_city: data.city.trim(),
    billing_state: data.state.trim(),
    billing_pincode: data.pincode.trim(),
    billing_email: data.email.trim().toLowerCase(),
    billing_phone: data.phone.trim(),
    shippingAddress: {
      firstName: firstNameClean,
      lastName: lastNameClean,
      fullName,
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      flatHouse: data.flatHouse.trim(),
      areaStreet: data.areaStreet.trim(),
      landmark: billingAddress2,
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
      country: "India",
    },
  };
}

interface ShippingAddressFormProps {
  initialValues?: Partial<ShippingAddressFormValues>;
  onSubmit: (consolidated: ConsolidatedShippingPayload) => void | Promise<void>;
  isLoading?: boolean;
  submitButtonText?: string;
  formId?: string;
  showSubmitButton?: boolean;
  onAddressSaved?: (savedAddress: any) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function ShippingAddressForm({
  initialValues,
  onSubmit,
  isLoading = false,
  submitButtonText = "Continue to Razorpay Payment",
  formId = "shipping-address-form",
  showSubmitButton = false,
  onAddressSaved,
  onValidationChange,
}: ShippingAddressFormProps) {
  const { user, firebaseUser, openAuthModal } = useAuth();

  const [isDetectingPincode, setIsDetectingPincode] = useState(false);
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);

  // Save Address state
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAddressesList, setSavedAddressesList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    mode: "onChange",
    defaultValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      email: initialValues?.email || "",
      phone: initialValues?.phone || "",
      pincode: initialValues?.pincode || "",
      flatHouse: initialValues?.flatHouse || "",
      areaStreet: initialValues?.areaStreet || "",
      landmark: initialValues?.landmark || "",
      city: initialValues?.city || "",
      state: initialValues?.state || "",
    },
  });

  // Notify parent of live validity
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const watchedPincode = watch("pincode");
  const watchedFlatHouse = watch("flatHouse");
  const watchedPhone = watch("phone");

  // Check if current form address is already saved
  const isAddressAlreadySaved = useMemo(() => {
    if (!savedAddressesList || savedAddressesList.length === 0) return false;
    const cleanPincode = (watchedPincode || "").trim();
    const cleanFlat = (watchedFlatHouse || "").trim().toLowerCase();
    const cleanPhone = (watchedPhone || "").replace(/\D/g, "");

    if (!cleanPincode || !cleanFlat) return false;

    return savedAddressesList.some((saved) => {
      const savedPincode = (saved.pincode || saved.zip || "").trim();
      const savedFlat = (saved.flatHouse || saved.street || "").trim().toLowerCase();
      const savedPhone = (saved.phone || "").replace(/\D/g, "");

      const pincodeMatches = savedPincode === cleanPincode;
      const flatMatches =
        savedFlat === cleanFlat ||
        savedFlat.includes(cleanFlat) ||
        cleanFlat.includes(savedFlat);
      const phoneMatches = !savedPhone || !cleanPhone || savedPhone === cleanPhone;

      return pincodeMatches && flatMatches && phoneMatches;
    });
  }, [savedAddressesList, watchedPincode, watchedFlatHouse, watchedPhone]);

  // Fetch authenticated user's saved addresses from MongoDB to provide quick pre-fill
  useEffect(() => {
    if (!firebaseUser) return;
    let isSubscribed = true;

    const fetchSavedAddresses = async () => {
      try {
        const targetUserId = user?._id || firebaseUser.uid;
        const res = await api.get(`/api/user/address/${targetUserId}`);
        const list = Array.isArray(res.data) ? res.data : (res.data?.addresses || []);
        if (Array.isArray(list) && list.length > 0 && isSubscribed) {
          setSavedAddressesList(list);
        }
      } catch (err) {
        console.error("Failed to load user saved addresses from MongoDB:", err);
      }
    };

    fetchSavedAddresses();
    return () => {
      isSubscribed = false;
    };
  }, [firebaseUser]);

  // Auto-fill City & State whenever 6 digits are entered in PIN code
  useEffect(() => {
    const cleanPin = (watchedPincode || "").replace(/\D/g, "");
    if (cleanPin.length === 6) {
      let isSubscribed = true;
      setIsDetectingPincode(true);

      const performPincodeLookup = async () => {
        try {
          const prefix2 = cleanPin.slice(0, 2);
          const mockMatch = PINCODE_MOCK_DIRECTORY[prefix2];

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              if (data?.[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
                const po = data[0].PostOffice[0];
                const detectedCity = po.District || po.Block || po.Circle;
                const detectedState = po.State;

                if (isSubscribed) {
                  if (detectedCity) {
                    setValue("city", detectedCity, { shouldValidate: true, shouldDirty: true });
                  }
                  if (detectedState && INDIAN_STATES.includes(detectedState as any)) {
                    setValue("state", detectedState as any, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                  setPincodeAutoFilled(true);
                  setIsDetectingPincode(false);
                  return;
                }
              }
            }
          } catch {
            // Graceful fallback to mock directory on network timeout
          }

          if (mockMatch && isSubscribed) {
            setValue("city", mockMatch.city, { shouldValidate: true, shouldDirty: true });
            setValue("state", mockMatch.state, { shouldValidate: true, shouldDirty: true });
            setPincodeAutoFilled(true);
          }
        } finally {
          if (isSubscribed) {
            setIsDetectingPincode(false);
          }
        }
      };

      performPincodeLookup();

      return () => {
        isSubscribed = false;
      };
    } else {
      setPincodeAutoFilled(false);
    }
  }, [watchedPincode, setValue]);

  // Handle saving address to Firestore
  const handleSaveAddress = async () => {
    setSaveError(null);

    // Require authentication before saving address
    if (!firebaseUser) {
      openAuthModal?.();
      return;
    }

    // Trigger validation on current form fields
    const isValid = await trigger();
    if (!isValid) {
      setSaveError("Please fill out all required fields before saving.");
      setTimeout(() => setSaveError(null), 4000);
      return;
    }

    setIsSavingAddress(true);
    try {
      const data = getValues();

      const addressToSave = {
        fullName: `${data.firstName.trim()} ${(data.lastName || "").trim()}`.trim(),
        phone: data.phone.trim(),
        flatHouse: data.flatHouse.trim(),
        areaStreet: data.areaStreet.trim(),
        landmark: (data.landmark || "").trim(),
        street: `${data.flatHouse.trim()}, ${data.areaStreet.trim()}`,
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        zip: data.pincode.trim(),
        isDefault: savedAddressesList.length === 0,
      };

      const targetUserId = user?._id || firebaseUser?.uid;

      // Call backend API to save address to MongoDB using $push
      const res = await api.post("/api/user/address", {
        userId: targetUserId,
        address: addressToSave,
        ...addressToSave,
      });
      const saved = res.data?.address || addressToSave;

      setSavedAddressesList((prev) => [...prev, saved]);
      setSaveSuccess(true);
      onAddressSaved?.(saved);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error("Error saving address to MongoDB:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to save address. Please try again.";
      setSaveError(errorMsg);
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const onFormSubmit = (data: ShippingAddressFormValues) => {
    const consolidated = consolidateShippingAddress(data);
    onSubmit(consolidated);
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onFormSubmit)}
      noValidate
      className="bg-white dark:bg-[#1a120e] border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl p-6 md:p-8 transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center text-sm font-bold border border-amber-300/40 dark:border-amber-700/40">
            1
          </span>
          <div>
            <h2 className="text-xl font-serif text-stone-800 dark:text-stone-200 font-semibold tracking-wide">
              Shipping Information
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Verified courier standard for automated Shiprocket dispatch
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>India Delivery</span>
        </div>
      </div>

      {/* Saved Addresses Quick Pre-fill (if available) */}
      {savedAddressesList.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-stone-50 dark:bg-[#241a14] border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-amber-300 flex items-center gap-1.5">
              <BookmarkPlus className="w-3.5 h-3.5" />
              Use Saved Address
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              {savedAddressesList.length} saved
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedAddressesList.map((addr, idx) => (
              <button
                key={addr.id || idx}
                type="button"
                onClick={() => {
                  setValue("firstName", addr.firstName || (addr.fullName ? addr.fullName.split(" ")[0] : ""), { shouldValidate: true, shouldDirty: true });
                  setValue("lastName", addr.lastName || (addr.fullName ? addr.fullName.split(" ").slice(1).join(" ") : ""), { shouldValidate: true, shouldDirty: true });
                  if (addr.email) setValue("email", addr.email, { shouldValidate: true, shouldDirty: true });
                  if (addr.phone) setValue("phone", addr.phone, { shouldValidate: true, shouldDirty: true });
                  if (addr.pincode || addr.zip) setValue("pincode", addr.pincode || addr.zip, { shouldValidate: true, shouldDirty: true });
                  if (addr.flatHouse) setValue("flatHouse", addr.flatHouse, { shouldValidate: true, shouldDirty: true });
                  else if (addr.street) setValue("flatHouse", addr.street.split(",")[0] || addr.street, { shouldValidate: true, shouldDirty: true });
                  if (addr.areaStreet) setValue("areaStreet", addr.areaStreet, { shouldValidate: true, shouldDirty: true });
                  else if (addr.street && addr.street.includes(",")) setValue("areaStreet", addr.street.split(",").slice(1).join(",").trim(), { shouldValidate: true, shouldDirty: true });
                  if (addr.landmark) setValue("landmark", addr.landmark, { shouldValidate: true, shouldDirty: true });
                  if (addr.city) setValue("city", addr.city, { shouldValidate: true, shouldDirty: true });
                  if (addr.state) setValue("state", addr.state, { shouldValidate: true, shouldDirty: true });
                }}
                className="text-left p-3 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-amber-600/40 bg-white dark:bg-[#1a120e] hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all text-xs cursor-pointer group shadow-sm"
              >
                <div className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-[#6b1414] dark:group-hover:text-amber-300 line-clamp-1">
                  {addr.fullName || addr.street || `Address ${idx + 1}`}
                </div>
                <div className="text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                  {addr.street || addr.addressLine || `${addr.flatHouse || ""}, ${addr.areaStreet || ""}`}
                </div>
                <div className="text-stone-400 dark:text-stone-500 text-[11px] mt-0.5">
                  {addr.city}, {addr.state} - {addr.zip || addr.pincode}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* SECTION 1: Personal & Contact Information */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-1.5 font-serif">
            <User className="w-3.5 h-3.5 text-[#6b1414] dark:text-amber-400" />
            Contact & Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="e.g. Rahul"
                {...register("firstName")}
                className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                  errors.firstName
                    ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                    : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                }`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Last Name <span className="text-stone-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="e.g. Sharma"
                {...register("lastName")}
                className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                  errors.lastName
                    ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                    : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                }`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                placeholder="rahul.sharma@example.com"
                {...register("email")}
                className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                  errors.email
                    ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                    : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number with +91 visual badge */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
              >
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="inline-flex items-center px-3 py-2.5 rounded-l-lg border border-r-0 border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  maxLength={10}
                  placeholder="9876543210"
                  {...register("phone")}
                  className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-r-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                    errors.phone
                      ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Physical Address Grouping */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-serif">
              <MapPin className="w-3.5 h-3.5 text-[#6b1414] dark:text-amber-400" />
              Delivery Address
            </h3>
            <span className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Separate building & area for courier accuracy
            </span>
          </div>

          <div className="space-y-4">
            {/* PIN Code with Auto-Detection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="pincode"
                    className="block text-xs font-medium text-stone-700 dark:text-stone-300"
                  >
                    6-digit PIN Code <span className="text-red-500">*</span>
                  </label>
                  {isDetectingPincode && (
                    <span className="text-[11px] text-[#6b1414] dark:text-amber-400 font-medium flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Detecting location...
                    </span>
                  )}
                  {pincodeAutoFilled && !isDetectingPincode && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Auto-detected
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  id="pincode"
                  maxLength={6}
                  placeholder="e.g. 560001"
                  {...register("pincode")}
                  className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                    errors.pincode
                      ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                  }`}
                />
                {errors.pincode && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.pincode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address Line 1 & Line 2 Container */}
            <div className="bg-stone-50/60 dark:bg-[#160f0b] p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-4">
              {/* Flat, House no., Building, Apartment */}
              <div>
                <label
                  htmlFor="flatHouse"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Flat, House no., Building, Apartment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="flatHouse"
                  maxLength={100}
                  placeholder="e.g. Flat 402, Signature Towers, Block B"
                  {...register("flatHouse")}
                  className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                    errors.flatHouse
                      ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.flatHouse ? (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.flatHouse.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 dark:text-stone-500">
                      Maps to Shiprocket primary billing address
                    </p>
                  )}
                </div>
              </div>

              {/* Area, Street, Sector, Village */}
              <div>
                <label
                  htmlFor="areaStreet"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Area, Street, Sector, Village <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="areaStreet"
                  maxLength={100}
                  placeholder="e.g. Indiranagar 100ft Road, HAL 2nd Stage"
                  {...register("areaStreet")}
                  className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                    errors.areaStreet
                      ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.areaStreet ? (
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.areaStreet.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 dark:text-stone-500">
                      Appended seamlessly for accurate delivery routing
                    </p>
                  )}
                </div>
              </div>

              {/* Landmark (Optional) */}
              <div>
                <label
                  htmlFor="landmark"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Landmark <span className="text-stone-400 text-[11px] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="landmark"
                  maxLength={100}
                  placeholder="e.g. Near Apollo Pharmacy, Opposite Metro Pillar 128"
                  {...register("landmark")}
                  className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                    errors.landmark
                      ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                  }`}
                />
                {errors.landmark && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.landmark.message}
                  </p>
                )}
              </div>
            </div>

            {/* City & State Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  Town / City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  placeholder="e.g. Bengaluru"
                  {...register("city")}
                  className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none ${
                    errors.city
                      ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                  }`}
                />
                {errors.city && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* State Dropdown */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  State / Union Territory <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  {...register("state")}
                  className={`w-full bg-[#f8f9fa] dark:bg-[#120c09] border text-stone-900 dark:text-stone-100 rounded-lg px-3.5 py-2.5 text-sm transition-all outline-none cursor-pointer ${
                    errors.state
                      ? "border-red-500 ring-1 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20"
                      : "border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600"
                  }`}
                >
                  <option value="" className="text-stone-500">Select State</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st} className="text-stone-900 dark:text-stone-100 bg-white dark:bg-[#1a120e]">
                      {st}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Address & Payment Actions */}
        <div className="pt-3 space-y-3">
          {/* Secondary Button: Save Address to Account */}
          {isAddressAlreadySaved ? (
            <button
              type="button"
              disabled={true}
              className="w-full bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-medium py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 text-sm cursor-not-allowed opacity-80 shadow-none"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              <span>Address Already Saved</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveAddress}
              disabled={isSavingAddress}
              className="w-full bg-transparent border border-amber-600/40 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium py-3.5 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              {isSavingAddress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-700 dark:text-amber-300" />
                  <span>Saving Address to Account...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Address Saved to Account!
                  </span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  <span>Save Address to Account</span>
                </>
              )}
            </button>
          )}

          {saveError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {saveError}
            </p>
          )}

          {/* Primary Action Button: Submit Button */}
          {showSubmitButton && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6b1414] hover:bg-[#801818] text-white font-medium py-4 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating & Preparing Payment...</span>
                </>
              ) : (
                <span>{submitButtonText}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
