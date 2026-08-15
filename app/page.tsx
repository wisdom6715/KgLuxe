import Hero from "@/components/Hero";
import SubHero from "@/components/SubHero";
import CategorySection from "@/components/CategorySection";
import PopularProducts from "@/components/PopularProducts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeLaunchPopup from "@/components/WelcomeLaunch";

export default function Home() {
  return (
    <>
      <WelcomeLaunchPopup />
      <Header />
      <main className="md:px-16 lg:px-32">
        <Hero />
        <SubHero />
        <CategorySection />
        <PopularProducts />
      </main>
      <Footer />
    </>
  );
}