import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsCounter from "@/components/landing/StatsCounter";
import FeaturedCategories from "@/components/landing/FeaturedCategories";
import Rankings from "@/components/landing/Rankings";
import RecentWork from "@/components/landing/RecentWork";
import HowWorks from "@/components/landing/HowWorks";
import Choice from "@/components/landing/Choice";
import Build from "@/components/landing/Build";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsCounter />
      <FeaturedCategories />
      <Rankings />
      <RecentWork />
      <HowWorks />
      <Choice />
      <Build />
      <Footer />
    </>
  );
}
