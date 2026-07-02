import Header from "@/components/Header";
import ProfileHeader from "./component/ProfileHeader";
import ProfileSidebar from "./component/ProfileSidebar";
import Footer from "@/components/Footer";


export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full bg-gray-50">
      <Header />
      <ProfileHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
        <ProfileSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
