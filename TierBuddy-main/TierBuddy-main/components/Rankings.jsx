// components/FeaturedCategories.js
import { useState } from 'react';
import VotingCardsSwiper from './VotingCardsSwiper';

export default function Rankings() {

  return (
    <section className='rankings_section'>
        <div className="container">
            <div className="ranking_card_body_div">
                <div className="my_title_div">
                    <span>Live</span>
                    <h2>Live Community Rankings</h2>
                    <p>See what the community is voting on right now. Rankings update in real time as creators and fans submit their picks.</p>
                </div>
                <div className="ranking_swiper_main">
                    <VotingCardsSwiper />
                </div>
            </div>
        </div>
    </section>
    
  );
}