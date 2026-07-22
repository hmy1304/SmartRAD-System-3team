import Header from "@/component/layout/Header/Header";
import Footer from "@/component/layout/Footer/Footer";
import Hero from "@/component/sections/Hero/Hero";
import Features from "@/component/sections/Features/Features";
import Workflow from "@/component/sections/Workflow/Workflow";
import Payroll from "@/component/sections/Payroll/Payroll";
import Onboarding from "@/component/sections/Onboarding/Onboarding";
import Pricing from "@/component/sections/Pricing/Pricing";
import FinalCta from "@/component/sections/FinalCta/FinalCta";
import FloatingButtons from "@/component/common/FloatingButtons/FloatingButtons";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <Payroll />
        <Onboarding />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />

      <FloatingButtons />
    </>
  );
}
