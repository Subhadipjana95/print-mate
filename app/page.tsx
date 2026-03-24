import type { Metadata } from "next";
import { PassportPhotoGenerator } from "@/components/passport-photo-generator";

export const metadata: Metadata = {
  title: "Passport Photo Generator",
  description:
    "Upload your photo, remove background with AI, and generate a compliant 4 x 6 in passport photo sheet ready to print or download.",
  alternates: {
    canonical: "/",
  },
};

export default function Page() {
  return <PassportPhotoGenerator />;
}
