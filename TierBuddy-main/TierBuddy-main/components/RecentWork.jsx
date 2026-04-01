// components/FeaturedCategories.js
import { useState } from 'react';
import WorkTabs from './WorkTabs';

export default function RecentWork() {

    return (
        <section className='recentwork_section'>
            <div className="container">
                <div className="my_title_div">
                    <span>our recent work</span>
                    <h2>Fresh Tier Lists from the Community</h2>
                    <p>Explore the latest tier lists created by users across gaming, entertainment, sports, and more.</p>
                </div>
                <WorkTabs />
                <div className="btn_load_more">
                    <button type='button'>Load More</button>
                </div>
            </div>
        </section>
    );
}