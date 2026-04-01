import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/custom.css'
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StatsCounter from '@/components/StatsCounter';
import FeaturedCategories from '@/components/FeaturedCategories';
import Rankings from '@/components/Rankings';
import RecentWork from '@/components/RecentWork';
import HowWorks from '@/components/HowWorks';
import Choice from '@/components/Choice';
import Build from '@/components/Build';
import Footer from '@/components/Footer';

export default function App({ Component, pageProps }) {
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
      <Component {...pageProps} />
    </>
  );
}
