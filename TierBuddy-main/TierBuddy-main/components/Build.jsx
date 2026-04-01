import { ArrowRight } from "lucide-react";

export default function Build() {

  return (
    <section className='build_section'>
        <div className="container">
            <div className="build_card_body_div">
                <div className="build_text_div">
                    <img src="/assets/images/b1.png" alt="How it works"className="hiw_mockup_img" />
                    <h1>Build, Rank, and Share — All in One Place</h1>
                    <p>NO ACCOUNT NEEDED. NO DOWNLOADS. JUST START CREATING.</p>
                    <p>Turn your ideas into shareable rankings, explore <br /> what others are creating, and join a growing <br /> community of list makers.</p>
                    <button type='button'>Start Building Your Tier List <ArrowRight size={18} /></button>
                </div>
                <div className="build_bottom_txt">
                    <span>Always Free to Use</span>
                    <span>Create in seconds</span>
                    <span>Made for Creators</span>
                </div>
            </div>
        </div>
    </section>
    
  );
}