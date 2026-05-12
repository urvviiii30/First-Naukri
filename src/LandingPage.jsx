import Navbar from './Navbar'
import HeroSection from './HeroSection'
import StatsSection from './StatsSection'
import HowItWorks from './HowItWorks'
import FeaturedJobs from './FeaturedJobs'
import CompaniesSection from './CompaniesSection'
import StudentRecruiterSection from './StudentRecruiterSection'
import Testimonials from './Testimonials'
import CTASection from './CTASection'
import Footer from './Footer'

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <FeaturedJobs />
        <CompaniesSection />
        <StudentRecruiterSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage

