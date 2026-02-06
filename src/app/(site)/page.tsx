import About from "@/components/About";
import Blog from "@/components/Blog";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Cta from "@/components/Cta";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import HeroArea from "@/components/HeroArea";
import Pricing from "@/components/Pricing";
import Screens from "@/components/Screens";
// import Szenzorok from "@/components/Szenzorok";
import Testimonials from "@/components/Testimonials";
// import WorkProcess from "@/components/WorkProcess";
import { integrations } from "@integrations-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Szenzor24",
  description:
    "AI által vezérelt automata levelező program"
};

export default function Home() {
  return (
    <main>
      <HeroArea />
      <Features />
      {/*<About />*/}
      {/*<Szenzorok />*/}
      {/*<WorkProcess />*/}
      <Pricing />
      <Screens />
      {/*<Cta />
      <Testimonials />
      <Faq />
      {integrations.isSanityEnabled && <Blog />}
      <Clients />
      <Contact />*/}
    </main>
  );
}
