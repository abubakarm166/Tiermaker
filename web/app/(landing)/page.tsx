import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsCounter from "@/components/landing/StatsCounter";
import HowWorks from "@/components/landing/HowWorks";
import FeaturedCategories from "@/components/landing/FeaturedCategories";
import MemeMaker from "@/components/landing/MemeMaker";
import GoLive from "@/components/landing/GoLive";
import Rankings from "@/components/landing/Rankings";
import RecentWork from "@/components/landing/RecentWork";
import Choice from "@/components/landing/Choice";
import Build from "@/components/landing/Build";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsCounter />
      <HowWorks />
      <FeaturedCategories />
      <MemeMaker />
      <GoLive />
      <Rankings />
      <RecentWork />
      <Choice />
      <Build />
      <FAQ />
      <Footer />
    </>
  );
}
