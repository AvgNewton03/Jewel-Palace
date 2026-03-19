import CustomerGallery from "@/components/CustomerGallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Gallery | Jewel Palace",
  description: "Explore our exquisite collection of artificial jewelry.",
};

export default function GalleryPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <CustomerGallery />
    </div>
  );
}
