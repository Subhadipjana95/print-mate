import { PassportPhotoGenerator } from "@/components/passport-photo-generator";

export const metadata = {
  title: "PrintMate — Passport Photo Generator",
  description:
    "Upload a photo, remove the background automatically with AI, and print a clean passport photo sheet. Download PNG or print directly.",
};

export default function Page() {
  return <PassportPhotoGenerator />;
}
